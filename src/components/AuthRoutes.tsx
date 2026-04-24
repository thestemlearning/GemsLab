import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#E4E3E0]">
        <div className="font-mono text-sm animate-pulse">AUTHENTICATING...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#E4E3E0]">
        <div className="font-mono text-sm animate-pulse">VERIFYING PERMISSIONS...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
