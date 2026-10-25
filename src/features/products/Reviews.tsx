import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, Star } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';
import { Rating, Skeleton } from '@/components/ui/primitives';
import { useAuthStore } from '@/features/auth/authStore';
import { qk, useReviews } from '@/hooks/queries';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { reviewSchema, type ReviewValues } from '@/lib/validation';
import { api } from '@/services';
import { toast } from '@/store/uiStore';
import type { ProductWithVariants } from '@/types';

function StarInput({
  value,
  onChange,
  error,
}: {
  value: number;
  onChange: (n: number) => void;
  error?: string;
}) {
  const { t, tm } = useT();
  return (
    <fieldset>
      <legend className="mb-1.5 text-[0.8125rem] font-medium">{t('Your rating')}</legend>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer p-1">
            <input
              type="radio"
              name="rating"
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="peer sr-only"
              aria-label={
                n === 1 ? t('{count} star', { count: n }) : t('{count} stars', { count: n })
              }
            />
            <Star
              className={cn(
                'size-7 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-[var(--ring)]',
                n <= value ? 'fill-fg text-fg' : 'text-border-strong',
              )}
              aria-hidden
            />
          </label>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-sale">
          {tm(error)}
        </p>
      )}
    </fieldset>
  );
}

function ReviewForm({ product, onDone }: { product: ProductWithVariants; onDone: () => void }) {
  const qc = useQueryClient();
  const { t } = useT();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, title: '', body: '' },
  });

  const mutation = useMutation({
    mutationFn: (v: ReviewValues) => api.catalog.addReview({ productId: product.id, ...v }),
    onSuccess: async () => {
      toast.success('Thanks for your review');
      await Promise.all([
        qc.invalidateQueries({ queryKey: qk.reviews(product.id) }),
        qc.invalidateQueries({ queryKey: ['product'] }),
      ]);
      onDone();
    },
    onError: (e) =>
      toast.error('Could not submit review', e instanceof Error ? e.message : undefined),
  });

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      className="mt-6 space-y-4 rounded-[6px] border border-border p-5"
      noValidate
    >
      <h3 className="font-display text-xl">{t('Write a review')}</h3>
      <Controller
        control={control}
        name="rating"
        render={({ field }) => (
          <StarInput value={field.value} onChange={field.onChange} error={errors.rating?.message} />
        )}
      />
      <Input label={t('Title')} error={errors.title?.message} {...register('title')} />
      <Textarea label={t('Review')} error={errors.body?.message} {...register('body')} />
      <div className="flex gap-2">
        <Button type="submit" loading={mutation.isPending}>
          {t('Submit review')}
        </Button>
        <Button variant="ghost" onClick={onDone}>
          {t('Cancel')}
        </Button>
      </div>
    </form>
  );
}

export function Reviews({ product }: { product: ProductWithVariants }) {
  const { data: reviews, isLoading } = useReviews(product.id);
  const user = useAuthStore((s) => s.user);
  const [writing, setWriting] = useState(false);
  const { t } = useT();
  // "{link}" marks where the sign-in link goes, so the word order can differ per language
  const [signInBefore = '', signInAfter = ''] = t('{link} to write a review.').split('{link}');

  const dist = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews?.filter((r) => Math.round(r.rating) === n).length ?? 0,
  }));
  const max = Math.max(1, ...dist.map((d) => d.count));

  return (
    <section
      id="reviews"
      className="container-page scroll-mt-24 py-12 md:py-16"
      aria-labelledby="reviews-h"
    >
      <h2 id="reviews-h" className="mb-8 text-3xl md:text-4xl">
        {t('Customer reviews')}
      </h2>
      <div className="grid gap-10 md:grid-cols-[17.5rem_1fr] lg:grid-cols-[20rem_1fr]">
        <div>
          <p className="font-display text-6xl">{product.rating.toFixed(1)}</p>
          <Rating value={product.rating} size={18} className="mt-1" />
          <p className="mt-1 text-sm text-muted">
            {t('Based on {count} reviews', { count: product.review_count })}
          </p>
          <p className="mt-5 text-xs text-muted">
            {t('Breakdown of the {count} most recent reviews', { count: reviews?.length ?? 0 })}
          </p>
          <ul className="mt-2 space-y-1.5" aria-label={t('Rating distribution of recent reviews')}>
            {dist.map((d) => (
              <li key={d.n} className="flex items-center gap-3 text-xs text-muted">
                <span className="w-8 tabular-nums">{d.n} ★</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-subtle">
                  <span
                    className="block h-full bg-fg"
                    style={{ width: `${(d.count / max) * 100}%` }}
                  />
                </span>
                <span className="w-5 text-right tabular-nums">{d.count}</span>
              </li>
            ))}
          </ul>
          {!writing && (
            <div className="mt-6">
              {user ? (
                <Button variant="outline" onClick={() => setWriting(true)}>
                  {t('Write a review')}
                </Button>
              ) : (
                <p className="text-sm text-muted">
                  {signInBefore}
                  <Link
                    to="/sign-in"
                    state={{ from: `/product/${product.slug}` }}
                    className="font-medium text-fg underline underline-offset-4"
                  >
                    {t('Sign in')}
                  </Link>
                  {signInAfter}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          {writing && <ReviewForm product={product} onDone={() => setWriting(false)} />}
          {isLoading ? (
            <div className="space-y-6" role="status" aria-label={t('Loading reviews')}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : reviews && reviews.length > 0 ? (
            <ul className="divide-y divide-border">
              {reviews.map((r) => (
                <li key={r.id} className="py-6 first:pt-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Rating value={r.rating} />
                    <time dateTime={r.created_at} className="text-xs text-muted">
                      {formatDate(r.created_at)}
                    </time>
                  </div>
                  <p className="mt-2 font-medium">{r.title}</p>
                  <p className="mt-1 text-[0.9375rem] text-muted">{r.body}</p>
                  <p className="mt-3 flex items-center gap-2 text-xs text-muted">
                    {r.author_name}
                    {r.verified_purchase && (
                      <span className="inline-flex items-center gap-1 text-success">
                        <BadgeCheck className="size-3.5" aria-hidden /> {t('Verified purchase')}
                      </span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">
              {t('No reviews yet — be the first to share your thoughts.')}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
