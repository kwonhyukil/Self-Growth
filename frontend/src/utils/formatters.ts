import dayjs from 'dayjs'
import 'dayjs/locale/ja'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
dayjs.locale('ja')

export const fmt = {
  date: (d: string | Date) => dayjs(d).format('YYYY年MM月DD日'),
  dateShort: (d: string | Date) => dayjs(d).format('MM/DD'),
  datetime: (d: string | Date) => dayjs(d).format('YYYY/MM/DD HH:mm'),
  fromNow: (d: string | Date) => dayjs(d).fromNow(),
  isoNow: () => new Date().toISOString(),
  isoDate: (d: string | Date) => dayjs(d).toISOString(),
}

export function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-brand-500'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}

export function scoreLabel(score: number): string {
  if (score >= 80) return '素晴らしい！'
  if (score >= 60) return '良好'
  if (score >= 40) return '改善の余地あり'
  return '要改善'
}

export function deltaLabel(delta: number | null): string {
  if (delta === null) return '—'
  if (delta < 0) return `${delta} 問題減`
  if (delta > 0) return `+${delta} 問題増`
  return '変化なし'
}
