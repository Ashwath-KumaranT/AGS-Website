import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Overlay';
import { Skeleton } from '@/components/ui/primitives';
import { useT } from '@/i18n';
import { formatMoney } from '@/lib/format';
import { useUiStore } from '@/store/uiStore';
import { CartLineItem } from './CartLineItem';
import { FreeShippingBar } from './CartSummary';
import { useCartDetails } from './hooks';

export function CartDrawer() {
  const open = useUiStore((s) => s.cartOpen);
  const close = useUiStore((s) => s.closeCart);
  const navigate = useNavigate();
  const cart = useCartDetails();
  const { t } = useT();

  const goCheckout = () => {
    close();
    navigate('/checkout');
  };

  return (
    <Drawer
      open={open}
      onClose={close}
      title={cart.count ? t('Your bag ({count})', { count: cart.count }) : t('Your bag')}
      footer={
        cart.active.length > 0 ? (
          <div className="space-y-3 [@media(max-height:32rem)]:space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted">{t('Subtotal')}</span>
              <span className="text-lg font-medium tabular-nums">
                {formatMoney(cart.totals.subtotal - cart.totals.discount)}
              </span>
            </div>
            <p className="text-xs text-muted [@media(max-height:32rem)]:hidden">
              {t('Shipping and taxes are calculated at checkout.')}
            </p>
            {/* short screens (phones in landscape): buttons side by side to leave room for items */}
            <div className="grid gap-3 [@media(max-height:32rem)]:grid-cols-2 [@media(max-height:32rem)]:gap-2">
              <Button
                block
                size="lg"
                onClick={goCheckout}
                disabled={cart.hasIssues || cart.purchasable.length === 0}
              >
                {t('Checkout')}
              </Button>
              <ButtonLink to="/cart" variant="outline" block onClick={close}>
                {t('View bag')}
              </ButtonLink>
            </div>
          </div>
        ) : undefined
      }
    >
      <div className="px-5">
        {cart.isLoading ? (
          <div className="space-y-5 py-5" role="status" aria-label={t('Loading your bag')}>
            {[0, 1].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="aspect-[4/5] w-20" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : cart.active.length === 0 && cart.saved.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <ShoppingBag className="mb-4 size-10 text-muted" aria-hidden />
            <p className="font-display text-xl">{t('Your bag is empty')}</p>
            <p className="mt-1 text-sm text-muted">{t('Find something you love.')}</p>
            <ButtonLink to="/shop" className="mt-6" onClick={close}>
              {t('Start shopping')}
            </ButtonLink>
          </div>
        ) : (
          <>
            {cart.active.length > 0 ? (
              <>
                <div className="pt-4">
                  <FreeShippingBar
                    subtotalAfterDiscount={cart.totals.subtotal - cart.totals.discount}
                  />
                </div>
                <ul className="divide-y divide-border" aria-label={t('Items in your bag')}>
                  {cart.active.map((item) => (
                    <CartLineItem
                      key={item.line.variantId}
                      item={item}
                      compact
                      onNavigate={close}
                    />
                  ))}
                </ul>
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="font-display text-xl">{t('Your bag is empty')}</p>
                <p className="mt-1 text-sm text-muted">
                  {t('Move a saved item back to your bag when you’re ready.')}
                </p>
              </div>
            )}

            {cart.saved.length > 0 && (
              <section aria-labelledby="drawer-saved-h" className="border-t border-border pt-5">
                <h3 id="drawer-saved-h" className="eyebrow font-sans">
                  {t('Saved for later ({count})', { count: cart.saved.length })}
                </h3>
                <ul className="divide-y divide-border" aria-label={t('Saved for later')}>
                  {cart.saved.map((item) => (
                    <CartLineItem
                      key={item.line.variantId}
                      item={item}
                      compact
                      onNavigate={close}
                    />
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </Drawer>
  );
}
