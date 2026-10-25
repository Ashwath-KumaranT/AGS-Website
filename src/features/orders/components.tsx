import { Check, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/primitives';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/format';
import type { Order, OrderStatus } from '@/types';

const STATUS_META: Record<
  OrderStatus,
  { label: string; tone: Parameters<typeof Badge>[0]['tone'] }
> = {
  pending_payment: { label: 'Awaiting payment', tone: 'warning' },
  payment_failed: { label: 'Payment failed', tone: 'sale' },
  paid: { label: 'Confirmed', tone: 'success' },
  processing: { label: 'Processing', tone: 'success' },
  shipped: { label: 'Shipped', tone: 'accent' },
  out_for_delivery: { label: 'Out for delivery', tone: 'accent' },
  delivered: { label: 'Delivered', tone: 'dark' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
  refunded: { label: 'Refunded', tone: 'neutral' },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useT();
  const meta = STATUS_META[status];
  return <Badge tone={meta.tone}>{t(meta.label)}</Badge>;
}

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'paid', label: 'Order confirmed' },
  { status: 'processing', label: 'Packed' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'out_for_delivery', label: 'Out for delivery' },
  { status: 'delivered', label: 'Delivered' },
];

export function TrackingTimeline({ order }: { order: Order }) {
  const { t } = useT();
  if (order.status === 'cancelled' || order.status === 'refunded') {
    return (
      <p className="rounded-[4px] bg-subtle p-4 text-sm">
        {t('This order was cancelled and your payment has been refunded.')}
      </p>
    );
  }
  const currentIdx = STEPS.findIndex((s) => s.status === order.status);
  const events = order.shipment?.events ?? [];
  return (
    <ol aria-label={t('Order progress')} className="relative">
      {STEPS.map((s, i) => {
        const done = i <= currentIdx;
        const current = i === currentIdx;
        const ev = events.find((e) => e.status === s.status);
        return (
          <li
            key={s.status}
            className="relative flex gap-4 pb-8 last:pb-0"
            aria-current={current ? 'step' : undefined}
          >
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  'absolute left-[0.8125rem] top-7 h-[calc(100%-1.75rem)] w-px',
                  i < currentIdx ? 'bg-success' : 'bg-border-strong',
                )}
              />
            )}
            <span
              className={cn(
                'relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border',
                done
                  ? 'border-success bg-success text-white'
                  : 'border-border-strong bg-bg text-muted',
                current && 'ring-4 ring-success/20',
              )}
            >
              {done ? (
                <Check className="size-4" aria-hidden />
              ) : (
                <Circle className="size-2.5" aria-hidden />
              )}
            </span>
            <div className="pt-0.5">
              <p className={cn('text-sm', done ? 'font-medium' : 'text-muted')}>
                {t(s.label)}
                {done && <span className="sr-only"> — {t('completed')}</span>}
              </p>
              {ev && (
                <p className="text-xs text-muted">
                  {formatDateTime(ev.at)} · {t(ev.location)}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
