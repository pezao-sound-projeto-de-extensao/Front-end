import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import FormField, { FormInput } from '../components/FormField';
import logo from '../assets/logo.png';

export default function Login() {
  const { user, loading: checkingSession, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Volta para a página que pediu o login (ProtectedRoute guarda em state.from)
  const redirectTo = location.state?.from?.pathname ?? '/dashboard';

  useEffect(() => {
    document.title = 'Entrar · StockFlow';
  }, []);

  if (!checkingSession && user) return <Navigate to={redirectTo} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    setError('');
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch {
      setError('E-mail ou senha inválidos');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[linear-gradient(135deg,#021b2f_0%,#0b385a_55%,#1c5a80_100%)] p-4">
      <main className="w-full max-w-md overflow-hidden rounded-[20px] bg-surface shadow-[0_24px_64px_rgba(2,27,47,0.55)]">
        <div className="flex flex-col items-center bg-[linear-gradient(160deg,#0b385a_0%,#1c8bc0_100%)] px-8 pb-8 pt-10">
          <div className="mb-4 flex h-[104px] w-[104px] items-center justify-center rounded-[26px] border-[1.5px] border-white/25 bg-white/15">
            <img src={logo} alt="" className="h-[72px] w-[72px] object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold leading-none tracking-tight text-white">
            Stock<span className="text-[#90e6ff]">Flow</span>
          </h1>
          <p className="mt-1.5 text-sm text-white/60">Sistema de Gerenciamento de Estoque</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-8 py-8">
          <FormField label="E-mail">
            <FormInput type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </FormField>

          <div>
            <FormField label="Senha">
              <FormInput type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            </FormField>
            <Link to="/esqueci-senha" className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>

          {error && <p className="text-sm text-danger" role="alert">{error}</p>}

          <Button type="submit" size="lg" disabled={submitting} className="w-full">
            {submitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </main>
    </div>
  );
}
