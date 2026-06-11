import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Relatorios from './pages/Relatorios'
import Produtos from './pages/Produtos'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>\
            <Route path="/produtos"      element={<Produtos />} />
            <Route path="/relatorios"    element={<Relatorios />} />
          </Route>

          <Route path="/" element={<Navigate to="/produtos" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}