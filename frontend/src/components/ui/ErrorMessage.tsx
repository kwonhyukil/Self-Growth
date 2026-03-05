import { clsx } from 'clsx'
import { AppError } from '../../api/client'

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
        : '予期しないエラーが発生しました。'

  return (
    <div
      role="alert"
      className={clsx(
        'rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700',
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
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}
