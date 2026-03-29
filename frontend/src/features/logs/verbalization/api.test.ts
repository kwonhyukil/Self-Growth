import { afterEach, describe, expect, it, vi } from 'vitest'

const { apiMock } = vi.hoisted(() => ({
  apiMock: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('@/shared/api/client', () => ({
  default: apiMock,
}))

import { verbalizationApi } from './api'

describe('verbalizationApi', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('loads the session from the canonical logs route', async () => {
    apiMock.get.mockResolvedValue({
      data: { data: { verbalization: null } },
    })

    await verbalizationApi.getSession(12)

    expect(apiMock.get).toHaveBeenCalledWith('/logs/12/verbalize')
  })

  it('posts brainstorm input to the canonical logs route', async () => {
    apiMock.post.mockResolvedValue({
      data: { data: { verbalization: { sessionId: 1, probingQuestion: 'q' } } },
    })

    await verbalizationApi.startBrainstorm(7, 'raw thoughts', 1200)

    expect(apiMock.post).toHaveBeenCalledWith('/logs/7/verbalize/brainstorm', {
      rawThoughts: 'raw thoughts',
      thinkingDurationMs: 1200,
    })
  })

  it('posts probe answers to the canonical logs route', async () => {
    apiMock.post.mockResolvedValue({
      data: {
        data: {
          verbalization: {
            sessionId: 1,
            aiInsightJa: 'ja',
            aiInsightKo: 'ko',
            verbalizationScore: 88,
          },
        },
      },
    })

    await verbalizationApi.submitProbeAnswer(3, 'answer')

    expect(apiMock.post).toHaveBeenCalledWith('/logs/3/verbalize/probe-answer', {
      probingAnswer: 'answer',
    })
  })
})
