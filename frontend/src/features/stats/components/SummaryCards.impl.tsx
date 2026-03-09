import { clsx } from 'clsx'

interface StatCardProps {
  icon: string
  label: string
  value: string | number
  sub?: string
  highlight?: boolean
}

export function StatCard({ icon, label, value, sub, highlight }: StatCardProps) {
  return (
    <div className={clsx('dashboard-panel p-4', highlight && 'border-primary-200 bg-primary-50/60')}>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-emphasis text-2xl shadow-soft">{icon}</span>
        <div>
          <p className="mb-1 text-caption text-text-soft">{label}</p>
          <p className={clsx('text-h2 font-semibold', highlight ? 'text-primary-700' : 'text-text-main')}>
            {value}
          </p>
          {sub && <p className="mt-1 text-caption text-text-soft">{sub}</p>}
        </div>
      </div>
    </div>
  )
}
