import React from 'react';
import { useAuth } from '@/hooks/auth';
import type { UserRole, Permission } from '@/types/global.types';

interface RoleBasedAccessProps {
  children: React.ReactNode;
  roles?: UserRole[];
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Component-level access control for showing/hiding UI elements based on roles and permissions
 *
 * @param children - Components to render if access is granted
 * @param roles - Array of roles that can see this component
 * @param permissions - Array of permissions required
 * @param requireAll - Whether all permissions are required or just one
 * @param fallback - What to render if access is denied (default: null)
 */
export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  children,
  roles = [],
  permissions = [],
  requireAll = false,
  fallback = null,
}) => {
  const { user, hasRole, hasPermission, hasAnyPermission } = useAuth();

  // If no user, don't show anything
  if (!user) {
    return <>{fallback}</>;
  }

  // Check role requirements
  if (roles.length > 0) {
    const hasRequiredRole = roles.some((role) => hasRole(role));

    if (!hasRequiredRole) {
      return <>{fallback}</>;
    }
  }

  // Check permission requirements
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? permissions.every((permission) => hasPermission(permission))
      : hasAnyPermission(permissions);

    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};
