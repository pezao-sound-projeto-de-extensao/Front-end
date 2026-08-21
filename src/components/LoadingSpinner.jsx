import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Carregando...', variant = 'inline' }) {
  if (variant === 'fullpage') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: '#e8edf3' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1565c0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: '#5a82a0', fontSize: '16px' }}>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" style={{ color: '#1565c0' }} />
      <p style={{ color: '#5a82a0' }}>{message}</p>
    </div>
  );
}
