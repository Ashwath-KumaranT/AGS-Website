import type { ReactNode } from 'react';
import { Seo } from '@/components/Seo';
import { EmptyState } from '@/components/ui/primitives';
import { useT } from '@/i18n';

function InfoPage({ title, children }: { title: string; children: ReactNode }) {
  const { tm } = useT();
  return (
    <article className="container-page max-w-3xl py-10 md:py-16">
      <Seo title={title} />
      <h1 className="mb-8 text-4xl md:text-5xl">{tm(title)}</h1>
      <div className="space-y-5 text-[0.9375rem] leading-relaxed text-muted [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-fg">
        {children}
      </div>
    </article>
  );
}

export function PrivacyPage() {
  const { t } = useT();
  return (
    <InfoPage title="Privacy policy">
      <p>
        {t(
          'We collect only what we need to fulfil your orders and improve your experience: your name, contact details, delivery addresses and order history.',
        )}
      </p>
      <h2>{t('Payments')}</h2>
      <p>
        {t(
          'Card details are sent directly to our PCI-DSS compliant payment provider. ASG never sees or stores your full card number.',
        )}
      </p>
      <h2>{t('Cookies')}</h2>
      <p>
        {t(
          'We use essential storage to remember your bag, wishlist and preferences. Analytics cookies are only set with your consent.',
        )}
      </p>
      <h2>{t('Your rights')}</h2>
      <p>
        {t(
          'You can request a copy of your data or ask us to delete your account at any time by contacting {email}.',
          { email: 'care@asg.example' },
        )}
      </p>
    </InfoPage>
  );
}

export function TermsPage() {
  const { t } = useT();
  return (
    <InfoPage title="Terms of service">
      <p>
        {t(
          'By placing an order you agree to these terms. Prices include applicable discounts and are confirmed at checkout; taxes and delivery are shown before you pay.',
        )}
      </p>
      <h2>{t('Orders')}</h2>
      <p>
        {t(
          'An order is accepted once payment is confirmed by our payment provider. If an item becomes unavailable we will refund you in full.',
        )}
      </p>
      <h2>{t('Pricing errors')}</h2>
      <p>
        {t(
          'Prices are verified on our servers at the moment you pay. If a price changes during checkout, we will ask you to review the new total before charging you.',
        )}
      </p>
    </InfoPage>
  );
}

export function ShippingPage() {
  const { t } = useT();
  return (
    <InfoPage title="Shipping & returns">
      <h2>{t('Delivery options')}</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>{t('Standard (4–6 business days): ₹99, free on orders over ₹1,999')}</li>
        <li>{t('Express (2–3 business days): ₹199')}</li>
        <li>{t('Next day (order before 2pm): ₹349')}</li>
      </ul>
      <h2>{t('Returns')}</h2>
      <p>
        {t(
          'Return unworn items with tags within 7 days of delivery for a full refund. Start a return from your order in My account and we’ll email a prepaid label.',
        )}
      </p>
      <h2>{t('Refunds')}</h2>
      <p>
        {t(
          'Refunds are issued to your original payment method within 5 business days of us receiving your return.',
        )}
      </p>
    </InfoPage>
  );
}

export function NotFoundPage() {
  return (
    <>
      <Seo title="Page not found" noindex />
      <EmptyState
        title="We can’t find that page"
        description="The link may be broken or the page may have moved."
        action={{ label: 'Back to home', to: '/' }}
        className="py-28"
      />
    </>
  );
}
