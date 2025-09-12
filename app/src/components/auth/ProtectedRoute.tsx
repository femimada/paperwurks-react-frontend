// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { Spinner } from '@/components/ui';
import type { UserRole, Permission } from '@/types/global.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: UserRole[];
  requiredPermissions?: Permission[];
  requireAll?: boolean; // If true, ALL permissions are required. If false, ANY permission is sufficient
  fallbackPath?: string;
}

/**
 * ProtectedRoute component for route-level access control
 *
 * @param children - Components to render if access is granted
 * @param requireAuth - Whether authentication is required (default: true)
 * @param requiredRoles - Array of roles that can access this route
 * @param requiredPermissions - Array of permissions required
 * @param requireAll - Whether all permissions are required or just one
 * @param fallbackPath - Where to redirect if access is denied
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRoles = [],
  requiredPermissions = [],
  requireAll = false,
  fallbackPath = '/login',
}) => {
  const location = useLocation();
  const {
    isAuthenticated,
    isLoading,
    user,
    hasRole,
    hasPermission,
    hasAnyPermission,
  } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirecting after login
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // If not authenticated and auth not required, allow access
  if (!isAuthenticated && !requireAuth) {
    return <>{children}</>;
  }

  // Check role requirements
  if (user && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) => hasRole(role));

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? requiredPermissions.every((permission) => hasPermission(permission))
      : hasAnyPermission(requiredPermissions);

    if (!hasRequiredPermissions) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};
