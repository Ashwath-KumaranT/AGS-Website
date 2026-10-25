-- ASG — initial schema
-- Column names mirror src/types/index.ts so the frontend adapter needs no mapping.
-- All money is integer cents. Clients may READ catalogue data and their own rows;
-- every write that affects money, stock or order state goes through the
-- SECURITY DEFINER functions below or the Edge Functions (service role).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- catalogue

create table public.categories (
  id          text primary key,
  name        text not null,
  slug        text not null unique,
  parent_id   text references public.categories (id),
  image_url   text not null,
  description text
);

create table public.products (
  id               text primary key,
  slug             text not null unique,
  title            text not null,
  description      text not null default '',
  brand            text not null,
  category_id      text not null references public.categories (id),
  gender           text not null check (gender in ('men', 'women', 'kids', 'unisex')),
  price            integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= 0),
  material         text not null default '',
  care             text[] not null default '{}',
  details          text[] not null default '{}',
  status           text not null default 'active' check (status in ('active', 'draft', 'archived')),
  rating           numeric(2, 1) not null default 0,
  review_count     integer not null default 0,
  is_new           boolean not null default false,
  is_best_seller   boolean not null default false,
  created_at       timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);

create table public.product_variants (
  id              text primary key,
  product_id      text not null references public.products (id) on delete cascade,
  color           text not null,
  color_hex       text not null,
  size            text not null,
  sku             text not null unique,
  price           integer not null check (price >= 0),
  inventory_count integer not null default 0 check (inventory_count >= 0),
  image_urls      text[] not null default '{}',
  unique (product_id, color, size)
);
create index product_variants_product_idx on public.product_variants (product_id);

create table public.coupons (
  code         text primary key,
  type         text not null check (type in ('percent', 'fixed', 'free_shipping')),
  value        integer not null default 0,
  min_subtotal integer not null default 0,
  expires_at   timestamptz,
  description  text not null default '',
  usage_limit  integer,
  times_used   integer not null default 0,
  is_public    boolean not null default false
);

-- ---------------------------------------------------------------- customers

create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text not null default '',
  email      text not null,
  phone      text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  phone       text not null,
  line1       text not null,
  line2       text not null default '',
  city        text not null,
  state       text not null,
  postal_code text not null,
  country     text not null,
  is_default  boolean not null default false
);
create unique index addresses_one_default on public.addresses (user_id) where is_default;

create table public.wishlist_items (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.payment_methods (
  id         text primary key, -- provider payment-method id (tokenised)
  user_id    uuid not null references auth.users (id) on delete cascade,
  brand      text not null,
  last4      text not null,
  exp_month  integer not null,
  exp_year   integer not null,
  is_default boolean not null default false
);

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  type       text not null check (type in ('order', 'promo', 'account')),
  title      text not null,
  body       text not null default '',
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- orders

create sequence public.order_number_seq start 100231;

create table public.orders (
  id                 uuid primary key default gen_random_uuid(),
  number             text not null unique default ('ASG-' || nextval('public.order_number_seq')),
  user_id            uuid not null references auth.users (id),
  status             text not null default 'pending_payment' check (status in (
                       'pending_payment', 'payment_failed', 'paid', 'processing', 'shipped',
                       'out_for_delivery', 'delivered', 'cancelled', 'refunded')),
  contact_email      text not null,
  shipping_address   jsonb not null,
  delivery_option    text not null check (delivery_option in ('standard', 'express', 'next_day')),
  coupon_code        text references public.coupons (code),
  totals             jsonb not null,
  estimated_delivery jsonb not null,
  created_at         timestamptz not null default now()
);
create index orders_user_idx on public.orders (user_id, created_at desc);

create table public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  product_id text not null references public.products (id),
  variant_id text not null references public.product_variants (id),
  title      text not null,
  slug       text not null,
  color      text not null,
  size       text not null,
  image_url  text not null,
  unit_price integer not null,
  quantity   integer not null check (quantity > 0),
  line_total integer not null,
  reviewed   boolean not null default false
);

create table public.payments (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null unique references public.orders (id) on delete cascade,
  provider_ref   text unique,
  status         text not null default 'requires_payment' check (status in ('requires_payment', 'succeeded', 'failed', 'refunded')),
  amount         integer not null,
  brand          text,
  last4          text,
  failure_reason text,
  updated_at     timestamptz not null default now()
);

create table public.shipments (
  order_id        uuid primary key references public.orders (id) on delete cascade,
  carrier         text not null,
  tracking_number text not null,
  eta             timestamptz not null,
  events          jsonb not null default '[]'
);

create table public.reviews (
  id                uuid primary key default gen_random_uuid(),
  product_id        text not null references public.products (id) on delete cascade,
  user_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  author_name       text not null default '',
  rating            integer not null check (rating between 1 and 5),
  title             text not null,
  body              text not null,
  verified_purchase boolean not null default false,
  created_at        timestamptz not null default now()
);

create table public.return_requests (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders (id) on delete cascade,
  order_number text not null default '',
  item_ids     uuid[] not null,
  type         text not null check (type in ('return', 'refund')),
  reason       text not null check (reason in ('too_small', 'too_large', 'defective', 'not_as_described', 'changed_mind')),
  note         text not null default '',
  status       text not null default 'requested' check (status in ('requested', 'approved', 'received', 'refunded', 'rejected')),
  created_at   timestamptz not null default now()
);

create table public.webhook_events (
  id          text primary key,
  received_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- row-level security

alter table public.categories       enable row level security;
alter table public.products         enable row level security;
alter table public.product_variants enable row level security;
alter table public.coupons          enable row level security;
alter table public.profiles         enable row level security;
alter table public.addresses        enable row level security;
alter table public.wishlist_items   enable row level security;
alter table public.payment_methods  enable row level security;
alter table public.notifications    enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;
alter table public.payments         enable row level security;
alter table public.shipments        enable row level security;
alter table public.reviews          enable row level security;
alter table public.return_requests  enable row level security;
alter table public.webhook_events   enable row level security; -- no policies: service role only

create policy "catalogue is public" on public.categories for select using (true);
create policy "active products are public" on public.products for select using (status = 'active');
create policy "variants are public" on public.product_variants for select using (true);
create policy "public coupons are listed" on public.coupons for select using (is_public);

create policy "own profile" on public.profiles for select using (id = auth.uid());
create policy "update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "own addresses" on public.addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own wishlist" on public.wishlist_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own payment methods" on public.payment_methods for select using (user_id = auth.uid());
create policy "update own payment methods" on public.payment_methods for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own payment methods" on public.payment_methods for delete using (user_id = auth.uid());
create policy "own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "read own notifications" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- orders are read-only for customers; writes happen in definer functions
create policy "own orders" on public.orders for select using (user_id = auth.uid());
create policy "own order items" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "own payments" on public.payments for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "own shipments" on public.shipments for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

create policy "reviews are public" on public.reviews for select using (true);
create policy "write own review" on public.reviews for insert with check (user_id = auth.uid());

create policy "own returns" on public.return_requests for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "request return on delivered order" on public.return_requests for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid() and o.status = 'delivered'));

-- ---------------------------------------------------------------- triggers

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), new.email);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- reviews: author name + verified purchase are derived server-side, rating aggregates kept in sync
create function public.before_review_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  select coalesce(nullif(p.name, ''), 'Customer') into new.author_name from public.profiles p where p.id = new.user_id;
  new.verified_purchase := exists (
    select 1 from public.order_items i join public.orders o on o.id = i.order_id
    where o.user_id = new.user_id and i.product_id = new.product_id
      and o.status in ('paid', 'processing', 'shipped', 'out_for_delivery', 'delivered'));
  new.created_at := now();
  return new;
end $$;

create trigger reviews_before_insert before insert on public.reviews
  for each row execute function public.before_review_insert();

create function public.after_review_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.products p set
    review_count = p.review_count + 1,
    rating = round(((p.rating * p.review_count) + new.rating)::numeric / (p.review_count + 1), 1)
  where p.id = new.product_id;
  update public.order_items i set reviewed = true
  from public.orders o
  where o.id = i.order_id and o.user_id = new.user_id and i.product_id = new.product_id;
  return new;
end $$;

create trigger reviews_after_insert after insert on public.reviews
  for each row execute function public.after_review_insert();

create function public.before_return_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  select o.number into new.order_number from public.orders o where o.id = new.order_id;
  new.status := 'requested';
  return new;
end $$;

create trigger returns_before_insert before insert on public.return_requests
  for each row execute function public.before_return_insert();

-- ---------------------------------------------------------------- pricing (mirrors src/lib/pricing.ts)

create function public.delivery_price(p_delivery text, p_discounted integer, p_free_shipping boolean)
returns integer language sql immutable as $$
  select case
    when p_free_shipping then 0
    when p_delivery = 'standard' and p_discounted >= 199900 then 0
    when p_delivery = 'standard' then 9900
    when p_delivery = 'express' then 19900
    when p_delivery = 'next_day' then 34900
  end
$$;

/** Authoritative quote. p_lines: [{ "variant_id": text, "quantity": int }] */
create function public.quote_order(p_lines jsonb, p_coupon text, p_delivery text)
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
    elsif v_coupon.usage_limit is not null and v_coupon.times_used >= v_coupon.usage_limit then
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

/** Validates a code without exposing private coupons through table reads. */
create function public.check_coupon(p_code text)
returns setof public.coupons language sql stable security definer set search_path = public as $$
  select * from public.coupons where lower(code) = lower(trim(p_code)) limit 1
$$;

-- ---------------------------------------------------------------- order lifecycle

/**
 * Atomically re-prices the bag, reserves stock and creates a pending order.
 * Payment status can only change via mark_order_paid / mark_order_failed (service role).
 */
create function public.place_order(
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

/** Re-reserves stock for a failed order before a payment retry. Called by the create-payment function. */
create function public.reserve_order_stock(p_order_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_item record; v_rows integer;
begin
  for v_item in select variant_id, quantity from public.order_items where order_id = p_order_id loop
    update public.product_variants set inventory_count = inventory_count - v_item.quantity
      where id = v_item.variant_id and inventory_count >= v_item.quantity;
    get diagnostics v_rows = row_count;
    if v_rows = 0 then raise exception 'stock: an item in this order is no longer available'; end if;
  end loop;
  update public.orders set status = 'pending_payment' where id = p_order_id;
  update public.payments set status = 'requires_payment', failure_reason = null, updated_at = now() where order_id = p_order_id;
end $$;

create function public.release_order_stock(p_order_id uuid) returns void
language sql security definer set search_path = public as $$
  update public.product_variants v set inventory_count = v.inventory_count + i.quantity
  from public.order_items i where i.order_id = p_order_id and i.variant_id = v.id;
$$;

create function public.mark_order_paid(p_order_id uuid, p_provider_ref text, p_brand text, p_last4 text)
returns void language plpgsql security definer set search_path = public as $$
declare v_order public.orders;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found or v_order.status <> 'pending_payment' then return; end if; -- idempotent
  update public.orders set status = 'paid' where id = p_order_id;
  update public.payments set status = 'succeeded', provider_ref = p_provider_ref, brand = p_brand, last4 = p_last4, updated_at = now()
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
end $$;

create function public.mark_order_failed(p_order_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare v_status text;
begin
  select status into v_status from public.orders where id = p_order_id for update;
  if v_status is distinct from 'pending_payment' then return; end if;
  perform public.release_order_stock(p_order_id);
  update public.orders set status = 'payment_failed' where id = p_order_id;
  update public.payments set status = 'failed', failure_reason = p_reason, updated_at = now() where order_id = p_order_id;
end $$;

create function public.cancel_order(p_order_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_order public.orders;
begin
  select * into v_order from public.orders where id = p_order_id and user_id = auth.uid() for update;
  if not found then raise exception 'order not found'; end if;
  if v_order.status not in ('paid', 'processing') then
    raise exception 'This order has already shipped and can no longer be cancelled.';
  end if;
  perform public.release_order_stock(p_order_id);
  update public.orders set status = 'cancelled' where id = p_order_id;
  -- the refund itself is issued by the refund worker / payment dashboard; we record intent here
  update public.payments set status = 'refunded', updated_at = now() where order_id = p_order_id;
  insert into public.notifications (user_id, type, title, body)
  values (v_order.user_id, 'order', format('Order %s cancelled', v_order.number), 'Your refund is on its way.');
end $$;

-- ---------------------------------------------------------------- function privileges

revoke all on function public.place_order(jsonb, text, text, text, jsonb, integer) from public, anon;
grant execute on function public.place_order(jsonb, text, text, text, jsonb, integer) to authenticated;
grant execute on function public.quote_order(jsonb, text, text) to anon, authenticated;
grant execute on function public.check_coupon(text) to anon, authenticated;
revoke all on function public.cancel_order(uuid) from public, anon;
grant execute on function public.cancel_order(uuid) to authenticated;

revoke all on function public.reserve_order_stock(uuid) from public, anon, authenticated;
revoke all on function public.release_order_stock(uuid) from public, anon, authenticated;
revoke all on function public.mark_order_paid(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.mark_order_failed(uuid, text) from public, anon, authenticated;
grant execute on function public.reserve_order_stock(uuid) to service_role;
grant execute on function public.release_order_stock(uuid) to service_role;
grant execute on function public.mark_order_paid(uuid, text, text, text) to service_role;
grant execute on function public.mark_order_failed(uuid, text) to service_role;
