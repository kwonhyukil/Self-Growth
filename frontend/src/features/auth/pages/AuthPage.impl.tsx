import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/auth-provider'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'

type Mode = 'login' | 'signup'

const BRAND_VALUES = [
  { icon: '📝', text: '感情を記録する' },
  { icon: '🌸', text: '日本語で自分を褒める' },
  { icon: '📈', text: '成長を可視化する' },
]

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)

  const { login, signup } = useAuthContext()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await signup(email, password, name)
      }
      navigate('/')
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* ── 왼쪽 브랜드 패널 (lg 이상) ── */}
      <div className="hidden lg:flex flex-col justify-center bg-primary-600 px-16 text-white">
        <div className="text-6xl mb-6">🌱</div>
        <h2 className="text-3xl font-bold mb-3">Self Growth Log</h2>
        <p className="text-xl text-primary-100 mb-10 leading-relaxed">
          小さな記録が、<br />大きな成長になる
        </p>
        <ul className="space-y-5">
          {BRAND_VALUES.map((item) => (
            <li key={item.text} className="flex items-center gap-4">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-base text-primary-100">{item.text}</span>
            </li>
          ))}
        </ul>
        <p className="mt-14 text-primary-300 text-sm italic">「継続は力なり。」</p>
      </div>

      {/* ── 오른쪽 폼 패널 ── */}
      <div className="flex items-center justify-center bg-gradient-to-br from-primary-50 to-surface-muted p-8">
        <div className="w-full max-w-sm">
          {/* 로고 — 모바일 전용 */}
          <div className="mb-8 text-center lg:hidden">
            <span className="text-5xl">🌱</span>
            <h1 className="mt-3 text-2xl font-bold text-text-main">Self Growth Log</h1>
            <p className="mt-1 text-sm text-text-soft">日本語コーチングで成長を記録</p>
          </div>

          {/* lg: 폼 위 환영 문구 */}
          <div className="hidden lg:block mb-6">
            <h1 className="text-2xl font-bold text-text-main">
              {mode === 'login' ? 'おかえりなさい 🌱' : 'はじめまして 🌱'}
            </h1>
            <p className="mt-1 text-sm text-text-soft">日本語コーチングで成長を記録しましょう</p>
          </div>

          <div className="rounded-2xl bg-surface-elevated p-8 shadow-activity">
            {/* Tab */}
            <div className="mb-6 flex rounded-lg bg-surface-muted p-1">
              {(['login', 'signup'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null) }}
                  className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                    mode === m
                      ? 'bg-surface-elevated text-text-main shadow-sm'
                      : 'text-text-soft hover:text-text-sub'
                  }`}
                >
                  {m === 'login' ? 'ログイン' : '新規登録'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <Input
                  label="お名前"
                  type="text"
                  placeholder="山田 太郎"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              )}
              <Input
                label="メールアドレス"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                label="パスワード"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />

              {error !== null && <ErrorMessage error={error} />}

              <Button type="submit" isLoading={loading} className="w-full" size="lg">
                {mode === 'login' ? 'ログイン' : 'アカウントを作成'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
