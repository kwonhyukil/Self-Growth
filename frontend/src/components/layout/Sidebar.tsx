import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'

const links = [
  { to: '/', label: 'ダッシュボード', icon: '📊' },
  { to: '/logs', label: '成長ログ', icon: '📝' },
  { to: '/stats', label: '統計・改善', icon: '📈' },
]

export function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-surface-border bg-white">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-surface-border px-5">
        <span className="text-2xl">🌱</span>
        <div>
          <p className="text-sm font-bold text-slate-900 leading-tight">Self Growth Log</p>
          <p className="text-xs text-slate-400">成長の記録</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3 pt-4">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-surface-border p-4">
        <p className="text-xs text-slate-400 text-center">日本語コーチング</p>
      </div>
    </aside>
  )
}
