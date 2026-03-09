import { clsx } from 'clsx'
import { AppError } from '@/shared/api/client'

interface ErrorMessageProps {
  error: unknown
  className?: string
}

export function ErrorMessage({ error, className }: ErrorMessageProps) {
  const message =
    error instanceof AppError
      ? error.message
      : error instanceof Error
        ? error.message
        : '오류가 발생했습니다.'

  return (
    <div
      role="alert"
      className={clsx(
        'rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700',
        className,
      )}
    >
      {message}
    </div>
  )
}

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="text-4xl">{icon}</span>
      <h3 className="text-base font-semibold text-text-sub">{title}</h3>
      {description && <p className="text-sm text-text-soft max-w-xs">{description}</p>}
      {action}
    </div>
  )
}
