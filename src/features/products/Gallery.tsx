import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useRef, useState, type MouseEvent, type TouchEvent } from 'react';
import { ProductImage } from '@/components/ui/ProductImage';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { resolveImage } from '@/lib/garment';

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const { t } = useT();
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const touchX = useRef<number | null>(null);
  const safe = Math.min(index, Math.max(0, images.length - 1));
  const go = (i: number) => setIndex((i + images.length) % images.length);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
    if (Math.abs(dx) > 40) go(safe + (dx < 0 ? 1 : -1));
    touchX.current = null;
  };

  return (
    <div className="grid content-start gap-3 lg:grid-cols-[4.5rem_1fr] lg:gap-4">
      <ul
        className="no-scrollbar order-2 flex gap-2 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-visible"
        aria-label={t('Product images')}
      >
        {images.map((src, i) => (
          <li key={src + i} className="shrink-0">
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={t('Show image {index} of {total}', {
                index: i + 1,
                total: images.length,
              })}
              aria-current={i === safe}
              className={cn(
                'block w-16 overflow-hidden rounded-[3px] border-2 transition-colors lg:w-[4.5rem]',
                i === safe ? 'border-fg' : 'border-transparent hover:border-border-strong',
              )}
            >
              <ProductImage src={src} alt="" className="aspect-[4/5] w-full" />
            </button>
          </li>
        ))}
      </ul>

      <div className="relative order-1 self-start lg:order-2">
        <div
          className="group relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-[4px] bg-subtle"
          onMouseMove={onMove}
          onMouseLeave={() => setZoom(null)}
          onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
          onTouchEnd={onTouchEnd}
        >
          <ProductImage
            key={images[safe]}
            src={images[safe] ?? ''}
            alt={t('{title} — view {index}', { title, index: safe + 1 })}
            priority
            className="absolute inset-0 animate-fade-in"
          />
          {zoom && images[safe] && (
            <div
              aria-hidden
              className="absolute inset-0 hidden bg-no-repeat md:block"
              style={{
                backgroundImage: `url("${resolveImage(images[safe] as string)}")`,
                backgroundSize: '220%',
                backgroundPosition: `${zoom.x}% ${zoom.y}%`,
              }}
            />
          )}
          <span className="pointer-events-none absolute bottom-3 left-3 hidden items-center gap-1.5 rounded-full bg-bg/85 px-3 py-1.5 text-xs backdrop-blur md:inline-flex">
            <ZoomIn className="size-3.5" aria-hidden /> {t('Hover to zoom')}
          </span>
        </div>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(safe - 1)}
              aria-label={t('Previous image')}
              className="absolute left-2 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-bg/85 backdrop-blur hover:bg-bg"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(safe + 1)}
              aria-label={t('Next image')}
              className="absolute right-2 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-bg/85 backdrop-blur hover:bg-bg"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
