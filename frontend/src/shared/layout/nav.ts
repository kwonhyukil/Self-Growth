import { BarChart2, BookOpen, LayoutDashboard, type LucideIcon } from 'lucide-react'

export interface NavLinkItem {
  to: '/' | '/logs' | '/stats'
  label: string
  sub: string
  Icon: LucideIcon
}

export const navLinks: NavLinkItem[] = [
  { to: '/', label: 'Dashboard', sub: 'AI workspace', Icon: LayoutDashboard },
  { to: '/logs', label: 'Logs', sub: 'Journal archive', Icon: BookOpen },
  { to: '/stats', label: 'Stats', sub: 'Growth signals', Icon: BarChart2 },
]

export const routeMeta: Record<
  NavLinkItem['to'],
  {
    title: string
    description: string
  }
> = {
  '/': {
    title: 'Dashboard',
    description: 'Review your latest writing signals and AI guidance.',
  },
  '/logs': {
    title: 'Journal Logs',
    description: 'Capture moments, refine language, and continue reflection.',
  },
  '/stats': {
    title: 'Growth Stats',
    description: 'Track patterns, trends, and next focus areas over time.',
  },
}

export function getActiveNavPath(pathname: string): NavLinkItem['to'] {
  if (pathname.startsWith('/stats')) return '/stats'
  if (pathname.startsWith('/logs')) return '/logs'
  return '/'
}
