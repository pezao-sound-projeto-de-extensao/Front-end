import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function ProtectedRoute({ children, permissions }) {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const requiredPermissions = permissions || [];
  if (requiredPermissions.length > 0) {
    const hasAccess = requiredPermissions.some(p => hasPermission(p));
    if (!hasAccess) {
      toast.error('Acesso negado. Você não tem permissão para acessar esta página.');
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}