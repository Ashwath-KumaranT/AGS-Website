import { returnWindow } from '@/lib/returns';
import { ApiError, type OrdersService } from '@/services/types';
import type { ReturnRequest } from '@/types';
import { db, delay, uid } from './db';
import { advanceOrder, cancelOrderServer } from './server';
import { requireUser } from './session';

export const mockOrders: OrdersService = {
  async listOrders() {
    const user = requireUser();
    return delay(
      db
        .orders()
        .filter((o) => o.user_id === user.id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
      120,
    );
  },

  async getOrder(id) {
    const user = requireUser();
    return delay(db.orders().find((o) => o.id === id && o.user_id === user.id) ?? null, 80);
  },

  async cancelOrder(id) {
    return delay(cancelOrderServer(id));
  },

  async requestReturn({ orderId, itemIds, type, reason, note }) {
    const user = requireUser();
    const order = db.orders().find((o) => o.id === orderId && o.user_id === user.id);
    if (!order) throw new ApiError('NOT_FOUND', 'Order not found.');
    if (order.status !== 'delivered') {
      throw new ApiError(
        'VALIDATION',
        'Returns can be requested once an order has been delivered.',
      );
    }
    if (!returnWindow(order).open) {
      throw new ApiError('VALIDATION', 'The 7-day return window for this order has closed.');
    }
    if (itemIds.length === 0) throw new ApiError('VALIDATION', 'Select at least one item.');
    const ownItems = new Set(order.items.map((i) => i.id));
    if (itemIds.some((id) => !ownItems.has(id))) {
      throw new ApiError('VALIDATION', 'Those items are not part of this order.');
    }
    const alreadyReturning = new Set(
      db
        .returns()
        .filter((r) => r.order_id === order.id && r.status !== 'rejected')
        .flatMap((r) => r.item_ids),
    );
    if (itemIds.some((id) => alreadyReturning.has(id))) {
      throw new ApiError(
        'VALIDATION',
        'A return has already been requested for one of those items.',
      );
    }
    const request: ReturnRequest = {
      id: uid('ret'),
      order_id: order.id,
      order_number: order.number,
      item_ids: itemIds,
      type,
      reason,
      note,
      status: 'requested',
      created_at: new Date().toISOString(),
    };
    db.setReturns([request, ...db.returns()]);
    return delay(request);
  },

  async listReturns() {
    const user = requireUser();
    const myOrders = new Set(
      db
        .orders()
        .filter((o) => o.user_id === user.id)
        .map((o) => o.id),
    );
    return delay(
      db.returns().filter((r) => myOrders.has(r.order_id)),
      100,
    );
  },

  async advanceOrderDemo(id) {
    return delay(advanceOrder(id), 100);
  },
};
