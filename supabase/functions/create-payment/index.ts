// Creates a hosted payment session (Stripe Checkout) for an existing pending order.
// The amount is read from the database order — never from the request body.
//
// Secrets: STRIPE_SECRET_KEY, SITE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/cors.ts';

const STRIPE_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const SITE_URL = Deno.env.get('SITE_URL') ?? 'http://localhost:5173';
const CURRENCY = (Deno.env.get('CURRENCY') ?? 'inr').toLowerCase();

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  // 1. identify the caller from their JWT
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    },
  );
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return json({ error: 'authentication required' }, 401);

  const { order_id } = (await req.json().catch(() => ({}))) as { order_id?: string };
  if (!order_id) return json({ error: 'order_id is required' }, 400);

  // 2. load the order with service role, but enforce ownership ourselves
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const { data: order, error } = await admin
    .from('orders')
    .select(
      'id, number, user_id, status, contact_email, totals, items:order_items(title, quantity, unit_price)',
    )
    .eq('id', order_id)
    .single();
  if (error || !order || order.user_id !== auth.user.id)
    return json({ error: 'order not found' }, 404);

  if (order.status === 'payment_failed') {
    const { error: reserveError } = await admin.rpc('reserve_order_stock', {
      p_order_id: order.id,
    });
    if (reserveError) return json({ error: reserveError.message }, 409);
  } else if (order.status !== 'pending_payment') {
    return json({ error: 'order can no longer be paid' }, 409);
  }

  const amount = (order.totals as { total: number }).total;

  // 3. create the hosted session for the server-computed total
  const body = new URLSearchParams({
    mode: 'payment',
    customer_email: order.contact_email,
    success_url: `${SITE_URL}/order-confirmation/${order.id}`,
    cancel_url: `${SITE_URL}/checkout`,
    'metadata[order_id]': order.id,
    'payment_intent_data[metadata][order_id]': order.id,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': CURRENCY,
    'line_items[0][price_data][unit_amount]': String(amount),
    'line_items[0][price_data][product_data][name]': `ASG order ${order.number}`,
    expires_at: String(Math.floor(Date.now() / 1000) + 30 * 60),
  });
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRIPE_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': `${order.id}-${Date.now()}`,
    },
    body,
  });
  const session = await res.json();
  if (!res.ok) return json({ error: session?.error?.message ?? 'payment provider error' }, 502);

  await admin
    .from('payments')
    .update({ provider_ref: session.id, updated_at: new Date().toISOString() })
    .eq('order_id', order.id);

  return json({
    id: session.id,
    order_id: order.id,
    amount,
    client_secret: '',
    redirect_url: session.url,
  });
});
