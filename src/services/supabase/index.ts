/**
 * Supabase implementation of the service contracts in ../types.ts.
 * Table/column names match src/types (see supabase/migrations). Anything that touches
 * money (quote, place_order, payment) runs in Postgres RPCs / Edge Functions — the browser
 * only ever holds the public anon key and relies on row-level security.
 */
import { queryProducts } from '@/services/mock/catalog';
import {
  ApiError,
  isApiError,
  type AccountService,
  type Api,
  type AuthService,
  type CatalogService,
  type CheckoutService,
  type OrdersService,
  type PaymentsService,
} from '@/services/types';
import { checkDeliveryForPostalCode } from '@/lib/delivery';
import { checkCoupon } from '@/lib/pricing';
import type {
  Address,
  AppNotification,
  Category,
  Coupon,
  CreateOrderResult,
  Order,
  PaymentPreference,
  Profile,
  ProductWithVariants,
  Quote,
  ReturnRequest,
  Review,
  Session,
} from '@/types';
import { getSupabase } from './client';

type Row = Record<string, unknown>;

function fail(
  error: { message: string } | null,
  code: ConstructorParameters<typeof ApiError>[0] = 'UNKNOWN',
): void {
  if (error) throw new ApiError(code, error.message);
}

async function uid(): Promise<string> {
  const { data } = await getSupabase().auth.getUser();
  if (!data.user) throw new ApiError('AUTH_REQUIRED', 'Please sign in to continue.');
  return data.user.id;
}

/* ------------------------------ catalog ------------------------------ */

let cache: { at: number; products: ProductWithVariants[]; categories: Category[] } | null = null;

async function loadCatalog() {
  if (cache && Date.now() - cache.at < 60_000) return cache;
  const sb = getSupabase();
  const [p, c] = await Promise.all([
    sb.from('products').select('*, variants:product_variants(*)').eq('status', 'active'),
    sb.from('categories').select('*'),
  ]);
  fail(p.error);
  fail(c.error);
  cache = {
    at: Date.now(),
    products: (p.data ?? []) as unknown as ProductWithVariants[],
    categories: (c.data ?? []) as unknown as Category[],
  };
  return cache;
}

const catalog: CatalogService = {
  async listProducts(query) {
    const { products, categories } = await loadCatalog();
    return queryProducts(query, products, categories);
  },
  async getProductBySlug(slug) {
    return (await loadCatalog()).products.find((p) => p.slug === slug) ?? null;
  },
  async getProductsByIds(ids) {
    const set = new Set(ids);
    // bypass cache: cart/checkout must see live inventory and prices
    cache = null;
    return (await loadCatalog()).products.filter((p) => set.has(p.id));
  },
  async getCategories() {
    return (await loadCatalog()).categories;
  },
  async suggest(query) {
    const q = query.trim();
    if (q.length < 2) return { products: [], categories: [] };
    const { products, categories } = await loadCatalog();
    return {
      products: queryProducts({ search: q, pageSize: 5 }, products, categories).items,
      categories: categories
        .filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
        .slice(0, 4),
    };
  },
  async getRelated(productId, limit = 4) {
    const { products } = await loadCatalog();
    const current = products.find((p) => p.id === productId);
    if (!current) return [];
    return products
      .filter(
        (p) =>
          p.id !== productId &&
          (p.category_id === current.category_id || p.gender === current.gender),
      )
      .slice(0, limit);
  },
  async listReviews(productId) {
    const { data, error } = await getSupabase()
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    fail(error);
    return (data ?? []) as unknown as Review[];
  },
  async addReview({ productId, rating, title, body }) {
    const userId = await uid();
    const { data, error } = await getSupabase()
      .from('reviews')
      .insert({ product_id: productId, user_id: userId, rating, title, body })
      .select('*')
      .single();
    fail(error);
    cache = null;
    return data as unknown as Review;
  },
};

/* ------------------------------ auth ------------------------------ */

async function toSession(userId: string, expiresAt: number | undefined): Promise<Session | null> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return { user: data as unknown as Profile, expires_at: (expiresAt ?? 0) * 1000 };
}

const auth: AuthService = {
  async getSession() {
    const { data } = await getSupabase().auth.getSession();
    return data.session ? toSession(data.session.user.id, data.session.expires_at) : null;
  },
  async signUp({ name, email, password }) {
    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error)
      throw new ApiError(
        /registered/i.test(error.message) ? 'EMAIL_TAKEN' : 'UNKNOWN',
        error.message,
      );
    if (!data.session || !data.user) {
      throw new ApiError('VALIDATION', 'Check your inbox to confirm your email, then sign in.');
    }
    const session = await toSession(data.user.id, data.session.expires_at);
    if (!session) throw new ApiError('UNKNOWN', 'Could not load your profile.');
    return session;
  },
  async signIn({ email, password }) {
    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) throw new ApiError('INVALID_CREDENTIALS', 'Incorrect email or password.');
    const session = await toSession(data.user.id, data.session.expires_at);
    if (!session) throw new ApiError('UNKNOWN', 'Could not load your profile.');
    return session;
  },
  async signOut() {
    await getSupabase().auth.signOut();
  },
  async requestPasswordReset(email) {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    fail(error);
    return {};
  },
  async resetPassword({ password }) {
    const { error } = await getSupabase().auth.updateUser({ password });
    fail(error, 'VALIDATION');
  },
  async updateProfile({ name, phone }) {
    const id = await uid();
    const { data, error } = await getSupabase()
      .from('profiles')
      .update({ name, phone })
      .eq('id', id)
      .select('*')
      .single();
    fail(error);
    return data as unknown as Profile;
  },
  subscribe(listener) {
    const { data } = getSupabase().auth.onAuthStateChange((_event, session) => {
      if (!session) return listener(null);
      void toSession(session.user.id, session.expires_at).then(listener);
    });
    return () => data.subscription.unsubscribe();
  },
};

/* ------------------------------ account ------------------------------ */

const account: AccountService = {
  async listAddresses() {
    const { data, error } = await getSupabase()
      .from('addresses')
      .select('*')
      .order('is_default', { ascending: false });
    fail(error);
    return (data ?? []) as unknown as Address[];
  },
  async saveAddress(input, id) {
    const user_id = await uid();
    const sb = getSupabase();
    if (input.is_default)
      await sb.from('addresses').update({ is_default: false }).eq('user_id', user_id);
    const payload = { ...input, user_id };
    const q = id
      ? sb.from('addresses').update(payload).eq('id', id)
      : sb.from('addresses').insert(payload);
    const { data, error } = await q.select('*').single();
    fail(error);
    return data as unknown as Address;
  },
  async deleteAddress(id) {
    fail((await getSupabase().from('addresses').delete().eq('id', id)).error);
  },
  async setDefaultAddress(id) {
    const user_id = await uid();
    const sb = getSupabase();
    await sb.from('addresses').update({ is_default: false }).eq('user_id', user_id);
    fail((await sb.from('addresses').update({ is_default: true }).eq('id', id)).error);
  },
  async getWishlist() {
    const { data, error } = await getSupabase().from('wishlist_items').select('product_id');
    fail(error);
    return (data ?? []).map((r: Row) => String(r.product_id));
  },
  async setWishlist(productIds) {
    const user_id = await uid();
    const sb = getSupabase();
    fail((await sb.from('wishlist_items').delete().eq('user_id', user_id)).error);
    if (productIds.length) {
      fail(
        (
          await sb
            .from('wishlist_items')
            .insert(productIds.map((product_id) => ({ user_id, product_id })))
        ).error,
      );
    }
  },
  async listNotifications() {
    const { data, error } = await getSupabase()
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    fail(error);
    return (data ?? []) as unknown as AppNotification[];
  },
  async markNotificationRead(id) {
    fail((await getSupabase().from('notifications').update({ read: true }).eq('id', id)).error);
  },
  async markAllNotificationsRead() {
    const user_id = await uid();
    fail(
      (await getSupabase().from('notifications').update({ read: true }).eq('user_id', user_id))
        .error,
    );
  },
  async listPaymentPreferences() {
    const { data, error } = await getSupabase().from('payment_methods').select('*');
    fail(error);
    return (data ?? []) as unknown as PaymentPreference[];
  },
  async removePaymentPreference(id) {
    fail((await getSupabase().from('payment_methods').delete().eq('id', id)).error);
  },
  async setDefaultPaymentPreference(id) {
    const user_id = await uid();
    const sb = getSupabase();
    await sb.from('payment_methods').update({ is_default: false }).eq('user_id', user_id);
    fail((await sb.from('payment_methods').update({ is_default: true }).eq('id', id)).error);
  },
};

/* ------------------------------ orders ------------------------------ */

const ORDER_SELECT = '*, items:order_items(*), payment:payments(*), shipment:shipments(*)';

function mapOrder(row: Row): Order {
  const payment = (Array.isArray(row.payment) ? row.payment[0] : row.payment) as Order['payment'];
  const shipment = (
    Array.isArray(row.shipment) ? row.shipment[0] : row.shipment
  ) as Order['shipment'];
  return { ...(row as unknown as Order), payment, shipment: shipment ?? null };
}

const orders: OrdersService = {
  async listOrders() {
    const { data, error } = await getSupabase()
      .from('orders')
      .select(ORDER_SELECT)
      .order('created_at', { ascending: false });
    fail(error);
    return (data ?? []).map((r) => mapOrder(r as Row));
  },
  async getOrder(id) {
    const { data, error } = await getSupabase()
      .from('orders')
      .select(ORDER_SELECT)
      .eq('id', id)
      .maybeSingle();
    fail(error);
    return data ? mapOrder(data as Row) : null;
  },
  async cancelOrder(id) {
    const { error } = await getSupabase().rpc('cancel_order', { p_order_id: id });
    fail(error, 'VALIDATION');
    const order = await orders.getOrder(id);
    if (!order) throw new ApiError('NOT_FOUND', 'Order not found');
    return order;
  },
  async requestReturn({ orderId, itemIds, type, reason, note }) {
    const { data, error } = await getSupabase()
      .from('return_requests')
      .insert({ order_id: orderId, item_ids: itemIds, type, reason, note })
      .select('*')
      .single();
    fail(error, 'VALIDATION');
    return data as unknown as ReturnRequest;
  },
  async listReturns() {
    const { data, error } = await getSupabase()
      .from('return_requests')
      .select('*')
      .order('created_at', { ascending: false });
    fail(error);
    return (data ?? []) as unknown as ReturnRequest[];
  },
};

/* ------------------------------ checkout ------------------------------ */

const toRpcLines = (lines: { variantId: string; quantity: number }[]) =>
  lines.map((l) => ({ variant_id: l.variantId, quantity: l.quantity }));

/**
 * place_order raises `stock: …` / `coupon: …` so the cause survives PostgREST. Shoppers
 * should see the sentence, not the prefix.
 */
function placeOrderError(raw: string): ApiError {
  const stock = /^stock:\s*/i.exec(raw);
  if (stock) return new ApiError('OUT_OF_STOCK', raw.slice(stock[0].length));
  const coupon = /^coupon:\s*/i.exec(raw);
  if (coupon) return new ApiError('COUPON_INVALID', raw.slice(coupon[0].length));
  if (/price changed/i.test(raw)) {
    return new ApiError('PRICE_CHANGED', 'Prices changed since you last reviewed your order.');
  }
  return new ApiError('VALIDATION', raw);
}

const checkout: CheckoutService = {
  async quote(input) {
    const { data, error } = await getSupabase().rpc('quote_order', {
      p_lines: toRpcLines(input.lines),
      p_coupon: input.couponCode ?? null,
      p_delivery: input.deliveryId,
    });
    fail(error);
    return data as Quote;
  },
  async validateCoupon(code, subtotal) {
    // private codes aren't readable via RLS, so look them up through a definer function
    const { data, error } = await getSupabase().rpc('check_coupon', { p_code: code });
    fail(error);
    return checkCoupon(((data as Coupon[] | null) ?? [])[0] ?? null, subtotal);
  },
  async listPublicCoupons() {
    const { data, error } = await getSupabase().from('coupons').select('*').eq('is_public', true);
    fail(error);
    return (data ?? []) as unknown as Coupon[];
  },
  async checkDelivery(postalCode) {
    // swap for a serviceability table lookup when you have courier coverage data
    return checkDeliveryForPostalCode(postalCode);
  },
  async createOrder(input) {
    const sb = getSupabase();
    const { data, error } = await sb.rpc('place_order', {
      p_lines: toRpcLines(input.lines),
      p_coupon: input.couponCode ?? null,
      p_delivery: input.deliveryId,
      p_email: input.contactEmail,
      p_address: input.address,
      p_expected_total: input.expectedTotal ?? null,
    });
    if (error) throw placeOrderError(error.message);
    const orderId = (data as { order_id: string }).order_id;
    try {
      return await startPayment(orderId);
    } catch (e) {
      // the order is placed and holding stock; hand its id back so the caller retries
      // this order rather than placing another one
      if (isApiError(e)) throw new ApiError(e.code, e.message, { orderId });
      throw e;
    }
  },
  async retryPayment(orderId) {
    return startPayment(orderId);
  },
};

async function startPayment(orderId: string): Promise<CreateOrderResult> {
  const sb = getSupabase();
  const { data, error } = await sb.functions.invoke('create-payment', {
    body: { order_id: orderId },
  });
  if (error) throw new ApiError('PAYMENT_FAILED', error.message);
  const order = await orders.getOrder(orderId);
  if (!order) throw new ApiError('NOT_FOUND', 'Order not found');
  const intent = data as CreateOrderResult['intent'];
  return { order, intent };
}

const payments: PaymentsService = {
  mode: 'hosted-redirect',
  async confirm(intent) {
    if (!intent.redirect_url) return { status: 'failed', message: 'Payment provider unavailable.' };
    return { status: 'redirect', url: intent.redirect_url };
  },
};

export const supabaseApi: Api = {
  source: 'supabase',
  catalog,
  auth,
  account,
  orders,
  checkout,
  payments,
};
