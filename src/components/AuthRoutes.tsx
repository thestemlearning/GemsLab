import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShowTimeout(true), 8000);
      return () => clearTimeout(timer);
    } else {
      setShowTimeout(false);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-8 gap-4">
        <div className="font-mono text-xs animate-pulse text-slate-500 tracking-[0.2em]">INITIALIZING SESSION...</div>
        {showTimeout && (
          <div className="max-w-xs text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Connection Delay Detected</p>
            <p className="text-[9px] text-slate-400 leading-relaxed">
              If this persists, verify your Supabase URL and API Key are correctly configured in GitHub Secrets.
            </p>
          </div>
        )}
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
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShowTimeout(true), 8000);
      return () => clearTimeout(timer);
    } else {
      setShowTimeout(false);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-8 gap-4">
        <div className="font-mono text-xs animate-pulse text-slate-500 tracking-[0.2em]">VERIFYING PERMISSIONS...</div>
        {showTimeout && (
          <div className="max-w-xs text-center space-y-2">
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Permission Check Slow</p>
          </div>
        )}
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
