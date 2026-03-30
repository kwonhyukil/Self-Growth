import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Header } from './Header'

const mockLogout = vi.fn()

vi.mock('@/features/auth/auth-provider', () => ({
  useAuthContext: () => ({
    user: { id: 1, email: 'test@example.com', name: 'Test User' },
    logout: mockLogout,
  }),
}))

describe('Header', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders route-specific copy and primary navigation links', () => {
    render(
      <MemoryRouter initialEntries={['/stats']}>
        <Header />
      </MemoryRouter>,
    )

    expect(screen.getByText('Growth Stats')).toBeTruthy()
    expect(screen.getByText('Track patterns, trends, and next focus areas over time.')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Logs/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Stats/i }).getAttribute('aria-current')).toBe('page')
  })

  it('allows the current user to log out from the header', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Log out' }))

    expect(mockLogout).toHaveBeenCalledTimes(1)
  })
})
