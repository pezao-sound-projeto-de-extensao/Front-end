import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService';

const AuthContext = createContext(null)

const ACCESS_TOKEN_KEY = 'sf_access_token'
const REFRESH_TOKEN_KEY = 'sf_refresh_token'
const USER_KEY = 'sf_user'
const REMEMBER_KEY = 'sf_remember'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY)
      const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY)
      const userData = sessionStorage.getItem(USER_KEY)
      const remember = localStorage.getItem(REMEMBER_KEY)

      if (accessToken && refreshToken && userData) {
        setUser({ accessToken, refreshToken, ...JSON.parse(userData) })
      } else if (remember) {
        const savedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
        const savedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
        const savedUserData = localStorage.getItem(USER_KEY)
        if (savedAccessToken && savedRefreshToken && savedUserData) {
          sessionStorage.setItem(ACCESS_TOKEN_KEY, savedAccessToken)
          sessionStorage.setItem(REFRESH_TOKEN_KEY, savedRefreshToken)
          sessionStorage.setItem(USER_KEY, savedUserData)
          setUser({ accessToken: savedAccessToken, refreshToken: savedRefreshToken, ...JSON.parse(savedUserData) })
        }
      }
      setLoading(false)
    }

    restoreSession()
  }, [])

  async function login(email, senha, lembrar = false) {
    const data = await authService.login(email, senha)
    const { accessToken, refreshToken, username, usuario } = data

    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    sessionStorage.setItem(USER_KEY, JSON.stringify({ username, ...usuario }))

    if (lembrar) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
      localStorage.setItem(USER_KEY, JSON.stringify({ username, ...usuario }))
      localStorage.setItem(REMEMBER_KEY, 'true')
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(REMEMBER_KEY)
    }

    setUser({ accessToken, refreshToken, username, ...usuario })
  }

  async function refreshAccessToken() {
    const currentRefreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY)
    if (!currentRefreshToken) {
      throw new Error('No refresh token available')
    }

    const data = await authService.refreshToken(currentRefreshToken)
    const { accessToken, refreshToken, username, usuario } = data

    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    sessionStorage.setItem(USER_KEY, JSON.stringify({ username, ...usuario }))

    const remember = localStorage.getItem(REMEMBER_KEY)
    if (remember) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
      localStorage.setItem(USER_KEY, JSON.stringify({ username, ...usuario }))
    }

    setUser({ accessToken, refreshToken, username, ...usuario })
    return accessToken
  }

  async function logout() {
    const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY)
    if (refreshToken) {
      try {
        await authService.logout(refreshToken)
      } catch (error) {
        console.error('Erro ao fazer logout no backend:', error)
      }
    }

    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(REMEMBER_KEY)
    setUser(null)
  }

  function getAccessToken() {
    return user?.accessToken || sessionStorage.getItem(ACCESS_TOKEN_KEY)
  }

  function getRefreshToken() {
    return user?.refreshToken || sessionStorage.getItem(REFRESH_TOKEN_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, getAccessToken, getRefreshToken, refreshAccessToken, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)