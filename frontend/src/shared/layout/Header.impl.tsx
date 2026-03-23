import { useAuthContext } from '@/features/auth/auth-provider'
import { Button } from '@/shared/ui/Button'

export function Header() {
  const { user, logout } = useAuthContext()

  return (
    <header className="border-b border-white/60 bg-surface-elevated/70 px-6 py-4 backdrop-blur-md md:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="agent-pill">Calm Journal Workspace</p>
          <p className="mt-2 text-sm text-text-soft">
            기록을 쌓고, 문장을 다듬고, 통찰을 이어가는 흐름
          </p>
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
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  )
}
