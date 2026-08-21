import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import { SessionModalProvider } from './context/SessionModalContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import SessionModalBridge from './components/SessionModalBridge'
import SessionExpiredModal from './components/SessionExpiredModal'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Movements from './pages/Movements'
import Budgets from './pages/Budgets'
import Orders from './pages/Orders'
import Reports from './pages/Reports'
import Users from './pages/Users'
import ChangePassword from './pages/ChangePassword'

export default function App() {
  return (
    <AuthProvider>
      <SessionModalProvider>
        <SessionModalBridge />
        <SessionExpiredModal />
        <Toaster position="top-right" richColors closeButton />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />

            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/movements" element={<Movements />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/users" element={<Users />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </SessionModalProvider>
    </AuthProvider>
  )
}
