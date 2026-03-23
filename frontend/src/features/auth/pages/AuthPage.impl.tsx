import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/auth-provider'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'

type Mode = 'login' | 'signup'

const BRAND_VALUES = [
  { icon: '📝', text: '하루의 장면과 감정을 차분하게 기록하기' },
  { icon: '🤖', text: 'Feedback Agent로 일본어 문장을 다듬기' },
  { icon: '🧠', text: 'Insight Agent로 생각의 의미를 더 깊게 정리하기' },
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
    <div className="min-h-screen bg-surface-canvas px-6 py-8 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2.2rem] border border-white/60 bg-white/35 shadow-dashboard backdrop-blur-md lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden border-r border-white/60 bg-[linear-gradient(180deg,rgba(255,253,248,0.82),rgba(239,230,215,0.74))] px-12 py-14 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="agent-pill">Calm Journal</p>
            <h1 className="journal-title mt-5 text-5xl">Self Growth Log</h1>
            <p className="mt-5 max-w-xl text-bodySm leading-relaxed text-text-sub">
              하루의 감정 기록을 AI와 함께 더 나은 문장과 더 깊은 통찰로 연결하는 조용한 작업실.
            </p>
          </div>

          <div className="space-y-4">
            {BRAND_VALUES.map((item) => (
              <div key={item.text} className="rounded-[1.4rem] border border-white/70 bg-white/55 px-5 py-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <p className="text-sm leading-relaxed text-text-sub">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm italic text-text-soft">
            Small entries become better language and clearer insight.
          </p>
        </div>

        <div className="flex items-center justify-center px-6 py-10 md:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <p className="agent-pill mx-auto lg:mx-0">{mode === 'login' ? 'Welcome Back' : 'Start New Flow'}</p>
              <h2 className="journal-title mt-4 text-4xl">
                {mode === 'login' ? '다시 이어가기' : '첫 기록 시작하기'}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-text-soft">
                {mode === 'login'
                  ? '이전에 남긴 기록과 AI 흐름을 이어서 불러옵니다.'
                  : '계정을 만들면 저널, 피드백, 인사이트 흐름을 바로 사용할 수 있습니다.'}
              </p>
            </div>

            <div className="journal-frame p-7">
              <div className="mb-6 flex rounded-full border border-white/70 bg-white/55 p-1 shadow-soft">
                {(['login', 'signup'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m)
                      setError(null)
                    }}
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      mode === m
                        ? 'bg-primary-500 text-white shadow-soft'
                        : 'text-text-soft hover:text-text-sub'
                    }`}
                  >
                    {m === 'login' ? '로그인' : '회원가입'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <Input
                    label="이름"
                    type="text"
                    placeholder="예: Kwon Hyukil"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                )}

                <Input
                  label="이메일"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />

                <Input
                  label="비밀번호"
                  type="password"
                  placeholder="8자 이상 입력"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />

                {error !== null && <ErrorMessage error={error} />}

                <Button type="submit" isLoading={loading} className="w-full" size="lg">
                  {mode === 'login' ? '로그인하고 계속하기' : '계정 만들고 시작하기'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
