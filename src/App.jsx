import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import { SessionModalProvider } from './context/SessionModalContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import SessionExpiredModal from './components/SessionExpiredModal'
import LoadingSpinner from './components/LoadingSpinner'
import { APP_ROUTES } from './config/routes'

const Login = lazy(() => import('./pages/Login'))
const ChangePassword = lazy(() => import('./pages/ChangePassword'))
const EsqueciSenha = lazy(() => import('./pages/EsqueciSenha'))
const RedefinirSenha = lazy(() => import('./pages/RedefinirSenha'))

function ThemedToaster() {
  const { theme } = useTheme()
  return <Toaster position="top-right" richColors closeButton theme={theme} />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <SessionModalProvider>
            <SessionExpiredModal />
            <ThemedToaster />
            <Suspense fallback={<LoadingSpinner variant="fullpage" />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/esqueci-senha" element={<EsqueciSenha />} />
                <Route path="/redefinir-senha" element={<RedefinirSenha />} />

                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  {APP_ROUTES.map(({ path, permissions, Component }) => (
                    <Route
                      key={path}
                      path={path}
                      element={<ProtectedRoute permissions={permissions}><Component /></ProtectedRoute>}
                    />
                  ))}
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </SessionModalProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
