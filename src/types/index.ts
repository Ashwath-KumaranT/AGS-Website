/** All monetary amounts are integers in minor units (cents). */
export type Cents = number;

export type Gender = 'men' | 'women' | 'kids' | 'unisex';
export type ProductStatus = 'active' | 'draft' | 'archived';
export type GarmentType =
  | 'tee'
  | 'shirt'
  | 'hoodie'
  | 'jacket'
  | 'sweater'
  | 'dress'
  | 'skirt'
  | 'trousers'
  | 'jeans'
  | 'shorts';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string;
  description?: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  brand: string;
  category_id: string;
  gender: Gender;
  price: Cents;
  compare_at_price: Cents | null;
  material: string;
  care: string[];
  details: string[];
  status: ProductStatus;
  rating: number;
  review_count: number;
  is_new: boolean;
  is_best_seller: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color: string;
  color_hex: string;
  size: string;
  sku: string;
  price: Cents;
  inventory_count: number;
  image_urls: string[];
}

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  author_name: string;
  rating: number;
  title: string;
  body: string;
  verified_purchase: boolean;
  created_at: string;
}

export type CouponType = 'percent' | 'fixed' | 'free_shipping';

export interface Coupon {
  code: string;
  type: CouponType;
  /** percent: 1-100; fixed: cents; free_shipping: ignored */
  value: number;
  min_subtotal: Cents;
  expires_at: string | null;
  description: string;
  usage_limit: number | null;
  times_used: number;
  is_public: boolean;
}

export type CouponCheck = { valid: true; coupon: Coupon } | { valid: false; reason: string };

export interface DeliveryOption {
  id: 'standard' | 'express' | 'next_day';
  label: string;
  description: string;
  price: Cents;
  /** subtotal (after discount) at/above which the option is free */
  free_over: Cents | null;
  min_days: number;
  max_days: number;
}

export interface Address {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export type AddressInput = Omit<Address, 'id' | 'user_id' | 'is_default'> & {
  is_default?: boolean;
};

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Session {
  user: Profile;
  expires_at: number;
}

export interface CartLine {
  variantId: string;
  productId: string;
  quantity: number;
  savedForLater: boolean;
  /** unit price when added — used only to warn about price changes, never to charge */
  addedPrice: Cents;
}

export interface Totals {
  subtotal: Cents;
  discount: Cents;
  shipping: Cents;
  tax: Cents;
  total: Cents;
  /** sum of (compare_at - price) * qty for lines on sale */
  savings: Cents;
  freeShipping: boolean;
}

export type OrderStatus =
  | 'pending_payment'
  | 'payment_failed'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  title: string;
  slug: string;
  color: string;
  size: string;
  image_url: string;
  unit_price: Cents;
  quantity: number;
  line_total: Cents;
  reviewed: boolean;
}

export interface TrackingEvent {
  status: OrderStatus;
  label: string;
  location: string;
  at: string;
}

export interface Shipment {
  carrier: string;
  tracking_number: string;
  eta: string;
  events: TrackingEvent[];
}

export interface PaymentRecord {
  id: string;
  status: 'requires_payment' | 'succeeded' | 'failed' | 'refunded';
  amount: Cents;
  brand: string | null;
  last4: string | null;
  failure_reason: string | null;
}

export interface Order {
  id: string;
  number: string;
  user_id: string;
  status: OrderStatus;
  items: OrderItem[];
  contact_email: string;
  shipping_address: Omit<Address, 'id' | 'user_id' | 'is_default'>;
  delivery_option: DeliveryOption['id'];
  coupon_code: string | null;
  totals: Totals;
  payment: PaymentRecord;
  shipment: Shipment | null;
  estimated_delivery: { from: string; to: string };
  created_at: string;
}

export type ReturnReason =
  'too_small' | 'too_large' | 'defective' | 'not_as_described' | 'changed_mind';

export interface ReturnRequest {
  id: string;
  order_id: string;
  order_number: string;
  item_ids: string[];
  type: 'return' | 'refund';
  reason: ReturnReason;
  note: string;
  status: 'requested' | 'approved' | 'received' | 'refunded' | 'rejected';
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: 'order' | 'promo' | 'account';
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface PaymentPreference {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

/* ---------- catalog queries ---------- */

export type SortKey = 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'discount';

export interface ProductQuery {
  /** category slug (top-level gender or child) */
  category?: string;
  /** virtual collections */
  collection?: 'new-arrivals' | 'sale' | 'best-sellers';
  search?: string;
  brands?: string[];
  colors?: string[];
  sizes?: string[];
  minPrice?: Cents;
  maxPrice?: Cents;
  inStockOnly?: boolean;
  onSale?: boolean;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
  ids?: string[];
  excludeId?: string;
}

export interface ProductFacets {
  brands: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  minPrice: Cents;
  maxPrice: Cents;
}

export interface ProductPage {
  items: ProductWithVariants[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  facets: ProductFacets;
}

export interface SearchSuggestions {
  products: ProductWithVariants[];
  categories: Category[];
}

/* ---------- checkout ---------- */

export interface QuoteLineInput {
  variantId: string;
  quantity: number;
}

export interface QuoteInput {
  lines: QuoteLineInput[];
  couponCode?: string | null;
  deliveryId: DeliveryOption['id'];
}

export type QuoteIssueCode =
  'out_of_stock' | 'insufficient_stock' | 'variant_removed' | 'price_changed' | 'coupon_invalid';

export interface QuoteIssue {
  code: QuoteIssueCode;
  variantId?: string;
  message: string;
}

export interface QuoteLine {
  variantId: string;
  productId: string;
  quantity: number;
  unit_price: Cents;
  compare_at_price: Cents | null;
}

export interface Quote {
  lines: QuoteLine[];
  totals: Totals;
  coupon: Coupon | null;
  issues: QuoteIssue[];
}

export interface CreateOrderInput extends QuoteInput {
  contactEmail: string;
  address: AddressInput;
  /** prices the customer saw; the server compares and rejects if they changed */
  expectedTotal?: Cents;
}

export interface PaymentIntent {
  id: string;
  order_id: string;
  amount: Cents;
  /** for hosted providers: URL to redirect the shopper to */
  redirect_url?: string;
  client_secret: string;
}

export interface CardDetails {
  number: string;
  name: string;
  exp_month: number;
  exp_year: number;
  cvc: string;
}

export interface CreateOrderResult {
  order: Order;
  intent: PaymentIntent;
}

export interface DeliveryCheck {
  serviceable: boolean;
  options: { id: DeliveryOption['id']; from: string; to: string }[];
  message: string;
}
