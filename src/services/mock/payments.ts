import { isExpired, luhnCheck, cardBrand } from '@/lib/validation';
import type { PaymentsService } from '@/services/types';
import { delay } from './db';
import { handleWebhook, signWebhook, type WebhookEvent } from './server';

/**
 * Stand-in for a hosted payment provider (think Stripe/Razorpay test mode).
 * Card details go to the provider only; our own "server" never sees them. After the
 * provider decides, it calls our webhook endpoint with a signed event — the only path
 * that can mark an order paid.
 *
 * Test cards:
 *   4242 4242 4242 4242  → succeeds
 *   4000 0000 0000 0002  → declined
 *   4000 0000 0000 9995  → insufficient funds
 *   4000 0000 0000 0069  → expired card
 */
const DECLINES: Record<string, string> = {
  '4000000000000002': 'Your card was declined.',
  '4000000000009995': 'Your card has insufficient funds.',
  '4000000000000069': 'Your card has expired.',
  '4000000000000127': 'Your card security code is incorrect.',
};

function dispatch(event: WebhookEvent): void {
  const body = JSON.stringify(event);
  handleWebhook(body, signWebhook(body));
}

export const mockPayments: PaymentsService = {
  mode: 'inline-card',

  async confirm(intent, card) {
    await delay(null, 900); // provider processing time
    if (!card) return { status: 'failed', message: 'Enter your card details.' };
    const digits = card.number.replace(/\s+/g, '');
    const eventId = `evt_${intent.id}_${Date.now()}`;

    const fail = (message: string) => {
      dispatch({
        id: eventId,
        type: 'payment_intent.payment_failed',
        data: { intent_id: intent.id, failure_reason: message },
      });
      return { status: 'failed' as const, message };
    };

    if (!luhnCheck(digits)) return fail('Your card number is invalid.');
    if (isExpired(card.exp_month, card.exp_year)) return fail('Your card has expired.');
    const decline = DECLINES[digits];
    if (decline) return fail(decline);

    dispatch({
      id: eventId,
      type: 'payment_intent.succeeded',
      data: { intent_id: intent.id, brand: cardBrand(digits), last4: digits.slice(-4) },
    });
    return { status: 'succeeded' };
  },
};
