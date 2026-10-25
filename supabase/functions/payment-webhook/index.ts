// Stripe webhook receiver. This is the ONLY code path that marks an order paid.
// Deploy with `--no-verify-jwt` (Stripe doesn't send a Supabase JWT); authenticity is
// established by verifying the Stripe-Signature header instead.
//
// Secrets: STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
import { createClient } from 'npm:@supabase/supabase-js@2';

const SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
const TOLERANCE_SECONDS = 300;

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verify(raw: string, header: string | null): Promise<boolean> {
  if (!header || !SECRET) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=') as [string, string]));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > TOLERANCE_SECONDS) return false;
  const expected = await hmacHex(SECRET, `${t}.${raw}`);
  return header
    .split(',')
    .filter((p) => p.startsWith('v1='))
    .some((p) => timingSafeEqual(p.slice(3), expected));
}

Deno.serve(async (req) => {
  const raw = await req.text();
  if (!(await verify(raw, req.headers.get('stripe-signature')))) {
    return new Response('invalid signature', { status: 400 });
  }
  const event = JSON.parse(raw) as {
    id: string;
    type: string;
    data: { object: Record<string, unknown> };
  };
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // idempotency: Stripe retries deliveries. The claim is released again if handling fails,
  // so a retry of an event we could not process is not mistaken for a duplicate.
  const { error: dup } = await admin.from('webhook_events').insert({ id: event.id });
  if (dup) return new Response('already processed', { status: 200 });
  const release = () => admin.from('webhook_events').delete().eq('id', event.id);
  const failed = async (message: string) => {
    await release();
    return new Response(message, { status: 500 });
  };

  const obj = event.data.object;
  const orderId = (obj.metadata as Record<string, string> | undefined)?.order_id;
  if (!orderId) return new Response('ignored', { status: 200 });

  if (
    (event.type === 'checkout.session.completed' && obj.payment_status === 'paid') ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    // fetch card details for the receipt (brand / last4 only)
    let brand: string | null = null;
    let last4: string | null = null;
    const pi = obj.payment_intent as string | undefined;
    if (pi) {
      const res = await fetch(
        `https://api.stripe.com/v1/payment_intents/${pi}?expand[]=latest_charge`,
        {
          headers: { Authorization: `Bearer ${Deno.env.get('STRIPE_SECRET_KEY') ?? ''}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        const card = data?.latest_charge?.payment_method_details?.card;
        brand = card?.brand ?? null;
        last4 = card?.last4 ?? null;
      }
    }
    const { error } = await admin.rpc('mark_order_paid', {
      p_order_id: orderId,
      p_provider_ref: String(obj.id),
      p_brand: brand,
      p_last4: last4,
    });
    if (error) return failed(error.message);
  } else if (event.type === 'payment_intent.payment_failed') {
    // A decline does not end the Checkout session — the shopper can try another card.
    // Record the attempt but leave the order pending, so a later success can still settle it.
    const { error } = await admin.rpc('record_payment_attempt', {
      p_order_id: orderId,
      p_reason:
        (obj.last_payment_error as { message?: string } | undefined)?.message ??
        'That payment attempt did not go through.',
    });
    if (error) return failed(error.message);
  } else if (
    event.type === 'checkout.session.expired' ||
    event.type === 'checkout.session.async_payment_failed'
  ) {
    const reason =
      (obj.last_payment_error as { message?: string } | undefined)?.message ??
      'Payment was not completed.';
    const { error } = await admin.rpc('mark_order_failed', {
      p_order_id: orderId,
      p_reason: reason,
    });
    if (error) return failed(error.message);
  }

  return new Response('ok', { status: 200 });
});
