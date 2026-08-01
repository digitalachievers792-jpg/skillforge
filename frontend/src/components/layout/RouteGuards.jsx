import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../ui/Spinner';

export const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Checking your session…" />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
};

export const RequireRole = ({ roles, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Checking your session…" />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (!roles.includes(user.role)) {
    const fallback = user.role === 'admin' ? '/dashboard/admin' : user.role === 'instructor' ? '/dashboard/instructor' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }
  return children;
};

export const PublicOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) {
    const fallback = user.role === 'admin' ? '/dashboard/admin' : user.role === 'instructor' ? '/dashboard/instructor' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }
  return children;
};
