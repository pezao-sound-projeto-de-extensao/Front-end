import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useSessionModal } from '../context/SessionModalContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import Modal from './ui/Modal';
import FormField, { FormInput } from './FormField';
import PasswordInput from './PasswordInput';

export default function SessionExpiredModal() {
  const { isOpen, closeModal } = useSessionModal();
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      reset();
      closeModal();
      toast.success('Sessão renovada. Tente a ação novamente.');
    } catch {
      setError('E-mail ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  // Sair sem renovar: encerra a sessão local e volta ao login
  const handleLeave = async () => {
    reset();
    closeModal();
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <Modal open={isOpen} onClose={handleLeave} dismissible={false} className="max-w-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-warning-soft">
          <AlertTriangle className="h-5 w-5 text-warning-strong" />
        </div>
        <div>
          <h2 className="text-base font-bold text-navy">Sessão expirada</h2>
          <p className="mt-0.5 text-xs text-subtle">Faça login novamente para continuar</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="E-mail">
          <FormInput
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </FormField>

        <PasswordInput
          label="Senha"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
        />

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleLeave} disabled={loading} className="flex-1">Sair</Button>
          <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Entrando...' : 'Entrar'}</Button>
        </div>
      </form>
    </Modal>
  );
}
