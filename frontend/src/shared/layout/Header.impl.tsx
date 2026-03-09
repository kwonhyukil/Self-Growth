import { useAuthContext } from '@/features/auth/auth-provider'
import { Button } from '@/shared/ui/Button'

export function Header() {
  const { user, logout } = useAuthContext()

  return (
    <header className="flex h-18 shrink-0 items-center justify-between border-b border-border-subtle bg-surface-elevated/90 px-6 backdrop-blur-sm md:px-8">
      <div />
      <div className="flex items-center gap-3">
        {user && <span className="text-bodySm font-medium text-text-sub">{user.name}</span>}
        <Button variant="ghost" size="sm" onClick={logout}>
          ログアウト
        </Button>
      </div>
    </header>
  )
}
