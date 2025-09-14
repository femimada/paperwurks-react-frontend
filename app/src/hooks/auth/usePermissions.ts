// src/hooks/auth/usePermissions.ts
import { useMemo, useCallback } from 'react'; // REFACTOR: useCallback is better for functions
import { useAuth } from './useAuth';
import { ROLE_PERMISSIONS } from '@/constants/roles';
import type { Permission, UserRole } from '@/types/global.types';
import type { PermissionCheckResult } from '@/types/auth';

/**
 * Hook for advanced permission management and checking
 */
export const usePermissions = () => {
  const { user, permissions, hasPermission, hasRole, hasAnyPermission } =
    useAuth();

  /**
   * Get all permissions for a specific role
   */
  const getRolePermissions = useCallback((role: UserRole): Permission[] => {
    return ROLE_PERMISSIONS[role] || [];
  }, []);

  /**
   * Check if current user has all required permissions
   */
  const hasAllPermissions = useCallback(
    (requiredPermissions: Permission[]): boolean => {
      // FIX: Use the 'permissions' array from state for efficiency
      const userPermissions = new Set(permissions);
      return requiredPermissions.every((permission) =>
        userPermissions.has(permission)
      );
    },
    [permissions]
  );

  /**
   * Detailed permission check with reasoning
   */
  const checkPermission = useCallback(
    (requiredPermissions: Permission[]): PermissionCheckResult => {
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
    },
    [permissions]
  );

  /**
   * Check if user can access a resource based on role hierarchy
   */
  const canAccessResource = useCallback(
    (
      resourceRole: UserRole,
      requiredPermissions: Permission[] = []
    ): boolean => {
      if (!user) return false;

      const roleHierarchy: Record<UserRole, number> = {
        buyer: 1,
        owner: 2,
        solicitor: 3,
        agent: 4,
      };

      const userRoleLevel = roleHierarchy[user.role];
      const resourceRoleLevel = roleHierarchy[resourceRole];

      const hasRoleAccess = userRoleLevel >= resourceRoleLevel;

      const hasRequiredPermissions =
        requiredPermissions.length === 0 ||
        hasAllPermissions(requiredPermissions);

      return hasRoleAccess && hasRequiredPermissions;
    },
    [user, hasAllPermissions]
  );

  /**
   * Get user's effective permissions (role + assigned permissions)
   */
  const effectivePermissions = useMemo((): Permission[] => {
    if (!user) return [];
    const rolePermissions = getRolePermissions(user.role);
    // Combine and deduplicate
    return Array.from(new Set([...rolePermissions, ...permissions]));
  }, [user, permissions, getRolePermissions]);

  /**
   * Check if user has elevated permissions beyond their role
   */
  const hasElevatedPermissions = useMemo((): boolean => {
    if (!user) return false;
    const rolePermissions = new Set(getRolePermissions(user.role));
    return permissions.some((perm) => !rolePermissions.has(perm));
  }, [user, permissions, getRolePermissions]);

  /**
   * Get permissions that the user is missing for a specific role
   */
  const getMissingPermissionsForRole = useCallback(
    (targetRole: UserRole): Permission[] => {
      const targetPermissions = getRolePermissions(targetRole);
      const userPermissions = new Set(permissions);
      return targetPermissions.filter((perm) => !userPermissions.has(perm));
    },
    [permissions, getRolePermissions]
  );

  return {
    // Basic permission checks (from useAuth)
    hasPermission,
    hasRole,
    hasAnyPermission,
    isRole: hasRole,

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
