import { Heart } from 'lucide-react';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { useWishlistToggle } from './hooks';

export function WishlistButton({
  productId,
  title,
  className,
  variant = 'overlay',
}: {
  productId: string;
  title: string;
  className?: string;
  variant?: 'overlay' | 'plain';
}) {
  const { active, toggle } = useWishlistToggle(productId, title);
  const { t } = useT();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      aria-pressed={active}
      aria-label={
        active
          ? t('Remove {title} from wishlist', { title })
          : t('Add {title} to wishlist', { title })
      }
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-full transition-colors',
        variant === 'overlay' && 'bg-bg/85 backdrop-blur hover:bg-bg',
        variant === 'plain' && 'border border-border-strong hover:bg-subtle',
        className,
      )}
    >
      <Heart
        key={String(active)}
        className={cn('size-[1.125rem]', active ? 'animate-pop fill-sale text-sale' : 'text-fg')}
        aria-hidden
      />
    </button>
  );
}
