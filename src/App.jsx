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
import BudgetView from './pages/BudgetView'
import Encomendas from './pages/Encomendas'
import Reports from './pages/Reports'
import Users from './pages/Users'
import ChangePassword from './pages/ChangePassword'
import Innovation from './pages/Innovation'

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
              <Route path="/products" element={
                <ProtectedRoute permissions={['CADASTRAR_ITENS', 'EDITAR_ITENS', 'EXCLUIR_ITENS']}>
                  <Products />
                </ProtectedRoute>
              } />
              <Route path="/movements" element={
                <ProtectedRoute permissions={['REGISTRAR_ENTRADA', 'REGISTRAR_SAIDA']}>
                  <Movements />
                </ProtectedRoute>
              } />
              <Route path="/budgets" element={
                <ProtectedRoute permissions={['GERENCIAR_ORCAMENTOS']}>
                  <Budgets />
                </ProtectedRoute>
              } />
              <Route path="/budgets/:id" element={
                <ProtectedRoute permissions={['GERENCIAR_ORCAMENTOS']}>
                  <BudgetView />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute permissions={['GERENCIAR_ENCOMENDAS']}>
                  <Encomendas />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute permissions={['VER_RELATORIOS']}>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute permissions={['GERENCIAR_USUARIOS']}>
                  <Users />
                </ProtectedRoute>
              } />
              <Route path="/innovation" element={<Innovation />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </SessionModalProvider>
    </AuthProvider>
  )
}