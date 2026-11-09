import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';
import { validatePassword } from '../lib/password';
import useRedirectAfter from '../hooks/useRedirectAfter';
import AuthPageLayout, { AuthCard, AuthNotice } from '../components/AuthPageLayout';
import PasswordInput from '../components/PasswordInput';
import PasswordRequirements from '../components/PasswordRequirements';
import SuccessMessage from '../components/SuccessMessage';

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erros, setErros] = useState({});
  const [linkInvalido, setLinkInvalido] = useState(!token);
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  useRedirectAfter(sucesso, '/login');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const novosErros = {
      novaSenha: validatePassword(novaSenha),
      confirmacao: novaSenha !== confirmacao ? 'As senhas não conferem' : '',
    };
    setErros(novosErros);
    if (novosErros.novaSenha || novosErros.confirmacao) return;

    setLoading(true);
    try {
      await authService.redefinirSenha({ token, senhaNova: novaSenha });
      setSucesso(true);
    } catch (error) {
      const { status, data } = error.response ?? {};
      if (status === 400 && data?.errors?.senhaNova) {
        setErros({ novaSenha: data.errors.senhaNova });
      } else if (status === 400) {
        setLinkInvalido(true);
      } else {
        setErros({ geral: 'Não foi possível alterar a senha agora. Tente novamente em instantes.' });
      }
    } finally {
      setLoading(false);
    }
  };

  let content;
  if (sucesso) {
    content = <SuccessMessage title="Senha alterada com sucesso!" message="Você será redirecionado para o login em instantes..." />;
  } else if (linkInvalido) {
    content = (
      <AuthNotice Icon={AlertCircle} tone="danger" title="Link inválido ou expirado" actionLabel="Pedir novo link" onAction={() => navigate('/esqueci-senha')}>
        O link vale por 30 minutos e só pode ser usado uma vez. Peça um novo para continuar.
      </AuthNotice>
    );
  } else {
    content = (
      <AuthCard>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <PasswordInput
              label="Nova senha"
              placeholder="Digite a nova senha"
              value={novaSenha}
              onChange={(e) => { setNovaSenha(e.target.value); setErros((atual) => ({ ...atual, novaSenha: '' })); }}
              error={erros.novaSenha}
              autoComplete="new-password"
            />
            <PasswordRequirements password={novaSenha} />
          </div>

          <PasswordInput
            label="Confirmar nova senha"
            placeholder="Digite novamente a nova senha"
            value={confirmacao}
            onChange={(e) => { setConfirmacao(e.target.value); setErros((atual) => ({ ...atual, confirmacao: '' })); }}
            error={erros.confirmacao}
            autoComplete="new-password"
          />

          {erros.geral && <p className="text-xs text-danger" role="alert">{erros.geral}</p>}

          <Button type="submit" size="lg" disabled={loading} className="w-full">{loading ? 'Salvando...' : 'Salvar nova senha'}</Button>
        </form>
      </AuthCard>
    );
  }

  return <AuthPageLayout title="Criar nova senha">{content}</AuthPageLayout>;
}
