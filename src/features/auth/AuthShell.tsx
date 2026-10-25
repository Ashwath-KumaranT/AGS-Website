import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ProductImage } from '@/components/ui/ProductImage';
import { useT } from '@/i18n';
import { garmentUrl } from '@/lib/garment';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useT();
  return (
    <div className="container-page grid min-h-[70vh] items-stretch gap-0 py-8 md:py-14 lg:grid-cols-2 lg:gap-16">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center">
        <Link to="/" className="eyebrow mb-8 hover:text-fg">
          ← {t('Back to store')}
        </Link>
        <h1 className="text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-8 text-center text-sm text-muted">{footer}</div>}
      </div>
      <div className="relative hidden overflow-hidden rounded-[6px] lg:block">
        <ProductImage
          src={garmentUrl('jacket', 'c8b6a0', 1)}
          alt=""
          className="absolute inset-0 h-full"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-10 text-white">
          <p className="font-display text-3xl">{t('Made to be lived in.')}</p>
          <p className="mt-2 max-w-xs text-sm text-white/80">
            {t('Members get early access, easy returns and order tracking.')}
          </p>
        </div>
      </div>
    </div>
  );
}
