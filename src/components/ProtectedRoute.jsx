import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { canAccess } from '../config/routes';

function AccessDenied() {
  // Toast é efeito colateral: fica no effect, não no render (no StrictMode o render roda 2x)
  useEffect(() => {
    toast.error('Acesso negado. Você não tem permissão para acessar esta página.', { id: 'access-denied' });
  }, []);
  return <Navigate to="/dashboard" replace />;
}

export default function ProtectedRoute({ children, permissions }) {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccess(permissions, hasPermission)) {
    return <AccessDenied />;
  }

  return children;
}
