import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
  leftIcon?: React.ReactNode
}

const variants: Record<Variant, string> = {
  primary:
    'bg-primary-600 text-white shadow-soft hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-border-focus',
  secondary:
    'border border-border bg-surface-elevated text-text-main hover:border-border-strong hover:bg-surface-subtle active:bg-surface-emphasis focus-visible:ring-border-focus',
  ghost:
    'text-text-sub hover:bg-surface-emphasis hover:text-text-main active:bg-neutral-100 focus-visible:ring-border-focus',
  danger:
    'bg-error-600 text-white shadow-soft hover:bg-error-700 active:bg-error-800 focus-visible:ring-error-400',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-bodySm gap-1.5',
  md: 'h-11 px-4 text-bodySm gap-2',
  lg: 'h-12 px-5 text-body gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center rounded-control font-medium',
        'transition-all duration-180 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-elevated',
        'active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {isLoading ? <Spinner size="sm" className="text-current" /> : leftIcon}
      {children}
    </button>
  ),
)

Button.displayName = 'Button'
