import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useSessionModal } from '../context/SessionModalContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import PasswordInput from './PasswordInput';

export default function SessionExpiredModal() {
  const { isOpen, closeModal, retry } = useSessionModal();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      await login(email, password, false);
      setLoading(false);
      retry();
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Primeiro acesso — altere sua senha no menu.');
      } else {
        setError('E-mail ou senha inválidos');
      }
      setLoading(false);
    }
  };

  const handleClose = () => {
    closeModal();
    setPassword('');
    setError('');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }} onClick={handleClose}>
      <div className="w-full max-w-sm" style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        overflow: 'hidden',
      }}>
        <div className="flex items-center gap-3 px-6 pt-6 pb-4">
          <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fff3e0' }}>
            <AlertTriangle style={{ width: '20px', height: '20px', color: '#e07b00' }} />
          </div>
          <div className="flex-1">
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0d2137' }}>Sessão expirada</h3>
            <p style={{ fontSize: '12px', color: '#6a92b0', marginTop: '2px' }}>Faça login novamente para continuar</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#1a3a55', display: 'block', marginBottom: '4px' }}>E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '10px 14px', fontSize: '14px', color: '#1a3a55',
                backgroundColor: '#f4f8fc', border: '1.5px solid #d0dde8', borderRadius: '8px', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#1c8bc0')}
              onBlur={(e) => (e.target.style.borderColor = '#d0dde8')}
            />
          </div>

          <PasswordInput
            label="Senha"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
          />

          <Button type="submit" disabled={loading} className="w-full" style={{
            padding: '11px', fontSize: '14px', fontWeight: '700', color: '#ffffff',
            backgroundColor: '#1565c0', borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}