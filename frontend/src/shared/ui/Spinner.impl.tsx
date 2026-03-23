import { clsx } from 'clsx'
import { Dots, Levels } from 'react-activity'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  variant?: 'dots' | 'levels'
}

const sizes = { sm: 10, md: 14, lg: 18 }

export function Spinner({ size = 'md', className, variant = 'dots' }: SpinnerProps) {
  return (
    <div className={clsx('inline-flex items-center justify-center', className)} aria-hidden="true">
      {variant === 'levels' ? (
        <Levels size={sizes[size]} color="#5f8e64" speed={0.9} />
      ) : (
        <Dots size={sizes[size]} color="#5f8e64" speed={0.9} />
      )}
    </div>
  )
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-canvas">
      <div className="journal-frame flex flex-col items-center gap-4 px-8 py-10">
        <Spinner size="lg" variant="levels" />
        <div className="text-center">
          <p className="agent-pill">Preparing Workspace</p>
          <p className="mt-3 text-sm text-text-soft">기록과 AI 흐름을 불러오는 중입니다.</p>
        </div>
      </div>
    </div>
  )
}
