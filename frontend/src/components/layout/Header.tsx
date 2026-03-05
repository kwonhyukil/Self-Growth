import { useAuthContext } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'

export function Header() {
  const { user, logout } = useAuthContext()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-surface-border bg-white px-6">
      <div />
      <div className="flex items-center gap-3">
        {user && (
          <span className="text-sm text-slate-600">
            {user.name}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={logout}>
          ログアウト
        </Button>
      </div>
    </header>
  )
}
