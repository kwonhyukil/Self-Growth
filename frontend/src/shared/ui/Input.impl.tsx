import { forwardRef, useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...rest }, ref) => {
    const fallbackId = useId()
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-') ?? fallbackId
    const errorId = error ? `${inputId}-error` : undefined
    const hintId = hint && !error ? `${inputId}-hint` : undefined
    const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined
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
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
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
        {error && (
          <p id={errorId} className="text-caption text-error-700">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-caption text-text-soft">
            {hint}
          </p>
        )}
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
    const fallbackId = useId()
    const textId = id ?? label?.toLowerCase().replace(/\s+/g, '-') ?? fallbackId
    const over = maxChars !== undefined && charCount !== undefined && charCount > maxChars
    const errorId = error || over ? `${textId}-error` : undefined
    const hintId = hint && !error && !over ? `${textId}-hint` : undefined
    const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined
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
          aria-invalid={error || over ? true : undefined}
          aria-describedby={describedBy}
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
            {error && (
              <p id={errorId} className="text-caption text-error-700">
                {error}
              </p>
            )}
            {hint && !error && !over && (
              <p id={hintId} className="text-caption text-text-soft">
                {hint}
              </p>
            )}
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
