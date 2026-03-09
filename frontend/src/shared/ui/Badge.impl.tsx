import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outline'
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-pill px-2.5 py-1 text-caption font-semibold',
        variant === 'default' && 'bg-surface-emphasis text-text-sub',
        variant === 'outline' && 'border border-border bg-surface-elevated text-text-sub',
        className,
      )}
    >
      {children}
    </span>
  )
}
