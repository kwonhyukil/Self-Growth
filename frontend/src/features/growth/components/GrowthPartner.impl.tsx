/**
 * GrowthPartner — 성장 반려견 시각화 컴포넌트
 *
 * Level 기준:
 *   BABY   — 로그 < 5
 *   JUNIOR — 로그 >= 5, streak < 7
 *   SENIOR — streak >= 7, radarAvg < 70
 *   MASTER — streak >= 7, radarAvg >= 70
 *
 * Emotion 기준:
 *   HAPPY   — 오늘 기록
 *   NEUTRAL — 어제 기록
 *   SAD     — 2일 이상 공백
 */

import { clsx } from 'clsx'
import type { DogLevel, DogEmotion } from '@/features/growth/api'

interface GrowthPartnerProps {
  level: DogLevel
  emotion: DogEmotion
  radarAvgScore: number
  className?: string
}

// ── 레벨별 설정 ───────────────────────────────────────────────

const DOG_CONFIG: Record<DogLevel, {
  emoji: string
  name: string
  nameJa: string
  description: string
  bgColor: string
  ringColor: string
  badgeColor: string
}> = {
  BABY: {
    emoji: '🐶',
    name: '아기 강아지',
    nameJa: 'ベビー',
    description: '5개 로그를 채우면 성장해요!',
    bgColor: 'bg-amber-50',
    ringColor: 'ring-amber-200',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
  JUNIOR: {
    emoji: '🐕',
    name: '주니어',
    nameJa: 'ジュニア',
    description: '7일 연속 기록하면 시니어가 돼요!',
    bgColor: 'bg-sky-50',
    ringColor: 'ring-sky-200',
    badgeColor: 'bg-sky-100 text-sky-700',
  },
  SENIOR: {
    emoji: '🦮',
    name: '시니어',
    nameJa: 'シニア',
    description: '레이더 70점 달성으로 마스터 도전!',
    bgColor: 'bg-violet-50',
    ringColor: 'ring-violet-200',
    badgeColor: 'bg-violet-100 text-violet-700',
  },
  MASTER: {
    emoji: '🐕‍🦺',
    name: '마스터',
    nameJa: 'マスター',
    description: '최고 레벨 달성! 계속 성장하세요 🏆',
    bgColor: 'bg-emerald-50',
    ringColor: 'ring-emerald-200',
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
}

// ── 감정별 설정 ───────────────────────────────────────────────

const EMOTION_CONFIG: Record<DogEmotion, {
  overlay: string
  message: string
  pulse: boolean
}> = {
  HAPPY: {
    overlay: '',
    message: '오늘도 기록했어요! 🎉',
    pulse: true,
  },
  NEUTRAL: {
    overlay: '',
    message: '어제 기록했네요. 오늘도 써봐요!',
    pulse: false,
  },
  SAD: {
    overlay: 'opacity-60 grayscale-[30%]',
    message: '기록이 없어서 슬퍼요 😢',
    pulse: false,
  },
}

export function GrowthPartner({ level, emotion, radarAvgScore, className }: GrowthPartnerProps) {
  const dog = DOG_CONFIG[level]
  const emo = EMOTION_CONFIG[emotion]
  const progress = Math.round(radarAvgScore)

  return (
    <div className={clsx('flex flex-col items-center gap-3', className)}>
      {/* 반려견 아바타 */}
      <div className="relative">
        <div
          className={clsx(
            'flex h-24 w-24 items-center justify-center rounded-full ring-4 transition-all duration-500',
            dog.bgColor,
            dog.ringColor,
            emo.overlay,
          )}
        >
          <span
            className={clsx(
              'text-5xl select-none transition-transform duration-300',
              emo.pulse && 'animate-bounce',
            )}
            role="img"
            aria-label={dog.name}
          >
            {dog.emoji}
          </span>
        </div>

        {/* 레벨 배지 */}
        <span
          className={clsx(
            'absolute -bottom-1 -right-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
            dog.badgeColor,
          )}
        >
          {dog.nameJa}
        </span>

        {/* MASTER 왕관 */}
        {level === 'MASTER' && (
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-lg">👑</span>
        )}
      </div>

      {/* 이름 & 감정 메시지 */}
      <div className="text-center space-y-0.5">
        <p className="text-sm font-semibold text-text-main">{dog.name}</p>
        <p className="text-xs text-text-soft">{emo.message}</p>
      </div>

      {/* 성장 프로그레스 바 */}
      <div className="w-full space-y-1">
        <div className="flex justify-between text-[10px] text-text-disabled">
          <span>成長スコア</span>
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
        <p className="text-[10px] text-text-disabled text-center">{dog.description}</p>
      </div>
    </div>
  )
}
