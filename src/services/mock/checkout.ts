import { checkDeliveryForPostalCode } from '@/lib/delivery';
import { checkCoupon } from '@/lib/pricing';
import type { CheckoutService } from '@/services/types';
import { db, delay } from './db';
import { createOrderServer, quoteOrder, retryPaymentServer, withPendingUses } from './server';

export const mockCheckout: CheckoutService = {
  async quote(input) {
    return delay(quoteOrder(input), 120);
  },

  async validateCoupon(code, subtotal) {
    const found = db.coupons().find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
    return delay(checkCoupon(found && withPendingUses(found), subtotal), 150);
  },

  async listPublicCoupons() {
    return delay(
      db.coupons().filter((c) => c.is_public),
      80,
    );
  },

  async checkDelivery(postalCode) {
    return delay(checkDeliveryForPostalCode(postalCode), 150);
  },

  async createOrder(input) {
    return delay(createOrderServer(input), 350);
  },

  async retryPayment(orderId) {
    return delay(retryPaymentServer(orderId), 250);
  },
};
