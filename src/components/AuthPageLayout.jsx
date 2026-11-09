import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

/** Página simples fora da área logada (troca/recuperação de senha). */
export default function AuthPageLayout({ title, children }) {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `${title} · StockFlow`;
  }, [title]);

  return (
    <div className="min-h-screen w-full bg-page">
      <div className="mx-auto max-w-md p-6">
        <div className="mb-8 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/login')} aria-label="Voltar para o login">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-extrabold text-navy">{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
}

export function AuthCard({ className, children }) {
  return <div className={cn('card p-8 shadow-[var(--shadow-panel)]', className)}>{children}</div>;
}

/** Cartão de resultado: ícone em círculo, título, texto e uma ação. */
export function AuthNotice({ Icon, tone = 'info', title, children, actionLabel, onAction }) {
  const tones = {
    info: 'bg-primary-soft text-primary',
    danger: 'bg-danger-soft text-danger',
  };
  return (
    <AuthCard className="text-center">
      <div className={cn('mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full', tones[tone])}>
        <Icon className="h-8 w-8" aria-hidden="true" />
      </div>
      <h2 className="mb-2 text-lg font-bold text-navy">{title}</h2>
      <p className="mb-6 text-sm text-muted">{children}</p>
      {actionLabel && <Button size="lg" className="w-full" onClick={onAction}>{actionLabel}</Button>}
    </AuthCard>
  );
}
