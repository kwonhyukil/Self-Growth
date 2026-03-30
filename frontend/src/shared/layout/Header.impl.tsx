import { NavLink, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/auth-provider'
import { Button } from '@/shared/ui/Button'
import { getActiveNavPath, navLinks, routeMeta } from './nav'

export function Header() {
  const { user, logout } = useAuthContext()
  const { pathname } = useLocation()
  const currentPath = getActiveNavPath(pathname)
  const currentMeta = routeMeta[currentPath]

  return (
    <header className="border-b border-white/60 bg-surface-elevated/70 px-6 py-4 backdrop-blur-md md:px-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="agent-pill">Calm Journal Workspace</p>
            <h1 className="mt-3 text-2xl font-semibold text-text-main">{currentMeta.title}</h1>
            <p className="mt-2 text-sm text-text-soft">{currentMeta.description}</p>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="rounded-full border border-white/70 bg-white/60 px-4 py-2 text-right backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-disabled">
                  Member
                </p>
                <p className="text-sm font-medium text-text-main">{user.name}</p>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Primary navigation">
          {navLinks.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'border-primary-200 bg-primary-50 text-primary-700'
                    : 'border-white/70 bg-white/60 text-text-sub hover:bg-white',
                ].join(' ')
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
