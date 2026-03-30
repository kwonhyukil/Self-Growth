import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuthContext } from '@/features/auth/auth-provider'
import { AuthPage } from '@/features/auth/pages/AuthPage'
import { LogDetailPage } from '@/features/logs/pages/LogDetailPage'
import { LogsPage } from '@/features/logs/pages/LogsPage'
import { DashboardPage } from '@/features/stats/pages/DashboardPage'
import { StatsPage } from '@/features/stats/pages/StatsPage'
import { Layout } from '@/shared/layout/Layout'
import { FullPageSpinner } from '@/shared/ui/Spinner'

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

const qc = createAppQueryClient()

function RouteGate({ requiresAuth }: { requiresAuth: boolean }) {
  const { status, isAuthenticated } = useAuthContext()

  if (status === 'loading') {
    return <FullPageSpinner />
  }

  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  if (!requiresAuth && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RouteGate requiresAuth={false} />}>
        <Route path="/auth" element={<AuthPage />} />
      </Route>
      <Route element={<RouteGate requiresAuth />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="logs/:id" element={<LogDetailPage />} />
          <Route path="stats" element={<StatsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
