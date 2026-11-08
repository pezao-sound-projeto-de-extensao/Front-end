import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';
import AuthPageLayout, { AuthCard, AuthNotice } from '../components/AuthPageLayout';
import FormField, { FormInput } from '../components/FormField';

export default function EsqueciSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErro('E-mail é obrigatório');
      return;
    }

    setLoading(true);
    setErro('');
    try {
      await authService.esqueciSenha(email);
      setEnviado(true);
    } catch (error) {
      setErro(error.response?.status === 400
        ? 'Informe um e-mail válido.'
        : 'Não foi possível enviar agora. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout title="Esqueci minha senha">
      {enviado ? (
        <AuthNotice Icon={Mail} title="Verifique seu e-mail" actionLabel="Voltar para o login" onAction={() => navigate('/login')}>
          Se <strong>{email}</strong> estiver cadastrado, você receberá um link para criar uma nova senha. O link vale por 30 minutos.
        </AuthNotice>
      ) : (
        <AuthCard>
          <p className="mb-5 text-sm text-muted">Informe o e-mail da sua conta. Vamos enviar um link para você criar uma nova senha.</p>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <FormField label="E-mail" error={erro}>
              <FormInput
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErro(''); }}
                autoComplete="email"
              />
            </FormField>
            <Button type="submit" size="lg" disabled={loading} className="w-full">{loading ? 'Enviando...' : 'Enviar link'}</Button>
          </form>
        </AuthCard>
      )}
    </AuthPageLayout>
  );
}
