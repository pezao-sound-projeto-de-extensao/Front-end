import { useState } from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';
import PasswordInput from '../components/PasswordInput';
import PasswordRequirements from '../components/PasswordRequirements';
import SuccessMessage from '../components/SuccessMessage';

const TAMANHO_MAXIMO = 20;

const validarSenha = (senha) => {
  const erros = [];
  if (senha.length < 8) erros.push('Pelo menos 8 caracteres');
  if (senha.length > TAMANHO_MAXIMO) erros.push(`No máximo ${TAMANHO_MAXIMO} caracteres`);
  if (!/[A-Z]/.test(senha)) erros.push('Uma letra maiúscula');
  if (!/[a-z]/.test(senha)) erros.push('Uma letra minúscula');
  if (!/[0-9]/.test(senha)) erros.push('Um número');
  if (!/[!@#$%^&*]/.test(senha)) erros.push('Um caractere especial (!@#$%^&*)');
  return erros;
};

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erros, setErros] = useState({ novaSenha: '', confirmacao: '', geral: '' });
  const [linkInvalido, setLinkInvalido] = useState(!token);
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errosSenha = validarSenha(novaSenha);
    const novosErros = {
      novaSenha: errosSenha.join(', '),
      confirmacao: novaSenha !== confirmacao ? 'As senhas não conferem' : '',
      geral: '',
    };
    setErros(novosErros);

    if (novosErros.novaSenha || novosErros.confirmacao) {
      return;
    }

    setLoading(true);

    try {
      await authService.redefinirSenha({ token, senhaNova: novaSenha });
      setSucesso(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const dados = error.response?.data;
      if (error.response?.status === 400 && dados?.errors?.senhaNova) {
        setErros((atual) => ({ ...atual, novaSenha: dados.errors.senhaNova }));
      } else if (error.response?.status === 400) {
        setLinkInvalido(true);
      } else {
        setErros((atual) => ({ ...atual, geral: 'Não foi possível alterar a senha agora. Tente novamente em instantes.' }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-md mx-auto p-6">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/login')} style={{ color: '#1a3a55' }}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>Criar nova senha</h2>
        </div>

        {sucesso && (
          <SuccessMessage
            title="Senha alterada com sucesso!"
            message="Você será redirecionado para o login em instantes..."
          />
        )}

        {!sucesso && linkInvalido && (
          <div className="bg-white p-8 rounded-lg text-center" style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', boxShadow: 'var(--shadow-panel)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#fdecec' }}>
              <AlertCircle className="w-8 h-8" style={{ color: '#e84040' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0d2137', marginBottom: '8px' }}>Link inválido ou expirado</h3>
            <p style={{ fontSize: '14px', color: '#5a82a0', marginBottom: '24px' }}>
              O link vale por 30 minutos e só pode ser usado uma vez. Peça um novo para continuar.
            </p>
            <Button onClick={() => navigate('/esqueci-senha')} className="w-full px-5 py-2.5 rounded-lg" style={{ backgroundColor: '#1565c0', color: '#ffffff', fontSize: '15px', fontWeight: '700', borderRadius: '8px' }}>
              Pedir novo link
            </Button>
          </div>
        )}

        {!sucesso && !linkInvalido && (
          <div className="bg-white p-8 rounded-lg" style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', boxShadow: 'var(--shadow-panel)' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <PasswordInput
                  label="Nova senha"
                  placeholder="Digite a nova senha"
                  value={novaSenha}
                  onChange={(e) => { setNovaSenha(e.target.value); setErros((atual) => ({ ...atual, novaSenha: '' })); }}
                  error={erros.novaSenha}
                />
                <PasswordRequirements password={novaSenha} />
              </div>

              <PasswordInput
                label="Confirmar nova senha"
                placeholder="Digite novamente a nova senha"
                value={confirmacao}
                onChange={(e) => { setConfirmacao(e.target.value); setErros((atual) => ({ ...atual, confirmacao: '' })); }}
                error={erros.confirmacao}
              />

              {erros.geral && <p style={{ fontSize: '12px', color: '#e84040' }}>{erros.geral}</p>}

              <Button type="submit" disabled={loading} className="w-full px-5 py-2.5 rounded-lg" style={{ backgroundColor: '#1565c0', color: '#ffffff', fontSize: '15px', fontWeight: '700', borderRadius: '8px' }}>
                {loading ? 'Salvando...' : 'Salvar nova senha'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
