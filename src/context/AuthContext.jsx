import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  async function login(email, senha) {
    const data = await authService.login(email, senha);
    const { username, usuario } = data;
    setUser({ username, ...usuario });
  }

  async function logout() {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout no backend:', error);
    }
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);