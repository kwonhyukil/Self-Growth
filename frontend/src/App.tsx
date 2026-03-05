import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider, useAuthContext } from './contexts/AuthContext'
import { FullPageSpinner } from './components/ui/Spinner'
import { Layout } from './components/layout/Layout'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { LogsPage } from './pages/LogsPage'
import { LogDetailPage } from './pages/LogDetailPage'
import { StatsPage } from './pages/StatsPage'
import { getToken } from './api/client'

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function ProtectedRoutes() {
  const { isLoading } = useAuthContext()
  const hasToken = Boolean(getToken())

  if (isLoading) return <FullPageSpinner />
  if (!hasToken) return <Navigate to="/auth" replace />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="logs/:id" element={<LogDetailPage />} />
        <Route path="stats" element={<StatsPage />} />
      </Route>
    </Routes>
  )
}

export function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
