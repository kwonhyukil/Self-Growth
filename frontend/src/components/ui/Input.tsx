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
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
            'transition-colors',
            error
              ? 'border-red-400 bg-red-50 focus:ring-red-400'
              : 'border-slate-300 bg-white hover:border-slate-400',
            className,
          )}
          {...rest}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
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
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={textId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textId}
          className={clsx(
            'block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400',
            'resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
            'transition-colors',
            error || over
              ? 'border-red-400 bg-red-50 focus:ring-red-400'
              : 'border-slate-300 bg-white hover:border-slate-400',
            className,
          )}
          {...rest}
        />
        <div className="flex items-start justify-between gap-2">
          <div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
          </div>
          {maxChars !== undefined && charCount !== undefined && (
            <span className={clsx('ml-auto text-xs tabular-nums', over ? 'text-red-500' : 'text-slate-400')}>
              {charCount}/{maxChars}
            </span>
          )}
        </div>
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
