# ASG — Clothing e-commerce storefront

A premium, editorial, mobile-first clothing store built from the _Clothing E-commerce Complete UI Development Roadmap_.
The whole journey works end to end: landing → category/search → filters → product → bag → coupon → address → delivery → payment → order confirmation → order history, tracking and returns.

**Stack:** React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · shadcn-style primitives (CVA + tailwind-merge) · React Router · TanStack Query · Zustand · React Hook Form + Zod · Supabase (Auth, Postgres, Edge Functions) · Vitest + Testing Library · Playwright · Vercel.

---

## Quick start

```bash
npm install          # .npmrc sets legacy-peer-deps (needed for @hookform/resolvers v6 optional peers)
cp .env.example .env # optional — defaults work out of the box
npm run dev          # http://localhost:5173
```

The default data source is a **mock backend** in `localStorage`, so nothing else needs to be running. To swap in Supabase, see [Supabase backend](#supabase-backend).

### Demo data

| What                      | Value                                                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Demo account              | `demo@asg.com` / `Demo@1234` (a "Fill demo credentials" button is on the login page)                                                      |
| Coupons                   | `WELCOME10` (10%), `SAVE500` (₹500 off ₹3,999+), `FREESHIP` (free shipping on ₹999+), `EARLYBIRD25` (expired), `USEDUP` (usage limit hit) |
| Test cards                | `4242 4242 4242 4242` succeeds · `4000 0000 0000 0002` declined · `4000 0000 0000 9995` insufficient funds · any future expiry, any CVC   |
| Unserviceable postal code | any code ending in `000`                                                                                                                  |
| Sold-out examples         | _Waxed Cotton Jacket_ (fully sold out), _Chunky Cable-Knit_ (XL), _Oversized Cardigan_ (XS/S)                                             |

The order-tracking page has a demo-only **Simulate next update** button that moves an order through packed → shipped → out for delivery → delivered. Once an order is delivered you can request returns and write reviews.

To reset the demo, clear site data in the browser, or run `localStorage.clear()` in the console.

---

## Scripts

| Command               | What it does                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| `npm run dev`         | Vite dev server                                                                                     |
| `npm run typecheck`   | `tsc -b` in strict mode, with `noUncheckedIndexedAccess`                                            |
| `npm run lint`        | ESLint (typescript-eslint + react-hooks / React Compiler rules)                                     |
| `npm test`            | Vitest unit + component tests                                                                       |
| `npm run e2e`         | Playwright purchase-flow tests (desktop + mobile). Run `npx playwright install chromium` once first |
| `npm run build`       | Typecheck, then production build to `dist/`                                                         |
| `npm run ci`          | typecheck → lint → test → build                                                                     |
| `npm run db:seed-sql` | Regenerates `supabase/seed.sql` from the mock catalogue                                             |
| `npm run format`      | Prettier                                                                                            |

---

## Architecture

```
src/
  app/                 App root, QueryClient, router (route-level code splitting)
  components/
    ui/                Button, Input/Select/Textarea/Checkbox, Modal/Drawer/TopSheet, Badge, Skeleton,
                       Price, Rating, QuantitySelector, Empty/Error states, Pagination, Toaster, ProductImage
    layout/            Header + mega-menu, MobileMenu, BottomNav, SearchPanel, Footer, Layout shell
    Seo.tsx            title / description / canonical / Open Graph / JSON-LD
  features/
    auth/              session store, RequireAuth guard, auth layout
    products/          ProductCard, ProductGrid, FilterPanel, filters (URL state), SizeSelector,
                       ColorSwatches, SizeGuide, Gallery (zoom), DeliveryChecker, Reviews
    cart/              pure cart logic + persisted Zustand store, CartDrawer, CartLineItem, summary
    wishlist/          persisted store + account sync
    checkout/          AddressStep, DeliveryStep, PaymentForm, OrderSummary
    orders/            status badge, tracking timeline
    account/           AddressForm, AddressCard
  pages/               route components (home, catalogue, PDP, cart, checkout, confirmation, auth, account/*)
  services/
    types.ts           service contracts (Catalog, Auth, Account, Orders, Checkout, Payments)
    index.ts           picks the adapter from VITE_DATA_SOURCE
    mock/              localStorage backend; server.ts holds the "server-side" rules
    supabase/          Supabase adapter (same contracts)
  lib/                 pricing, delivery, validation (Zod), formatting, garment image generator
  hooks/               TanStack Query hooks, debounce, online status
  store/               UI store (drawers, toasts, theme, recently viewed, recent searches)
  types/               domain types; these mirror the database columns
supabase/
  migrations/          schema, RLS policies, pricing + order RPCs
  functions/           create-payment, payment-webhook (Edge Functions)
  seed.sql             generated catalogue
e2e/                   Playwright specs
```

**Data flow.** Components talk only to `api` (`src/services`), through TanStack Query hooks. Server state lives in Query. Zustand holds only client state: bag lines, wishlist ids, UI, recent items and theme. Business rules such as pricing, coupon checks, cart reducers and filter serialisation are pure functions in `lib/` and `features/*/…Logic.ts`, and each has unit tests.

### Languages (English / தமிழ்)

The **EN | தமிழ்** switch in the header (and in the mobile menu) changes every word on the site, including product names, descriptions, colours, validation messages, server errors, toasts and notifications. English is the default. The choice is saved in the browser and applied to `<html lang>`, and dates follow the language. Prices always use the same ₹ format.

- **How it works:** English source strings are the keys: `const { t } = useT(); t('Add to bag')`. Tamil lives in `src/i18n/ta/*.ts`; each file default-exports `Record<english, tamil>`, and all of them are merged automatically.
- **Catalogue text:** product and category text is translated in the TanStack Query `select` (`src/i18n/localize.ts`), so switching language doesn't refetch anything.
- **Messages:** API, validation and toast messages arrive as finished English sentences. They are translated with `tm()`, which also matches templated keys like `'Only {count} left of {title}.'`.
- **Safety net:** `src/i18n/coverage.test.ts` fails CI if any `t('…')` string has no Tamil entry, if placeholders don't match, or if an entry was left in English.
- **Search** matches both English and Tamil product names.

### Sign in / sign up

- **One page for both:** `/sign-in` has **Sign in** and **Create account** tabs; `/sign-in?mode=signup` opens the second tab. The old `/login` and `/signup` URLs redirect there.
- **Sign-in popup:** signed-out shoppers see a popup near the top of the page, about a second after it loads, with Sign in / Create account buttons. Dismissing it hides it for the rest of the browser session. It never shows on the auth pages or during checkout.

### Money and trust boundaries

- All amounts are integer cents.
- The bag stores **only variant ids, quantities and the price seen when the item was added**. That price is used to warn "price changed", never to charge.
- Bag totals update instantly in the browser using `computeTotals`. Checkout then shows a **server quote** (`quote_order`). `place_order` re-prices everything, re-checks stock and the coupon, and rejects the order if the total differs from what the shopper saw (`PRICE_CHANGED`).
- Orders are created as `pending_payment` with stock **reserved in the same transaction**. A payment that ends in failure releases the stock and marks the order `payment_failed`, so a failed payment never produces a paid order.
- A **declined card does not end the order**. Stripe Checkout keeps the session open so the shopper can try another card, so `payment_intent.payment_failed` only records the attempt; the order is failed when the session expires (or an async payment fails). If a success still arrives for an order that was already failed, `mark_order_paid` takes its stock back and honours it — the shopper has been charged either way.
- An order becomes `paid` **only** from a signed, idempotent payment-provider webhook (`mark_order_paid`, service role only). The browser never writes payment status. A webhook that fails to apply releases its idempotency claim so Stripe's retry is processed rather than silently swallowed.
- Orders that never reach the provider hold stock until `expire_stale_pending_orders()` releases them. Schedule it with pg_cron (see `supabase/migrations/20261023000000_payment_hardening.sql`).
- Card data goes to the payment provider. The mock provider stands in for it; with Supabase, the shopper is redirected to Stripe Checkout. Only the card brand and last four digits are stored.

### States and edge cases covered

Loading skeletons, empty, error and retry states on every data screen. Also covered: sold-out variants and sizes, low stock, quantity capped to stock, an item removed from the catalogue, price changed, expired coupon, under minimum spend, usage limit reached, invalid address or postal code, unserviceable area, declined card, insufficient funds, offline banner, network failure ("you have not been charged"), session expiry banner with protected-route redirect, delayed webhook (the confirmation page keeps polling), and a 404 page.

### Accessibility

Semantic landmarks, a skip link, and focus moving to the page on navigation. Visible `:focus-visible` rings. Native radios for size, colour, delivery and address so arrow keys work. Dialogs trap focus, close on Escape, lock scroll and restore focus. Touch targets are at least 44px, form errors are linked with `aria-describedby`, `aria-live` updates cover results, stock and the bag, and `prefers-reduced-motion` is respected. The palette was chosen for WCAG AA contrast in both light and dark themes.

### Performance and SEO

Every route is lazy-loaded. Images use explicit dimensions, `loading="lazy"` below the fold and `fetchpriority` for the hero. Per-page title, description, canonical URL and Open Graph tags are set, plus schema.org `Product` JSON-LD on product pages. URLs use meaningful slugs, there is a `robots.txt`, and private routes are `noindex`.

> **Imagery.** To keep the project self-contained, product photos are generated SVG garment illustrations (`garment:` URLs resolved by `lib/garment.ts`). Any `http(s)` image URL in the data is used as-is, so switching to real CDN photography (ideally AVIF/WebP with `srcset`) needs no component changes.

---

## Supabase backend

1. Create a Supabase project. Then apply the schema and seed:
   ```bash
   supabase link --project-ref <ref>
   supabase db push                       # runs supabase/migrations
   psql "$DATABASE_URL" -f supabase/seed.sql
   ```
2. Deploy the Edge Functions and set their secrets. These secrets are server-side only and must **never** be put in a `VITE_` variable:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_... STRIPE_WEBHOOK_SECRET=whsec_... SITE_URL=https://your-domain
   supabase functions deploy create-payment
   supabase functions deploy payment-webhook --no-verify-jwt
   ```
3. In Stripe, point a webhook at `https://<ref>.functions.supabase.co/payment-webhook` for these events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`, `checkout.session.async_payment_failed` and `payment_intent.payment_failed`.
4. In Supabase Auth, add `https://your-domain/reset-password` to the redirect URLs.
5. Frontend `.env`:
   ```
   VITE_DATA_SOURCE=supabase
   VITE_SUPABASE_URL=https://<ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon key>
   ```

RLS is enabled on every table. Customers can read the catalogue and their **own** profile, addresses, wishlist, orders, payments, shipments, notifications and returns. Writes that touch money, stock or order state go only through `SECURITY DEFINER` functions or the service role.

> The Supabase adapter, SQL and Edge Functions follow the same contracts as the mock backend. They have **not** been run against a live Supabase project or Stripe account in this repo. Treat the first deployment as a staging test.

## Deployment

The build targets the domain root by default. `BASE_PATH` moves it into a subdirectory; only the GitHub Pages workflow sets it.

### Vercel

Import the repository at [vercel.com/new](https://vercel.com/new). `vercel.json` supplies everything: framework preset, `npm run build`, `dist/`, SPA rewrites, immutable asset caching and security headers (HSTS, nosniff, frame-deny, referrer and permissions policies). `.npmrc` keeps the install working (`legacy-peer-deps`, needed for `@hookform/resolvers` v6 optional peers).

Set these in **Settings → Environment Variables**, per environment:

| Variable            | Value                                                     |
| ------------------- | --------------------------------------------------------- |
| `VITE_DATA_SOURCE`  | `mock`, or `supabase` with the two keys below             |
| `VITE_SITE_URL`     | the deployment's own URL, no trailing slash                |
| `VITE_CURRENCY`     | `INR`                                                      |
| `VITE_LOCALE`       | `en-IN`                                                    |

`VITE_SITE_URL` is what canonical and Open Graph URLs are built from, so a preview deployment left pointing at production will advertise the wrong canonical. Never put a service-role key or any payment secret in a `VITE_` variable — the browser can read all of them.

Pushes to `main` deploy to production; every branch and pull request gets its own preview URL.

### GitHub Pages

`.github/workflows/deploy.yml` publishes to Pages on every push to `main`. Enable it once under **Settings → Pages → Source: GitHub Actions**. The workflow sets `BASE_PATH` and `VITE_SITE_URL` from the Pages URL, builds against the mock backend, and copies the app shell to `404.html` so deep links survive — Pages has no rewrite rules.

Pages serves static files only, so this deployment always runs on the mock backend. Use Vercel for the Supabase build.

**Production checklist:**

- Environment variables are set per environment.
- HTTPS and the custom domain are configured.
- Auth redirect URLs are configured.
- The webhook secret is set.
- RLS is verified with a second test account.
- Database backups (PITR) are enabled.
- Error monitoring (e.g. Sentry) is added in `main.tsx`.
- Analytics run only behind cookie consent.
- The privacy and terms pages have been reviewed by legal.

---

## Phases → where they live

| Phase        | Delivered in                                                                                |
| ------------ | ------------------------------------------------------------------------------------------- |
| 1 Foundation | Vite + TS strict, Tailwind tokens (`index.css`), ESLint/Prettier, `components/ui`           |
| 2 UI shell   | `components/layout`, `pages/HomePage.tsx`, light/dark theme                                 |
| 3 Catalogue  | `pages/CatalogPage.tsx`, `features/products/*`, `pages/ProductDetailPage.tsx`, search panel |
| 4 Customer   | auth pages, `RequireAuth`, `pages/account/*`, wishlist sync                                 |
| 5 Commerce   | `features/cart/*`, coupons, `pages/CheckoutPage.tsx`, inventory checks                      |
| 6 Payments   | `services/mock/payments.ts` + `server.ts` (mock), `supabase/functions/*` (Stripe)           |
| 7 Quality    | `*.test.ts(x)`, `e2e/`, a11y and SEO work above                                             |
| 8 Launch     | `vercel.json`, `.github/workflows/{ci,deploy}.yml`, checklist above                        |
