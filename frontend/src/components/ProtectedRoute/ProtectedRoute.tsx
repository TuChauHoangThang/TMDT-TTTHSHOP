import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Props {
  children: React.ReactNode;
  /** Optional: restrict to specific roles */
  allowedRoles?: ('CUSTOMER' | 'CONTRACTOR' | 'ADMIN')[];
}

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Wait until auth state is hydrated from localStorage
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '1rem',
        color: 'var(--color-text-muted)',
      }}>
        <div style={{
          width: 44, height: 44,
          border: '4px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.9s linear infinite',
        }} />
        <span>Đang xác thực...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in → redirect to login, save intended path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', flexDirection: 'column', gap: '1rem', textAlign: 'center',
      }}>
        <i className="fa fa-lock" style={{ fontSize: '3rem', color: 'var(--color-border)' }} />
        <h3 style={{ fontFamily: 'var(--font-heading)' }}>Không có quyền truy cập</h3>
        <p style={{ color: 'var(--color-text-muted)' }}>Tài khoản của bạn không có quyền xem trang này.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
