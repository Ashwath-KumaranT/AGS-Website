import type {
  Address,
  AddressInput,
  AppNotification,
  CardDetails,
  Category,
  Coupon,
  CouponCheck,
  CreateOrderInput,
  CreateOrderResult,
  DeliveryCheck,
  Order,
  PaymentIntent,
  PaymentPreference,
  Profile,
  ProductPage,
  ProductQuery,
  ProductWithVariants,
  Quote,
  QuoteInput,
  ReturnReason,
  ReturnRequest,
  Review,
  SearchSuggestions,
  Session,
} from '@/types';

export type ApiErrorCode =
  | 'AUTH_REQUIRED'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_TAKEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'OUT_OF_STOCK'
  | 'PRICE_CHANGED'
  | 'COUPON_INVALID'
  | 'PAYMENT_FAILED'
  | 'NETWORK'
  | 'UNKNOWN';

export class ApiError extends Error {
  code: ApiErrorCode;
  details?: unknown;
  constructor(code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

export interface CatalogService {
  listProducts(query: ProductQuery): Promise<ProductPage>;
  getProductBySlug(slug: string): Promise<ProductWithVariants | null>;
  getProductsByIds(ids: string[]): Promise<ProductWithVariants[]>;
  getCategories(): Promise<Category[]>;
  suggest(query: string): Promise<SearchSuggestions>;
  getRelated(productId: string, limit?: number): Promise<ProductWithVariants[]>;
  listReviews(productId: string): Promise<Review[]>;
  addReview(input: {
    productId: string;
    rating: number;
    title: string;
    body: string;
  }): Promise<Review>;
}

export interface AuthService {
  getSession(): Promise<Session | null>;
  signUp(input: { name: string; email: string; password: string }): Promise<Session>;
  signIn(input: { email: string; password: string }): Promise<Session>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<{ devResetUrl?: string }>;
  resetPassword(input: { token: string; password: string }): Promise<void>;
  updateProfile(input: { name: string; phone: string }): Promise<Profile>;
  /** returns an unsubscribe function */
  subscribe(listener: (session: Session | null) => void): () => void;
}

export interface AccountService {
  listAddresses(): Promise<Address[]>;
  saveAddress(input: AddressInput, id?: string): Promise<Address>;
  deleteAddress(id: string): Promise<void>;
  setDefaultAddress(id: string): Promise<void>;
  getWishlist(): Promise<string[]>;
  setWishlist(productIds: string[]): Promise<void>;
  listNotifications(): Promise<AppNotification[]>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(): Promise<void>;
  listPaymentPreferences(): Promise<PaymentPreference[]>;
  removePaymentPreference(id: string): Promise<void>;
  setDefaultPaymentPreference(id: string): Promise<void>;
}

export interface OrdersService {
  listOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  cancelOrder(id: string): Promise<Order>;
  requestReturn(input: {
    orderId: string;
    itemIds: string[];
    type: 'return' | 'refund';
    reason: ReturnReason;
    note: string;
  }): Promise<ReturnRequest>;
  listReturns(): Promise<ReturnRequest[]>;
  /** mock-only helper so QA can watch tracking progress */
  advanceOrderDemo?(id: string): Promise<Order>;
}

export interface CheckoutService {
  quote(input: QuoteInput): Promise<Quote>;
  validateCoupon(code: string, subtotal: number): Promise<CouponCheck>;
  listPublicCoupons(): Promise<Coupon[]>;
  checkDelivery(postalCode: string): Promise<DeliveryCheck>;
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  retryPayment(orderId: string): Promise<CreateOrderResult>;
}

export type PaymentOutcome =
  | { status: 'succeeded' }
  | { status: 'failed'; message: string }
  | { status: 'redirect'; url: string };

export interface PaymentsService {
  /** inline-card: we collect card fields and hand them to the provider; hosted-redirect: provider page */
  mode: 'inline-card' | 'hosted-redirect';
  confirm(intent: PaymentIntent, card?: CardDetails): Promise<PaymentOutcome>;
}

export interface Api {
  source: 'mock' | 'supabase';
  catalog: CatalogService;
  auth: AuthService;
  account: AccountService;
  orders: OrdersService;
  checkout: CheckoutService;
  payments: PaymentsService;
}
