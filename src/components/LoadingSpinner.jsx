import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Carregando...', variant = 'inline' }) {
  if (variant === 'fullpage') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-page" role="status">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-base text-muted">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-center" role="status">
      <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-primary" />
      <p className="text-muted">{message}</p>
    </div>
  );
}
