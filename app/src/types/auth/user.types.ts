// src/types/auth/user.types.ts
import type { BaseEntity, UserRole, Permission } from '@/types/global.types';
import type { UserProfile, Organization } from './auth.types';

/**
 * Extended user interface with all user-related data
 */
export interface UserEntity extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organization?: Organization;
  permissions: Permission[];
  profile: UserProfile;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
}

/**
 * User creation data
 */
export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  password: string;
  organizationId?: string;
}

/**
 * User update data
 */
export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  organizationId?: string;
  profile?: Partial<UserProfile>;
  isActive?: boolean;
}

/**
 * User list filters
 */
export interface UserFilters {
  role?: UserRole;
  organization?: string;
  isActive?: boolean;
  search?: string;
  isEmailVerified?: boolean;
}

/**
 * User list item (simplified for lists)
 */
export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organization?: Pick<Organization, 'id' | 'name'>;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}

/**
 * User statistics
 */
export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<UserRole, number>;
  recentLogins: number;
  pendingVerification: number;
}

/**
 * User activity log entry
 */
export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * User invitation data
 */
export interface UserInvitation {
  id: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

/**
 * Invite user request
 */
export interface InviteUserRequest {
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  organizationId?: string;
  message?: string;
}
