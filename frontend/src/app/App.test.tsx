import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './App'

const mockUseAuthContext = vi.fn()

vi.mock('@/features/auth/auth-provider', () => ({
  useAuthContext: () => mockUseAuthContext(),
}))

vi.mock('@/features/auth/pages/AuthPage', () => ({
  AuthPage: () => <div>Auth page</div>,
}))

vi.mock('@/features/stats/pages/DashboardPage', () => ({
  DashboardPage: () => <div>Dashboard page</div>,
}))

vi.mock('@/features/logs/pages/LogsPage', () => ({
  LogsPage: () => <div>Logs page</div>,
}))

vi.mock('@/features/logs/pages/LogDetailPage', () => ({
  LogDetailPage: () => <div>Log detail page</div>,
}))

vi.mock('@/features/stats/pages/StatsPage', () => ({
  StatsPage: () => <div>Stats page</div>,
}))

vi.mock('@/shared/layout/Layout', () => ({
  Layout: () => (
    <div>
      <div>Layout shell</div>
      <Outlet />
    </div>
  ),
}))

vi.mock('@/shared/ui/Spinner', () => ({
  FullPageSpinner: () => <div>Loading app</div>,
}))

describe('AppRoutes', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('shows the loading spinner while auth state is resolving', () => {
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      status: 'loading',
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(screen.getByText('Loading app')).toBeTruthy()
  })

  it('redirects anonymous users from protected routes to auth', async () => {
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      status: 'anonymous',
    })

    render(
      <MemoryRouter initialEntries={['/stats']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Auth page')).toBeTruthy()
  })

  it('redirects authenticated users away from auth to the dashboard', async () => {
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      status: 'authenticated',
    })

    render(
      <MemoryRouter initialEntries={['/auth']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Dashboard page')).toBeTruthy()
  })

  it('renders protected routes inside the shared layout for authenticated users', async () => {
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      status: 'authenticated',
    })

    render(
      <MemoryRouter initialEntries={['/logs']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Layout shell')).toBeTruthy()
    expect(screen.getByText('Logs page')).toBeTruthy()
  })
})
