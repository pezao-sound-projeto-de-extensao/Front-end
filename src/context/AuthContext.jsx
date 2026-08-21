import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService';

const AuthContext = createContext(null)

const TOKEN_KEY = 'sf_token'
const REMEMBER_KEY = 'sf_remember'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      const token = sessionStorage.getItem(TOKEN_KEY)
      const remember = localStorage.getItem(REMEMBER_KEY)

      if (token) {
        setUser({ token })
      } else if (remember) {
        const savedToken = localStorage.getItem(TOKEN_KEY)
        if (savedToken) {
          sessionStorage.setItem(TOKEN_KEY, savedToken)
          setUser({ token: savedToken })
        }
      }
      setLoading(false)
    }

    restoreSession()
  }, [])

  async function login(email, senha, lembrar = false) {
    const data = await authService.login(email, senha)
    const { token } = data

    sessionStorage.setItem(TOKEN_KEY, token)

    if (lembrar) {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(REMEMBER_KEY, 'true')
    } else {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REMEMBER_KEY)
    }

    setUser({ token })
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REMEMBER_KEY)
    setUser(null)
  }

  function getToken() {
    return user?.token || sessionStorage.getItem(TOKEN_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, getToken, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)