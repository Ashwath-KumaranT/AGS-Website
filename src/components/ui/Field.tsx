import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';

const controlClass =
  'block w-full rounded-[3px] border bg-surface px-3.5 text-[0.9375rem] text-fg placeholder:text-muted/70 transition-colors duration-150 hover:border-fg/40 focus:border-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60';

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
  hideLabel?: boolean;
}

function FieldShell({
  label,
  error,
  hint,
  className,
  hideLabel,
  id,
  children,
}: FieldShellProps & { id: string; children: ReactNode }) {
  const { tm } = useT();
  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={id}
        className={cn('block text-[0.8125rem] font-medium', hideLabel && 'sr-only')}
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {typeof hint === 'string' ? tm(hint) : hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-sale">
          {tm(error)}
        </p>
      )}
    </div>
  );
}

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>, Omit<FieldShellProps, 'className'> {
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, wrapperClassName, hideLabel, id, ...props }, ref) => {
    const auto = useId();
    const fid = id ?? auto;
    return (
      <FieldShell
        id={fid}
        label={label}
        error={error}
        hint={hint}
        className={wrapperClassName}
        hideLabel={hideLabel}
      >
        <input
          ref={ref}
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
          className={cn(
            controlClass,
            'h-11',
            error ? 'border-sale' : 'border-border-strong',
            className,
          )}
          {...props}
        />
      </FieldShell>
    );
  },
);
Input.displayName = 'Input';

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement>, Omit<FieldShellProps, 'className'> {
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className, wrapperClassName, hideLabel, id, children, ...props }, ref) => {
    const auto = useId();
    const fid = id ?? auto;
    return (
      <FieldShell
        id={fid}
        label={label}
        error={error}
        hint={hint}
        className={wrapperClassName}
        hideLabel={hideLabel}
      >
        <select
          ref={ref}
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
          className={cn(
            controlClass,
            'h-11 appearance-none bg-no-repeat pr-9',
            error ? 'border-sale' : 'border-border-strong',
            className,
          )}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none' stroke='%23888' stroke-width='1.6'><path d='M1 1.5 6 6.5 11 1.5'/></svg>\")",
            backgroundPosition: 'right 0.9rem center',
          }}
          {...props}
        >
          {children}
        </select>
      </FieldShell>
    );
  },
);
Select.displayName = 'Select';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>, Omit<FieldShellProps, 'className'> {
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, wrapperClassName, hideLabel, id, ...props }, ref) => {
    const auto = useId();
    const fid = id ?? auto;
    return (
      <FieldShell
        id={fid}
        label={label}
        error={error}
        hint={hint}
        className={wrapperClassName}
        hideLabel={hideLabel}
      >
        <textarea
          ref={ref}
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
          className={cn(
            controlClass,
            'min-h-24 py-2.5',
            error ? 'border-sale' : 'border-border-strong',
            className,
          )}
          {...props}
        />
      </FieldShell>
    );
  },
);
Textarea.displayName = 'Textarea';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, ...props }, ref) => {
    const auto = useId();
    const fid = id ?? auto;
    return (
      <label
        htmlFor={fid}
        className={cn('flex min-h-11 cursor-pointer items-center gap-3 text-sm', className)}
      >
        <input
          ref={ref}
          id={fid}
          type="checkbox"
          className="size-[1.125rem] shrink-0 cursor-pointer rounded-[3px] border-border-strong accent-[var(--accent)]"
          {...props}
        />
        <span>{label}</span>
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';
