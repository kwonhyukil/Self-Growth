import { describe, expect, it } from 'vitest'
import { getActiveNavPath } from './nav'

describe('getActiveNavPath', () => {
  it('returns the dashboard path for the root route', () => {
    expect(getActiveNavPath('/')).toBe('/')
  })

  it('returns the logs path for nested log detail routes', () => {
    expect(getActiveNavPath('/logs/42')).toBe('/logs')
  })

  it('returns the stats path for nested stats routes', () => {
    expect(getActiveNavPath('/stats/trends')).toBe('/stats')
  })
})
