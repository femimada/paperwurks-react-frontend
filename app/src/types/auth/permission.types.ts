// src/types/auth/permission.types.ts
import type { UserRole, Permission } from '@/types/global.types';

/**
 * Permission context for checking permissions
 */
export interface PermissionContext {
  userId?: string;
  organizationId?: string;
  resourceId?: string;
  resourceType?: string;
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  granted: boolean;
  reason?: string;
  requiredPermissions: Permission[];
  missingPermissions: Permission[];
}

/**
 * Role-based permission configuration
 */
export interface RolePermissionConfig {
  role: UserRole;
  permissions: Permission[];
  description: string;
  inheritsFrom?: UserRole[];
}

/**
 * Dynamic permission rule
 */
export interface PermissionRule {
  id: string;
  name: string;
  description: string;
  condition: (context: PermissionContext) => boolean;
  permissions: Permission[];
}

/**
 * Permission group for organizing related permissions
 */
export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  icon?: string;
}

/**
 * User permission assignment
 */
export interface UserPermissionAssignment {
  userId: string;
  permissions: Permission[];
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  context?: PermissionContext;
}

/**
 * Permission audit log entry
 */
export interface PermissionAuditLog {
  id: string;
  userId: string;
  action: 'granted' | 'revoked' | 'checked';
  permission: Permission;
  resource?: string;
  resourceId?: string;
  result?: boolean;
  grantedBy?: string;
  timestamp: Date;
}

/**
 * Scoped permission for resource-specific access
 */
export interface ScopedPermission {
  permission: Permission;
  scope: {
    resourceType: string;
    resourceId?: string;
    organizationId?: string;
  };
}

/**
 * Permission matrix for complex authorization scenarios
 */
export interface PermissionMatrix {
  [role: string]: {
    [resource: string]: Permission[];
  };
}
