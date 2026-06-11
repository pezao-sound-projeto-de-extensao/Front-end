import { createContext, useContext, useState } from 'react'
import { api } from "../services/api";

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('authToken')
    return token ? { token } : null
  })

  async function login(email, senha) {
    const response = await api.post('/auth/login', { email, senha })
    const { token } = response.data

    localStorage.setItem('authToken', token)
    localStorage.setItem('email', email)
    localStorage.setItem('senha', senha)
    setUser({ token })
  }

  function logout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('email')
    localStorage.removeItem('senha')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)