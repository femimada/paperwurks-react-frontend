// src/hooks/auth/usePermissions.ts
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { ROLE_PERMISSIONS } from '@/constants/roles';
import type { Permission, UserRole } from '@/types/global.types';
import type { PermissionCheckResult } from '@/types/auth';

/**
 * Hook for advanced permission management and checking
 *
 * Provides utilities for:
 * - Permission validation
 * - Role-based access control
 * - Permission inheritance
 * - Bulk permission checks
 */
export const usePermissions = () => {
  const {
    user,
    permissions,
    hasPermission,
    hasRole,
    hasAnyPermission,
    isRole,
  } = useAuth();

  /**
   * Get all permissions for a specific role
   */
  const getRolePermissions = useMemo(() => {
    return (role: UserRole): Permission[] => {
      return ROLE_PERMISSIONS[role] || [];
    };
  }, []);

  /**
   * Check if current user has all required permissions
   */
  const hasAllPermissions = useMemo(() => {
    return (requiredPermissions: Permission[]): boolean => {
      return requiredPermissions.every((permission) =>
        hasPermission(permission)
      );
    };
  }, [hasPermission]);

  /**
   * Detailed permission check with reasoning
   */
  const checkPermission = useMemo(() => {
    return (requiredPermissions: Permission[]): PermissionCheckResult => {
      const userPermissions = permissions;
      const missingPermissions = requiredPermissions.filter(
        (perm) => !userPermissions.includes(perm)
      );

      const granted = missingPermissions.length === 0;

      return {
        granted,
        reason: granted
          ? 'Permission granted'
          : `Missing permissions: ${missingPermissions.join(', ')}`,
        requiredPermissions,
        missingPermissions,
      };
    };
  }, [permissions]);

  /**
   * Check if user can access a resource based on role hierarchy
   */
  const canAccessResource = useMemo(() => {
    return (
      resourceRole: UserRole,
      requiredPermissions: Permission[] = []
    ): boolean => {
      if (!user) return false;

      // Check role match or hierarchy
      const roleHierarchy: Record<UserRole, number> = {
        buyer: 1,
        owner: 2,
        solicitor: 3,
        agent: 4,
      };

      const userRoleLevel = roleHierarchy[user.role];
      const resourceRoleLevel = roleHierarchy[resourceRole];

      // Higher level roles can access lower level resources
      const hasRoleAccess = userRoleLevel >= resourceRoleLevel;

      // Check specific permissions if provided
      const hasRequiredPermissions =
        requiredPermissions.length === 0 ||
        hasAllPermissions(requiredPermissions);

      return hasRoleAccess && hasRequiredPermissions;
    };
  }, [user, hasAllPermissions]);

  /**
   * Get user's effective permissions (role + assigned permissions)
   */
  const effectivePermissions = useMemo((): Permission[] => {
    if (!user) return [];

    const rolePermissions = getRolePermissions(user.role);
    const assignedPermissions = permissions;

    // Combine and deduplicate
    return Array.from(new Set([...rolePermissions, ...assignedPermissions]));
  }, [user, permissions, getRolePermissions]);

  /**
   * Check if user has elevated permissions beyond their role
   */
  const hasElevatedPermissions = useMemo((): boolean => {
    if (!user) return false;

    const rolePermissions = getRolePermissions(user.role);
    const userPermissions = permissions;

    return userPermissions.some((perm) => !rolePermissions.includes(perm));
  }, [user, permissions, getRolePermissions]);

  /**
   * Get permissions that the user is missing for a specific role
   */
  const getMissingPermissionsForRole = useMemo(() => {
    return (targetRole: UserRole): Permission[] => {
      const targetPermissions = getRolePermissions(targetRole);
      const userPermissions = permissions;

      return targetPermissions.filter(
        (perm) => !userPermissions.includes(perm)
      );
    };
  }, [permissions, getRolePermissions]);

  return {
    // Basic permission checks (from useAuth)
    hasPermission,
    hasRole,
    hasAnyPermission,
    isRole,

    // Advanced permission utilities
    hasAllPermissions,
    checkPermission,
    canAccessResource,
    getRolePermissions,
    getMissingPermissionsForRole,

    // Permission insights
    effectivePermissions,
    hasElevatedPermissions,

    // Current user context
    currentRole: user?.role,
    currentPermissions: permissions,
  };
};
