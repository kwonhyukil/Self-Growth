import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LogForm } from './LogForm'

describe('LogForm', () => {
  afterEach(() => {
    cleanup()
  })

  it('keeps the next button disabled until a mood is selected on step 1', () => {
    render(<LogForm onSubmit={vi.fn().mockResolvedValue(undefined)} />)

    const nextButton = screen.getByRole('button', { name: '次へ' }) as HTMLButtonElement

    expect(
      screen.getByText('まずは、今日の記録にいちばん近い気分を選びましょう。'),
    ).toBeTruthy()
    expect(nextButton.disabled).toBe(true)
  })

  it('enables the next button after selecting a mood on step 1', () => {
    render(<LogForm onSubmit={vi.fn().mockResolvedValue(undefined)} />)

    const nextButton = screen.getByRole('button', { name: '次へ' }) as HTMLButtonElement
    fireEvent.click(screen.getByRole('button', { name: '穏やか を選択' }))

    expect(nextButton.disabled).toBe(false)
  })
})
