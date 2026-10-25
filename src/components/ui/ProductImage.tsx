import { useState, type ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { resolveImage } from '@/lib/garment';

interface ProductImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  /** hint for browsers: eagerly load above-the-fold imagery */
  priority?: boolean;
}

/** Responsive, lazy-loaded image with a skeleton while loading. Accepts CDN URLs or garment: URLs. */
export function ProductImage({ src, alt, priority, className, ...props }: ProductImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={cn('relative overflow-hidden bg-subtle', className)}>
      {!loaded && <div className="skeleton absolute inset-0" aria-hidden />}
      <img
        src={resolveImage(src)}
        alt={alt}
        width={400}
        height={500}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        className={cn(
          'size-full object-cover transition-[opacity,transform] duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
        {...props}
      />
    </div>
  );
}
