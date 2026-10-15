import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0C0E] flex flex-col items-center justify-center gap-3">
        <div className="relative">
          <Loader2 className="w-10 h-10 text-[#B8F55A] animate-spin" />
          <div className="absolute inset-0 rounded-full blur-md bg-[#B8F55A]/20" />
        </div>
        <p className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold animate-pulse">
          Authenticating SmartCRM...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
