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
    <div className={clsx('journal-frame p-4', highlight && 'border-primary-200 bg-primary-50/70')}>
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-white/70 text-2xl shadow-soft">
          {icon}
        </span>
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
