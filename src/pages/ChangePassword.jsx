import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';
import PasswordInput from '../components/PasswordInput';
import PasswordRequirements from '../components/PasswordRequirements';
import SuccessMessage from '../components/SuccessMessage';

export default function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!email) {
      newErrors.email = 'E-mail é obrigatório';
    }

    if (!currentPassword) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      newErrors.newPassword = passwordErrors.join(', ');
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não conferem';
    }

    setErrors(newErrors);

    if (newErrors.email || newErrors.currentPassword || newErrors.newPassword || newErrors.confirmPassword) {
      return;
    }

    setLoading(true);

    try {
      await authService.trocarSenha({
        email,
        senhaAtual: currentPassword,
        senhaNova: newPassword,
      });
      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.detail || error.response?.data?.message;
      if (msg) {
        setErrors({ currentPassword: msg });
      } else {
        setErrors({ currentPassword: 'Erro ao alterar senha. Tente novamente.' });
      }
    }
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('Pelo menos 8 caracteres');
    if (!/[A-Z]/.test(password)) errors.push('Uma letra maiúscula');
    if (!/[a-z]/.test(password)) errors.push('Uma letra minúscula');
    if (!/[0-9]/.test(password)) errors.push('Um número');
    if (!/[!@#$%^&*]/.test(password)) errors.push('Um caractere especial (!@#$%^&*)');
    return errors;
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#e8edf3' }}>
      <div className="max-w-md mx-auto p-6">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/login')} style={{ color: '#1a3a55' }}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0d2137' }}>Alterar senha</h2>
        </div>

        {success ? (
          <SuccessMessage
            title="Senha alterada com sucesso!"
            message="Você será redirecionado para o login em instantes..."
          />
        ) : (
          <div className="bg-white p-8 rounded-lg" style={{ border: '1px solid #d0dde8', borderRadius: '10px', boxShadow: '0 4px 24px rgba(13,33,55,0.10)' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 uppercase" style={{ fontSize: '12px', color: '#5a82a0' }}>E-mail</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!location.state?.email}
                  className="w-full rounded-lg"
                  style={{
                    backgroundColor: location.state?.email ? '#e8edf3' : '#fafbfc',
                    border: errors.email ? '1.5px solid #e84040' : '1.5px solid #d0dde8',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '14px',
                    color: '#1a3a55',
                    opacity: location.state?.email ? 0.7 : 1,
                  }}
                />
                {errors.email && <p style={{ fontSize: '11px', color: '#e84040', marginTop: '4px' }}>{errors.email}</p>}
              </div>

              <PasswordInput
                label="Senha atual"
                placeholder="Digite sua senha atual"
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setErrors(prev => ({ ...prev, currentPassword: '' })); }}
                error={errors.currentPassword}
              />

              <div>
                <PasswordInput
                  label="Nova senha"
                  placeholder="Digite a nova senha"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setErrors(prev => ({ ...prev, newPassword: '' })); }}
                  error={errors.newPassword}
                />
                <PasswordRequirements password={newPassword} />
              </div>

              <PasswordInput
                label="Confirmar nova senha"
                placeholder="Digite novamente a nova senha"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
                error={errors.confirmPassword}
              />

              <Button type="submit" disabled={loading} className="w-full px-5 py-2.5 rounded-lg" style={{ backgroundColor: '#1565c0', color: '#ffffff', fontSize: '15px', fontWeight: 'bold', borderRadius: '8px' }}>
                {loading ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
