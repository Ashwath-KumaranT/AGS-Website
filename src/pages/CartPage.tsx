import { Lock, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/Button';
import {
  Breadcrumbs,
  EmptyState,
  ErrorState,
  InlineAlert,
  Skeleton,
} from '@/components/ui/primitives';
import { CartLineItem } from '@/features/cart/CartLineItem';
import { CouponForm, FreeShippingBar, TotalsTable } from '@/features/cart/CartSummary';
import { useCartDetails } from '@/features/cart/hooks';
import { ProductSection } from '@/features/products/ProductSection';
import { useT } from '@/i18n';
import { formatMoney } from '@/lib/format';

export default function CartPage() {
  const cart = useCartDetails();
  const navigate = useNavigate();
  const { t } = useT();
  const blocked = cart.hasIssues || cart.purchasable.length === 0;

  return (
    <div className="container-page py-6 md:py-10">
      <Seo title={t('Your bag')} noindex />
      <Breadcrumbs items={[{ label: t('Home'), to: '/' }, { label: t('Bag') }]} />
      <h1 className="mb-8 mt-4 text-4xl md:text-5xl">
        {t('Your bag')}
        {cart.count > 0 && (
          <span className="ml-3 align-middle font-sans text-base text-muted">
            {cart.count === 1
              ? t('({count} item)', { count: cart.count })
              : t('({count} items)', { count: cart.count })}
          </span>
        )}
      </h1>

      {cart.isLoading ? (
        <div
          className="grid gap-10 lg:grid-cols-[1fr_25rem]"
          role="status"
          aria-label={t('Loading your bag')}
        >
          <div className="space-y-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-5">
                <Skeleton className="aspect-[4/5] w-28" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      ) : cart.isError ? (
        <ErrorState title={t('We couldn’t load your bag')} onRetry={() => void cart.refetch()} />
      ) : cart.active.length === 0 && cart.saved.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="size-6" aria-hidden />}
          title={t('Your bag is empty')}
          description={t('Looks like you haven’t added anything yet.')}
          action={{ label: t('Start shopping'), to: '/shop' }}
        />
      ) : (
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_25rem] xl:gap-16">
          <div>
            {cart.hasIssues && (
              <InlineAlert tone="warning" className="mb-4">
                {t('Some items in your bag need attention before you can check out.')}
              </InlineAlert>
            )}
            {cart.active.length > 0 ? (
              <ul
                className="divide-y divide-border border-y border-border"
                aria-label={t('Items in your bag')}
              >
                {cart.active.map((item) => (
                  <CartLineItem key={item.line.variantId} item={item} />
                ))}
              </ul>
            ) : (
              <p className="border-y border-border py-8 text-center text-muted">
                {t('Nothing in your bag right now.')}{' '}
                <Link to="/shop" className="font-medium text-fg underline underline-offset-4">
                  {t('Keep shopping')}
                </Link>
              </p>
            )}

            {cart.saved.length > 0 && (
              <section className="mt-12" aria-labelledby="saved-h">
                <h2 id="saved-h" className="mb-2 text-2xl">
                  {t('Saved for later ({count})', { count: cart.saved.length })}
                </h2>
                <ul className="divide-y divide-border border-y border-border">
                  {cart.saved.map((item) => (
                    <CartLineItem key={item.line.variantId} item={item} />
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside
            aria-label={t('Order summary')}
            className="rounded-[6px] border border-border bg-surface p-5 md:p-6 lg:sticky lg:top-24"
          >
            <h2 className="mb-4 text-2xl">{t('Order summary')}</h2>
            <div className="space-y-5">
              <FreeShippingBar
                subtotalAfterDiscount={cart.totals.subtotal - cart.totals.discount}
              />
              <CouponForm
                applied={cart.coupon}
                error={cart.couponError}
                checking={cart.couponChecking}
              />
              <TotalsTable
                totals={cart.totals}
                couponCode={cart.coupon?.code}
                shippingLabel={t('Shipping (standard)')}
              />
              <Button
                size="lg"
                block
                disabled={blocked}
                onClick={() => navigate('/checkout')}
                data-testid="checkout-cta"
              >
                <Lock className="size-4" aria-hidden />
                {t('Checkout · {amount}', { amount: formatMoney(cart.totals.total) })}
              </Button>
              {blocked && cart.purchasable.length > 0 && (
                <p className="text-center text-xs text-sale">
                  {t('Resolve the highlighted items to continue.')}
                </p>
              )}
              <p className="text-center text-xs text-muted">
                {t('Final delivery cost and tax are confirmed at checkout.')}
              </p>
            </div>
          </aside>
        </div>
      )}

      <ProductSection
        eyebrow={t('Customers also bought')}
        title={t('Recommended for you')}
        query={{ collection: 'best-sellers', pageSize: 4 }}
      />
    </div>
  );
}
