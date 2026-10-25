import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/lib/cn';

export const buttonVariants = cva(
  'inline-flex max-w-full items-center justify-center gap-2 text-center leading-tight rounded-[3px] font-medium tracking-wide transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        primary: 'bg-fg text-bg hover:bg-fg/85',
        accent: 'bg-accent text-accent-fg hover:bg-accent-hover',
        outline: 'border border-border-strong bg-transparent text-fg hover:bg-subtle',
        ghost: 'bg-transparent text-fg hover:bg-subtle',
        link: 'h-auto min-h-0 whitespace-normal p-0 text-fg underline underline-offset-4 hover:text-accent',
        danger: 'bg-sale text-white hover:opacity-90',
      },
      size: {
        sm: 'min-h-9 px-3.5 py-1.5 text-[0.8125rem]',
        md: 'min-h-11 px-5 py-2 text-sm',
        lg: 'min-h-12 px-7 py-2.5 text-sm uppercase tracking-[0.12em]',
        icon: 'size-11 min-h-11 min-w-11 shrink-0',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', block: false },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, block, loading, disabled, children, type = 'button', ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, block }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';

export interface ButtonLinkProps extends LinkProps, VariantProps<typeof buttonVariants> {}

export function ButtonLink({ className, variant, size, block, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ variant, size, block }), className)} {...props} />;
}
