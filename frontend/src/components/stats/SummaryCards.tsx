interface StatCardProps {
  icon: string
  label: string
  value: string | number
  sub?: string
  highlight?: boolean
}

export function StatCard({ icon, label, value, sub, highlight }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-brand-200 bg-brand-50' : 'border-surface-border bg-white'}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">{label}</p>
          <p className={`text-2xl font-bold ${highlight ? 'text-brand-700' : 'text-slate-900'}`}>
            {value}
          </p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  )
}
