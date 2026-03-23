import { clsx } from 'clsx'
import type { DogLevel, DogEmotion } from '@/features/growth/api'

interface GrowthPartnerProps {
  level: DogLevel
  emotion: DogEmotion
  radarAvgScore: number
  className?: string
}

const DOG_CONFIG: Record<
  DogLevel,
  {
    emoji: string
    name: string
    nameJa: string
    description: string
    bgColor: string
    ringColor: string
    badgeColor: string
  }
> = {
  BABY: {
    emoji: '🐶',
    name: 'Baby',
    nameJa: 'こいぬ',
    description: '로그 5개를 채우면 다음 단계로 올라갑니다.',
    bgColor: 'bg-amber-50',
    ringColor: 'ring-amber-200',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
  JUNIOR: {
    emoji: '🐕',
    name: 'Junior',
    nameJa: 'ジュニア',
    description: '연속 기록이 쌓이면서 루틴이 안정되기 시작한 단계입니다.',
    bgColor: 'bg-sky-50',
    ringColor: 'ring-sky-200',
    badgeColor: 'bg-sky-100 text-sky-700',
  },
  SENIOR: {
    emoji: '🐕‍🦺',
    name: 'Senior',
    nameJa: 'シニア',
    description: '기록과 피드백이 누적되며 균형이 잡혀가는 단계입니다.',
    bgColor: 'bg-violet-50',
    ringColor: 'ring-violet-200',
    badgeColor: 'bg-violet-100 text-violet-700',
  },
  MASTER: {
    emoji: '🦮',
    name: 'Master',
    nameJa: 'マスター',
    description: '꾸준한 기록과 높은 평균 점수를 함께 유지하는 단계입니다.',
    bgColor: 'bg-emerald-50',
    ringColor: 'ring-emerald-200',
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
}

const EMOTION_CONFIG: Record<
  DogEmotion,
  {
    overlay: string
    message: string
    pulse: boolean
  }
> = {
  HAPPY: {
    overlay: '',
    message: '오늘도 기록이 이어지고 있어요.',
    pulse: true,
  },
  NEUTRAL: {
    overlay: '',
    message: '조용히 다음 기록을 기다리고 있어요.',
    pulse: false,
  },
  SAD: {
    overlay: 'opacity-60 grayscale-[25%]',
    message: '기록이 조금 쉬고 있어요. 다시 시작해볼까요?',
    pulse: false,
  },
}

export function GrowthPartner({ level, emotion, radarAvgScore, className }: GrowthPartnerProps) {
  const dog = DOG_CONFIG[level]
  const emo = EMOTION_CONFIG[emotion]
  const progress = Math.round(radarAvgScore)

  return (
    <div className={clsx('flex flex-col items-center gap-3', className)}>
      <div className="relative">
        <div
          className={clsx(
            'flex h-28 w-28 items-center justify-center rounded-full ring-4 transition-all duration-500',
            dog.bgColor,
            dog.ringColor,
            emo.overlay,
          )}
        >
          <span
            className={clsx('select-none text-6xl transition-transform duration-300', emo.pulse && 'animate-bounce')}
            role="img"
            aria-label={dog.name}
          >
            {dog.emoji}
          </span>
        </div>

        <span className={clsx('absolute -bottom-1 -right-1 rounded-full px-2 py-0.5 text-[10px] font-bold', dog.badgeColor)}>
          {dog.nameJa}
        </span>

        {level === 'MASTER' && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-lg">✦</span>}
      </div>

      <div className="space-y-0.5 text-center">
        <p className="text-sm font-semibold text-text-main">{dog.name}</p>
        <p className="text-xs text-text-soft">{emo.message}</p>
      </div>

      <div className="w-full space-y-1">
        <div className="flex justify-between text-[10px] text-text-disabled">
          <span>Growth Score</span>
          <span className="font-semibold text-text-sub">{progress} / 100</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-700',
              level === 'MASTER'
                ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                : level === 'SENIOR'
                  ? 'bg-gradient-to-r from-violet-400 to-violet-600'
                  : level === 'JUNIOR'
                    ? 'bg-gradient-to-r from-sky-400 to-sky-600'
                    : 'bg-gradient-to-r from-amber-400 to-amber-600',
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-[10px] text-text-disabled">{dog.description}</p>
      </div>
    </div>
  )
}
