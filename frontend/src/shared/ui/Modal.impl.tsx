import { useEffect, useId, useRef, type ReactNode } from 'react'
import { clsx } from 'clsx'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) return []
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    previousFocusRef.current = document.activeElement as HTMLElement | null

    const focusables = getFocusableElements(panelRef.current)
    const firstFocusable = focusables[0] ?? panelRef.current
    firstFocusable?.focus()

    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key !== 'Tab') return

      const items = getFocusableElements(panelRef.current)
      if (items.length === 0) {
        e.preventDefault()
        panelRef.current?.focus()
        return
      }

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handle)
    return () => {
      document.removeEventListener('keydown', handle)
      previousFocusRef.current?.focus()
    }
  }, [open, onClose, closeOnEscape])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={() => {
          if (closeOnBackdrop) onClose()
        }}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className={clsx(
          'relative z-10 w-full bg-surface-elevated rounded-2xl shadow-dashboard animate-slide-up',
          'max-h-[90vh] overflow-y-auto',
          sizes[size],
        )}
        tabIndex={-1}
        aria-labelledby={title ? titleId : undefined}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
            <h2 id={titleId} className="text-lg font-semibold text-text-main">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-disabled hover:bg-surface-muted hover:text-text-sub transition-colors"
              aria-label="閉じる"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
