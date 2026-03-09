import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="field-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'block w-full rounded-control border px-4 py-3 text-body text-text-main placeholder:text-text-disabled',
            'focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent',
            'transition-all duration-180 ease-smooth',
            error
              ? 'border-error-300 bg-error-50 focus:ring-error-300'
              : 'border-border bg-surface-elevated hover:border-border-strong',
            className,
          )}
          {...rest}
        />
        {error && <p className="text-caption text-error-700">{error}</p>}
        {hint && !error && <p className="text-caption text-text-soft">{hint}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  charCount?: number
  maxChars?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, charCount, maxChars, className, id, ...rest }, ref) => {
    const textId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    const over = maxChars !== undefined && charCount !== undefined && charCount > maxChars
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textId} className="field-label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textId}
          className={clsx(
            'block w-full rounded-control border px-4 py-3 text-body text-text-main placeholder:text-text-disabled',
            'resize-none focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent',
            'transition-all duration-180 ease-smooth',
            error || over
              ? 'border-error-300 bg-error-50 focus:ring-error-300'
              : 'border-border bg-surface-elevated hover:border-border-strong',
            className,
          )}
          {...rest}
        />
        <div className="flex items-start justify-between gap-3">
          <div>
            {error && <p className="text-caption text-error-700">{error}</p>}
            {hint && !error && <p className="text-caption text-text-soft">{hint}</p>}
          </div>
          {maxChars !== undefined && charCount !== undefined && (
            <span className={clsx('ml-auto text-caption tabular-nums', over ? 'text-error-600' : 'text-text-soft')}>
              {charCount}/{maxChars}
            </span>
          )}
        </div>
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
