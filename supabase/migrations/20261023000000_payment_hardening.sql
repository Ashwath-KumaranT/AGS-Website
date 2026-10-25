-- Payment-path hardening.
--
-- 1. A declined card inside a still-open Stripe Checkout session must not fail the order:
--    the shopper can try another card in the same session. `payment_intent.payment_failed`
--    now only records the attempt (record_payment_attempt); the order is failed only when
--    the session itself expires or an async payment fails.
-- 2. If an order was failed before a late success arrives, mark_order_paid recovers it:
--    the money has been taken, so the order becomes paid even when stock can no longer be
--    reserved — the shortfall is recorded for fulfilment to resolve.
-- 3. Orders left pending_payment (the shopper never reached the provider, or the session
--    vanished) hold stock forever. expire_stale_pending_orders releases them.
-- 4. place_order rejects unserviceable postal codes, mirroring src/lib/delivery.ts.
-- 5. Coupon usage limits count orders awaiting payment, not just paid ones.
-- 6. Return requests must name items that belong to the order and are not already returned.

-- ---------------------------------------------------------------- coupons

/** Coupon uses held by orders that are awaiting payment but not yet paid. */
create function public.coupon_pending_count(p_code text)
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::int from public.orders
  where coupon_code = p_code and status = 'pending_payment'
$$;

-- ---------------------------------------------------------------- quoting

/**
 * Authoritative quote. p_lines: [{ "variant_id": text, "quantity": int }]
 * Unchanged from the initial migration except that the usage-limit check now also counts
 * coupon uses held by orders awaiting payment.
 */
create or replace function public.quote_order(p_lines jsonb, p_coupon text, p_delivery text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_line      jsonb;
  v_variant   record;
  v_qty       integer;
  v_lines     jsonb := '[]';
  v_issues    jsonb := '[]';
  v_subtotal  integer := 0;
  v_savings   integer := 0;
  v_coupon    public.coupons;
  v_discount  integer := 0;
  v_shipping  integer;
  v_tax       integer;
begin
  if p_delivery not in ('standard', 'express', 'next_day') then
    raise exception 'invalid delivery option';
  end if;

  for v_line in select * from jsonb_array_elements(coalesce(p_lines, '[]')) loop
    v_qty := greatest(1, least((v_line ->> 'quantity')::int, 10));
    select v.*, p.compare_at_price, p.status as product_status into v_variant
      from public.product_variants v join public.products p on p.id = v.product_id
      where v.id = v_line ->> 'variant_id';
    if not found or v_variant.product_status <> 'active' then
      v_issues := v_issues || jsonb_build_object('code', 'variant_removed', 'variantId', v_line ->> 'variant_id', 'message', 'An item is no longer available.');
      continue;
    end if;
    if v_variant.inventory_count <= 0 then
      v_issues := v_issues || jsonb_build_object('code', 'out_of_stock', 'variantId', v_variant.id, 'message', 'An item in your bag is sold out.');
      continue;
    end if;
    if v_qty > v_variant.inventory_count then
      v_issues := v_issues || jsonb_build_object('code', 'insufficient_stock', 'variantId', v_variant.id,
        'message', format('Only %s left of one of your items.', v_variant.inventory_count));
      v_qty := v_variant.inventory_count;
    end if;
    v_subtotal := v_subtotal + v_variant.price * v_qty;
    if v_variant.compare_at_price is not null and v_variant.compare_at_price > v_variant.price then
      v_savings := v_savings + (v_variant.compare_at_price - v_variant.price) * v_qty;
    end if;
    v_lines := v_lines || jsonb_build_object('variantId', v_variant.id, 'productId', v_variant.product_id,
      'quantity', v_qty, 'unit_price', v_variant.price, 'compare_at_price', v_variant.compare_at_price);
  end loop;

  if p_coupon is not null and length(trim(p_coupon)) > 0 then
    select * into v_coupon from public.coupons c where lower(c.code) = lower(trim(p_coupon));
    if not found then
      v_issues := v_issues || jsonb_build_object('code', 'coupon_invalid', 'message', 'That code is not valid.');
    elsif v_coupon.expires_at is not null and v_coupon.expires_at < now() then
      v_issues := v_issues || jsonb_build_object('code', 'coupon_invalid', 'message', format('Code %s has expired.', v_coupon.code));
      v_coupon := null;
    elsif v_coupon.usage_limit is not null
          and v_coupon.times_used + public.coupon_pending_count(v_coupon.code) >= v_coupon.usage_limit then
      v_issues := v_issues || jsonb_build_object('code', 'coupon_invalid', 'message', format('Code %s has reached its usage limit.', v_coupon.code));
      v_coupon := null;
    elsif v_subtotal < v_coupon.min_subtotal then
      v_issues := v_issues || jsonb_build_object('code', 'coupon_invalid', 'message', format('Spend more to use %s.', v_coupon.code));
      v_coupon := null;
    end if;
  end if;

  if v_coupon.code is not null then
    v_discount := case v_coupon.type
      when 'percent' then least(v_subtotal, round(v_subtotal * v_coupon.value / 100.0)::int)
      when 'fixed' then least(v_subtotal, v_coupon.value)
      else 0 end;
  end if;

  v_shipping := case when jsonb_array_length(v_lines) = 0 then 0
    else public.delivery_price(p_delivery, v_subtotal - v_discount, v_coupon.type = 'free_shipping') end;
  v_tax := round((v_subtotal - v_discount) * 0.08)::int;

  return jsonb_build_object(
    'lines', v_lines,
    'issues', v_issues,
    'coupon', case when v_coupon.code is null then null else to_jsonb(v_coupon) end,
    'totals', jsonb_build_object(
      'subtotal', v_subtotal, 'discount', v_discount, 'shipping', v_shipping, 'tax', v_tax,
      'total', v_subtotal - v_discount + v_shipping + v_tax, 'savings', v_savings,
      'freeShipping', v_shipping = 0 and jsonb_array_length(v_lines) > 0));
end $$;

-- ---------------------------------------------------------------- serviceability

/** Mirrors checkDeliveryForPostalCode in src/lib/delivery.ts. */
create function public.postal_code_serviceable(p_code text)
returns boolean language sql immutable as $$
  select btrim(coalesce(p_code, '')) ~ '^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$'
     and btrim(coalesce(p_code, '')) !~ '000$'
$$;

-- ---------------------------------------------------------------- order lifecycle

/**
 * Atomically re-prices the bag, reserves stock and creates a pending order.
 * Unchanged from the initial migration except for the postal-code check.
 */
create or replace function public.place_order(
  p_lines jsonb, p_coupon text, p_delivery text, p_email text, p_address jsonb, p_expected_total integer
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user   uuid := auth.uid();
  v_quote  jsonb;
  v_issue  jsonb;
  v_order  uuid;
  v_line   jsonb;
  v_min    integer;
  v_max    integer;
  v_rows   integer;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  if p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'invalid contact email'; end if;
  if coalesce(p_address ->> 'name', '') = '' or coalesce(p_address ->> 'line1', '') = ''
     or coalesce(p_address ->> 'city', '') = '' or coalesce(p_address ->> 'postal_code', '') = ''
     or coalesce(p_address ->> 'country', '') = '' or coalesce(p_address ->> 'phone', '') = '' then
    raise exception 'invalid shipping address';
  end if;
  if not public.postal_code_serviceable(p_address ->> 'postal_code') then
    raise exception 'We don''t deliver to this postal code yet.';
  end if;

  -- lock the variants so concurrent checkouts can't oversell
  perform 1 from public.product_variants
    where id in (select l ->> 'variant_id' from jsonb_array_elements(p_lines) l) for update;

  v_quote := public.quote_order(p_lines, p_coupon, p_delivery);
  if jsonb_array_length(v_quote -> 'lines') = 0 then raise exception 'your bag is empty'; end if;
  for v_issue in select * from jsonb_array_elements(v_quote -> 'issues') loop
    if v_issue ->> 'code' = 'coupon_invalid' then raise exception 'coupon: %', v_issue ->> 'message'; end if;
    raise exception 'stock: %', v_issue ->> 'message';
  end loop;
  if p_expected_total is not null and p_expected_total <> (v_quote -> 'totals' ->> 'total')::int then
    raise exception 'price changed since you last reviewed your order';
  end if;

  select min_days, max_days into v_min, v_max from (values
    ('standard', 4, 6), ('express', 2, 3), ('next_day', 1, 1)) d(id, min_days, max_days) where d.id = p_delivery;

  insert into public.orders (user_id, contact_email, shipping_address, delivery_option, coupon_code, totals, estimated_delivery)
  values (v_user, lower(p_email), p_address - 'is_default', p_delivery, v_quote -> 'coupon' ->> 'code', v_quote -> 'totals',
          jsonb_build_object('from', now() + make_interval(days => v_min), 'to', now() + make_interval(days => v_max)))
  returning id into v_order;

  for v_line in select * from jsonb_array_elements(v_quote -> 'lines') loop
    update public.product_variants set inventory_count = inventory_count - (v_line ->> 'quantity')::int
      where id = v_line ->> 'variantId' and inventory_count >= (v_line ->> 'quantity')::int;
    get diagnostics v_rows = row_count;
    if v_rows = 0 then raise exception 'stock: an item sold out while you were checking out'; end if;

    insert into public.order_items (order_id, product_id, variant_id, title, slug, color, size, image_url, unit_price, quantity, line_total)
    select v_order, p.id, v.id, p.title, p.slug, v.color, v.size, coalesce(v.image_urls[1], ''),
           (v_line ->> 'unit_price')::int, (v_line ->> 'quantity')::int,
           (v_line ->> 'unit_price')::int * (v_line ->> 'quantity')::int
    from public.product_variants v join public.products p on p.id = v.product_id
    where v.id = v_line ->> 'variantId';
  end loop;

  insert into public.payments (order_id, amount) values (v_order, (v_quote -> 'totals' ->> 'total')::int);
  return jsonb_build_object('order_id', v_order);
end $$;

/**
 * Records a failed payment attempt without closing the order. Stripe Checkout keeps the
 * session open after a decline so the shopper can try another card; failing the order here
 * would release its stock and leave a later success unable to settle it.
 */
create function public.record_payment_attempt(p_order_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.payments set failure_reason = p_reason, updated_at = now()
  where order_id = p_order_id
    and exists (select 1 from public.orders o where o.id = p_order_id and o.status = 'pending_payment');
end $$;

/**
 * Marks an order paid. Also recovers an order that was already failed (its stock released)
 * when a late success arrives: the shopper has been charged, so the order is honoured even
 * if stock can no longer be reserved — the shortfall is left for fulfilment to resolve.
 */
create or replace function public.mark_order_paid(p_order_id uuid, p_provider_ref text, p_brand text, p_last4 text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_order     public.orders;
  v_item      record;
  v_rows      integer;
  v_shortfall text[] := '{}';
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found or v_order.status not in ('pending_payment', 'payment_failed') then return; end if; -- idempotent

  -- the failed path released this order's stock; take it back before confirming
  if v_order.status = 'payment_failed' then
    for v_item in select variant_id, quantity from public.order_items where order_id = p_order_id loop
      update public.product_variants set inventory_count = inventory_count - v_item.quantity
        where id = v_item.variant_id and inventory_count >= v_item.quantity;
      get diagnostics v_rows = row_count;
      if v_rows = 0 then v_shortfall := v_shortfall || v_item.variant_id; end if;
    end loop;
  end if;

  update public.orders set status = 'paid' where id = p_order_id;
  update public.payments set status = 'succeeded', provider_ref = p_provider_ref, brand = p_brand, last4 = p_last4,
                             failure_reason = null, updated_at = now()
    where order_id = p_order_id;
  insert into public.shipments (order_id, carrier, tracking_number, eta, events)
  values (p_order_id, 'ParcelPoint', 'PP' || lpad((floor(random() * 1e10))::bigint::text, 10, '0'),
          (v_order.estimated_delivery ->> 'to')::timestamptz,
          jsonb_build_array(jsonb_build_object('status', 'paid', 'label', 'Order confirmed', 'location', 'ASG', 'at', now())))
  on conflict (order_id) do nothing;
  if v_order.coupon_code is not null then
    update public.coupons set times_used = times_used + 1 where code = v_order.coupon_code;
  end if;
  insert into public.notifications (user_id, type, title, body)
  values (v_order.user_id, 'order', format('Order %s confirmed', v_order.number), 'Thanks for your order — we are getting it ready to ship.');

  if array_length(v_shortfall, 1) is not null then
    raise warning 'order % paid but % item(s) could not be re-reserved: %',
      v_order.number, array_length(v_shortfall, 1), v_shortfall;
  end if;
end $$;

-- Releases stock held by orders that never reached the payment provider. Schedule it with
-- pg_cron, e.g. every five minutes:
--   select cron.schedule('expire-orders', '*/5 * * * *',
--                        'select public.expire_stale_pending_orders()');
create function public.expire_stale_pending_orders(p_older_than interval default interval '30 minutes')
returns integer language plpgsql security definer set search_path = public as $$
declare v_order record; v_count integer := 0;
begin
  for v_order in
    select id from public.orders
    where status = 'pending_payment' and created_at < now() - p_older_than
    for update skip locked
  loop
    perform public.release_order_stock(v_order.id);
    update public.orders set status = 'payment_failed' where id = v_order.id;
    update public.payments set status = 'failed', failure_reason = 'Payment was not completed in time.',
                               updated_at = now()
      where order_id = v_order.id;
    v_count := v_count + 1;
  end loop;
  return v_count;
end $$;

-- ---------------------------------------------------------------- returns

/**
 * Validates the requested items: they must belong to the order and must not already be
 * part of a return that has not been rejected.
 */
create or replace function public.before_return_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_foreign integer; v_duplicate integer;
begin
  if coalesce(array_length(new.item_ids, 1), 0) = 0 then
    raise exception 'Select at least one item to return.';
  end if;

  select count(*) into v_foreign
  from unnest(new.item_ids) as requested(id)
  where not exists (
    select 1 from public.order_items i where i.id = requested.id and i.order_id = new.order_id);
  if v_foreign > 0 then raise exception 'Those items are not part of this order.'; end if;

  select count(*) into v_duplicate
  from public.return_requests r
  where r.order_id = new.order_id and r.status <> 'rejected' and r.item_ids && new.item_ids;
  if v_duplicate > 0 then
    raise exception 'A return has already been requested for one of those items.';
  end if;

  select o.number into new.order_number from public.orders o where o.id = new.order_id;
  new.status := 'requested';
  return new;
end $$;

-- ---------------------------------------------------------------- function privileges

revoke all on function public.record_payment_attempt(uuid, text) from public, anon, authenticated;
revoke all on function public.expire_stale_pending_orders(interval) from public, anon, authenticated;
grant execute on function public.record_payment_attempt(uuid, text) to service_role;
grant execute on function public.expire_stale_pending_orders(interval) to service_role;
grant execute on function public.coupon_pending_count(text) to anon, authenticated;
