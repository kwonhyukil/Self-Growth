import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { LayoutDashboard, BookOpen, BarChart2, type LucideIcon } from 'lucide-react'

const links: { to: string; label: string; sub: string; Icon: LucideIcon }[] = [
  { to: '/', label: 'Dashboard', sub: 'AI workspace', Icon: LayoutDashboard },
  { to: '/logs', label: 'Logs', sub: 'Journal archive', Icon: BookOpen },
  { to: '/stats', label: 'Stats', sub: 'Growth signals', Icon: BarChart2 },
]

export function Sidebar() {
  return (
    <aside className="hidden w-80 shrink-0 border-r border-white/50 bg-[linear-gradient(180deg,rgba(255,253,248,0.92),rgba(247,240,229,0.88))] px-5 py-6 backdrop-blur-md lg:flex lg:flex-col">
      <div className="journal-frame p-5">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-primary-100 text-3xl shadow-soft ring-1 ring-primary-200">
            🌿
          </span>
          <div>
            <p className="journal-title text-2xl">Self Growth Log</p>
            <p className="mt-1 text-sm leading-relaxed text-text-soft">
              Calm journal for emotion tracking, language feedback, and AI-guided reflection.
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-2">
        {links.map(({ to, label, sub, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'block rounded-[1.4rem] border px-4 py-4 transition-all duration-180 ease-smooth',
                isActive
                  ? 'border-primary-200 bg-white/85 shadow-soft'
                  : 'border-transparent bg-transparent hover:border-white/70 hover:bg-white/50',
              )
            }
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-emphasis text-text-sub">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-text-main">{label}</p>
                <p className="text-xs text-text-soft">{sub}</p>
              </div>
            </div>
          </NavLink>
        ))}
      </nav>

      <div className="journal-frame p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-disabled">
          Writing Compass
        </p>
        <p className="mt-2 text-sm leading-relaxed text-text-sub">
          Chat Agent가 흐름을 제안하고, Feedback Agent가 문장을 다듬고, Insight Agent가 의미를 깊게 만듭니다.
        </p>
      </div>
    </aside>
  )
}
