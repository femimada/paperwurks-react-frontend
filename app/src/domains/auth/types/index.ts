// src/types/auth/index.ts

// Re-export types from the auth.types file
export type {
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  User,
  UserProfile,
  UserPreferences,
  NotificationPreferences,
  Organization,
  AuthTokens,
  AuthState,
  AuthActions,
  UseAuthReturn,
  SessionInfo,
  LoginResponse,
  RegisterResponse,
  RefreshTokenRequest,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  ChangePasswordFormData,
  ProfileUpdateFormData,
} from './auth.types';

// Re-export types from the user.types file
export type {
  UserEntity,
  CreateUserData,
  UpdateUserData,
  UserFilters,
  UserListItem,
  UserStats,
  UserActivity,
  UserInvitation,
  InviteUserRequest,
} from './user.types';

// Re-export types from the permission.types file
export type {
  PermissionContext,
  PermissionCheckResult,
  RolePermissionConfig,
  PermissionRule,
  PermissionGroup,
  UserPermissionAssignment,
  PermissionAuditLog,
  ScopedPermission,
  PermissionMatrix,
} from './permission.types';

// Re-export renamed types from hooks
export type { LoginFormData as LoginRequest } from '@/domains/auth/hooks/useLogin';
export type { RegisterFormData as RegisterRequest } from '@/domains/auth/hooks/useRegister';
