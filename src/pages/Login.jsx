import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email && password) {
      setLoading(true);
      setError('');
      try {
        await login(email, password, remember);
        navigate('/dashboard');
      } catch (err) {
        if (err.response?.status === 403) {
          navigate('/change-password', { state: { email } });
        } else {
          setError('E-mail ou senha inválidos');
        }
        setLoading(false);
      }
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #021b2f 0%, #0b385a 55%, #1c5a80 100%)',
      }}
    >
      <div
        className="w-full max-w-md"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(2, 27, 47, 0.55)',
          overflow: 'hidden',
        }}
      >
        {/* Topo com gradiente e logo */}
        <div
          className="flex flex-col items-center pt-10 pb-8 px-8"
          style={{
            background: 'linear-gradient(160deg, #0b385a 0%, #1c8bc0 100%)',
          }}
        >
          <div
            className="mb-4 flex items-center justify-center"
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '22px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: '1.5px solid rgba(255,255,255,0.25)',
            }}
          >
          </div>
          <h1
            style={{
              fontSize: '30px',
              fontWeight: '800',
              color: '#ffffff',
              letterSpacing: '-0.5px',
              lineHeight: 1,
            }}
          >
            Stock<span style={{ color: '#90e6ff' }}>Flow</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>
            Sistema de Gerenciamento de Estoque
          </p>
        </div>

        {/* Formulário */}
        <div className="px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                style={{ fontSize: '13px', fontWeight: '600', color: '#1a3a55', display: 'block', marginBottom: '6px' }}
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  fontSize: '14px',
                  color: '#1a3a55',
                  backgroundColor: '#f4f8fc',
                  border: '1.5px solid #d0dde8',
                  borderRadius: '10px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#1c8bc0')}
                onBlur={(e) => (e.target.style.borderColor = '#d0dde8')}
              />
            </div>

            <div>
              <div className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
                <label
                  htmlFor="password"
                  style={{ fontSize: '13px', fontWeight: '600', color: '#1a3a55' }}
                >
                  Senha
                </label>
                <a
                  href="/change-password"
                  style={{ fontSize: '12px', color: '#1c8bc0', fontWeight: '500', textDecoration: 'none' }}
                >
                  Esqueceu sua senha?
                </a>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  fontSize: '14px',
                  color: '#1a3a55',
                  backgroundColor: '#f4f8fc',
                  border: '1.5px solid #d0dde8',
                  borderRadius: '10px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#1c8bc0')}
                onBlur={(e) => (e.target.style.borderColor = '#d0dde8')}
              />
            </div>

            <div className="flex items-center gap-2" style={{ marginTop: '8px' }}>
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#1565c0' }}
              />
              <label htmlFor="remember" style={{ fontSize: '13px', color: '#1a3a55', cursor: 'pointer' }}>
                Lembrar-me
              </label>
            </div>

            {error && (
              <p style={{ color: '#e05252', fontSize: 12.5, margin: '-6px 0 10px' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '15px',
                fontWeight: '700',
                color: '#ffffff',
                backgroundColor: '#1565c0',
                border: 'none',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1,
                letterSpacing: '0.2px',
                marginTop: '4px',
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.backgroundColor = '#0d4fa8'); }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.backgroundColor = '#1565c0'); }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}