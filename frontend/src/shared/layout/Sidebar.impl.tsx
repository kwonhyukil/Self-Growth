import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { LayoutDashboard, BookOpen, BarChart2, type LucideIcon } from 'lucide-react'

const links: { to: string; label: string; Icon: LucideIcon }[] = [
  { to: '/', label: 'ダッシュボード', Icon: LayoutDashboard },
  { to: '/logs', label: 'ログ', Icon: BookOpen },
  { to: '/stats', label: '統計', Icon: BarChart2 },
]

export function Sidebar() {
  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-border-subtle bg-surface-elevated/95 backdrop-blur-sm">
      <div className="flex h-18 items-center gap-3 border-b border-border-subtle px-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-2xl shadow-soft ring-1 ring-primary-200">🌱</span>
        <div>
          <p className="text-bodySm font-semibold leading-tight text-text-main">Self Growth Log</p>
          <p className="text-caption text-text-soft">日本語コーチング記録</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 p-4 pt-5">
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-control px-4 py-3 text-bodySm font-medium transition-all duration-180 ease-smooth',
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-soft ring-1 ring-primary-200'
                  : 'text-text-sub hover:bg-surface-subtle hover:text-text-main',
              )
            }
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-emphasis">
              <Icon className="h-4 w-4" />
            </span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border-subtle p-5">
        <div className="rounded-panel bg-surface-subtle px-4 py-3 text-center">
          <p className="text-caption text-text-soft">継続は力なり。</p>
        </div>
      </div>
    </aside>
  )
}
