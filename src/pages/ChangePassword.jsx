import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';
import { parseApiError } from '../lib/apiError';
import { validatePassword } from '../lib/password';
import useRedirectAfter from '../hooks/useRedirectAfter';
import AuthPageLayout, { AuthCard } from '../components/AuthPageLayout';
import FormField, { FormInput } from '../components/FormField';
import PasswordInput from '../components/PasswordInput';
import PasswordRequirements from '../components/PasswordRequirements';
import SuccessMessage from '../components/SuccessMessage';

export default function ChangePassword() {
  const location = useLocation();
  const presetEmail = location.state?.email ?? '';
  const [form, setForm] = useState({ email: presetEmail, senhaAtual: '', senhaNova: '', confirmacao: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useRedirectAfter(success, '/login');

  const setField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      email: form.email ? '' : 'E-mail é obrigatório',
      senhaAtual: form.senhaAtual ? '' : 'Senha atual é obrigatória',
      senhaNova: validatePassword(form.senhaNova),
      confirmacao: form.senhaNova === form.confirmacao ? '' : 'As senhas não conferem',
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      await authService.trocarSenha({ email: form.email, senhaAtual: form.senhaAtual, senhaNova: form.senhaNova });
      setSuccess(true);
    } catch (error) {
      const { message, fieldErrors } = parseApiError(error);
      setErrors({ ...fieldErrors, senhaAtual: fieldErrors?.senhaAtual ?? message ?? 'Erro ao alterar senha. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout title="Alterar senha">
      {success ? (
        <SuccessMessage title="Senha alterada com sucesso!" message="Você será redirecionado para o login em instantes..." />
      ) : (
        <AuthCard>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <FormField label="E-mail" error={errors.email}>
              <FormInput type="email" placeholder="seu@email.com" value={form.email} onChange={setField('email')} disabled={Boolean(presetEmail)} autoComplete="email" />
            </FormField>

            <PasswordInput label="Senha atual" placeholder="Digite sua senha atual" value={form.senhaAtual} onChange={setField('senhaAtual')} error={errors.senhaAtual} />

            <div>
              <PasswordInput label="Nova senha" placeholder="Digite a nova senha" value={form.senhaNova} onChange={setField('senhaNova')} error={errors.senhaNova} autoComplete="new-password" />
              <PasswordRequirements password={form.senhaNova} />
            </div>

            <PasswordInput label="Confirmar nova senha" placeholder="Digite novamente a nova senha" value={form.confirmacao} onChange={setField('confirmacao')} error={errors.confirmacao} autoComplete="new-password" />

            <Button type="submit" size="lg" disabled={loading} className="w-full">{loading ? 'Salvando...' : 'Salvar alterações'}</Button>
          </form>
        </AuthCard>
      )}
    </AuthPageLayout>
  );
}
