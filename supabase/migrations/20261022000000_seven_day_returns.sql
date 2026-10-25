-- Return policy: free returns within 7 days of delivery (was: any time after delivery).
-- Delivery time comes from the shipment's "delivered" tracking event.

create or replace function public.order_delivered_at(p_order_id uuid)
returns timestamptz language sql stable security definer set search_path = public as $$
  select max((e ->> 'at')::timestamptz)
  from public.shipments s, jsonb_array_elements(s.events) e
  where s.order_id = p_order_id and e ->> 'status' = 'delivered'
$$;

drop policy if exists "request return on delivered order" on public.return_requests;

create policy "request return within 7 days of delivery" on public.return_requests for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
        and o.status = 'delivered'
        and public.order_delivered_at(o.id) >= now() - interval '7 days'
    )
  );

-- order numbers now carry the ASG prefix (ASG = Arun Sakthi Garments)
alter table public.orders
  alter column number set default ('ASG-' || nextval('public.order_number_seq'));
