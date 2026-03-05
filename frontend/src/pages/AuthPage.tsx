import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { AppError } from '../api/client'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ErrorMessage } from '../components/ui/ErrorMessage'

type Mode = 'login' | 'signup'

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-5xl">🌱</span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Self Growth Log</h1>
          <p className="mt-1 text-sm text-slate-500">日本語コーチングで成長を記録</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-lg">
          {/* Tab */}
          <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
            {(['login', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null) }}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                  mode === m
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
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
  )
}
