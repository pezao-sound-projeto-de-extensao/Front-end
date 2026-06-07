import { createContext, useContext, useState } from 'react'
import { api } from "../services/api";

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('authToken')
    return token ? { token } : null
  })

  async function login(email, senha) {
    const response = await api.post('/auth/login', { email, password: senha })
    const { token } = response.data

    localStorage.setItem('authToken', token)
    setUser({ token })
  }

  function logout() {
    localStorage.removeItem('authToken')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)