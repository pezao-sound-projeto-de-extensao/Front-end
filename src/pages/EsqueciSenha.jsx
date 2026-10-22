import { useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';

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
      if (error.response?.status === 400) {
        setErro('Informe um e-mail válido.');
      } else {
        setErro('Não foi possível enviar agora. Tente novamente em instantes.');
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
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>Esqueci minha senha</h2>
        </div>

        {enviado ? (
          <div className="bg-white p-8 rounded-lg text-center" style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', boxShadow: 'var(--shadow-panel)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#e7f1fb' }}>
              <Mail className="w-8 h-8" style={{ color: '#1565c0' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0d2137', marginBottom: '8px' }}>Verifique seu e-mail</h3>
            <p style={{ fontSize: '14px', color: '#5a82a0', marginBottom: '24px' }}>
              Se <strong>{email}</strong> estiver cadastrado, você receberá um link para criar uma nova senha.
              O link vale por 30 minutos.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full px-5 py-2.5 rounded-lg" style={{ backgroundColor: '#1565c0', color: '#ffffff', fontSize: '15px', fontWeight: '700', borderRadius: '8px' }}>
              Voltar para o login
            </Button>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg" style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', boxShadow: 'var(--shadow-panel)' }}>
            <p style={{ fontSize: '14px', color: '#5a82a0', marginBottom: '20px' }}>
              Informe o e-mail da sua conta. Vamos enviar um link para você criar uma nova senha.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block mb-2 uppercase" style={{ fontSize: '12px', color: '#5a82a0', fontWeight: '600' }}>E-mail</label>
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErro(''); }}
                  className="w-full rounded-lg"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    border: erro ? '1.5px solid #e84040' : '1.5px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#1565c0'; e.target.style.boxShadow = '0 0 0 3px rgba(21,101,192,0.15)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.boxShadow = 'none'; }}
                />
                {erro && <p style={{ fontSize: '11px', color: '#e84040', marginTop: '4px' }}>{erro}</p>}
              </div>

              <Button type="submit" disabled={loading} className="w-full px-5 py-2.5 rounded-lg" style={{ backgroundColor: '#1565c0', color: '#ffffff', fontSize: '15px', fontWeight: '700', borderRadius: '8px' }}>
                {loading ? 'Enviando...' : 'Enviar link'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
