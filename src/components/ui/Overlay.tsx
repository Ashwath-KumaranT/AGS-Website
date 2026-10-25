import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

let lockCount = 0;
function lockScroll(lock: boolean) {
  lockCount += lock ? 1 : -1;
  document.body.style.overflow = lockCount > 0 ? 'hidden' : '';
}

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** visually hide the title but keep it for screen readers */
  hideTitle?: boolean;
  children: ReactNode;
  placement: 'center' | 'right' | 'left' | 'top';
  className?: string;
  footer?: ReactNode;
}

/** Accessible dialog primitive: focus trap, Escape to close, scroll lock, focus restore. */
function Overlay({
  open,
  onClose,
  title,
  hideTitle,
  children,
  placement,
  className,
  footer,
}: OverlayProps) {
  const { t } = useT();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    lockScroll(true);
    const panel = panelRef.current;
    const first =
      panel?.querySelector<HTMLElement>('[data-autofocus]') ??
      panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = items[0] as HTMLElement;
      const lastEl = items[items.length - 1] as HTMLElement;
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      lockScroll(false);
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div className="animate-fade-in absolute inset-0 bg-black/45" onClick={onClose} aria-hidden />
      <div
        className={cn(
          'absolute flex max-h-full',
          placement === 'center' && 'inset-0 items-end justify-center p-0 sm:items-center sm:p-6',
          placement === 'right' && 'inset-y-0 right-0 justify-end',
          placement === 'left' && 'inset-y-0 left-0',
          placement === 'top' && 'inset-x-0 top-0',
        )}
        onClick={placement === 'center' ? onClose : undefined}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'flex flex-col bg-bg text-fg shadow-2xl outline-none',
            placement === 'center' &&
              'animate-slide-up max-h-[92dvh] w-full rounded-t-xl sm:max-w-xl sm:rounded-lg',
            placement === 'right' && 'animate-slide-in-right h-dvh w-full max-w-[27.5rem]',
            placement === 'left' && 'animate-slide-in-left h-dvh w-full max-w-[23.75rem]',
            placement === 'top' && 'animate-fade-in max-h-[88dvh] w-full',
            className,
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5 [@media(max-height:32rem)]:py-1.5">
            <h2 id={titleId} className={cn('font-display text-xl', hideTitle && 'sr-only')}>
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('Close')}
              className="-mr-2 inline-flex size-11 items-center justify-center rounded-full hover:bg-subtle"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer && (
            <div className="border-t border-border bg-bg px-5 py-4 [@media(max-height:32rem)]:py-2.5">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function TopSheet(props: Omit<OverlayProps, 'placement'>) {
  return <Overlay {...props} placement="top" />;
}

export function Modal(props: Omit<OverlayProps, 'placement'>) {
  return <Overlay {...props} placement="center" />;
}

export function Drawer({
  side = 'right',
  ...props
}: Omit<OverlayProps, 'placement'> & { side?: 'left' | 'right' }) {
  return <Overlay {...props} placement={side} />;
}
