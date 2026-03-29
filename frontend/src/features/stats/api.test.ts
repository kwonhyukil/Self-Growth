import { afterEach, describe, expect, it, vi } from 'vitest'

const { apiMock } = vi.hoisted(() => ({
  apiMock: {
    get: vi.fn(),
  },
}))

vi.mock('@/shared/api/client', () => ({
  default: apiMock,
}))

import { statsApi } from './api'

describe('statsApi', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('requests dashboard data from /stats/dashboard', async () => {
    apiMock.get.mockResolvedValue({
      data: {
        data: {
          ja: { d7: {}, d30: {} },
          insights: {
            weekTopFocus: { ruleTag: 'particle', message: 'm', action: 'a' },
            monthTopFocus: { ruleTag: 'naturalness', message: 'm', action: 'a' },
            nextTargets: [],
          },
          coach: {
            week: {
              focusRuleTag: 'particle',
              why: 'why',
              oneAction: 'action',
              nextQuestion: 'question',
            },
            month: {
              focusRuleTag: 'naturalness',
              why: 'why',
              oneAction: 'action',
              nextQuestion: 'question',
            },
          },
          dataQuality: {
            totalRevisions30d: 0,
            nullDeltaCount30d: 0,
            zeroDeltaCount30d: 0,
          },
        },
      },
    })

    await statsApi.dashboard()

    expect(apiMock.get).toHaveBeenCalledWith('/stats/dashboard')
  })
})
