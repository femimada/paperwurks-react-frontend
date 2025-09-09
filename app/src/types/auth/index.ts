// src/types/auth/index.ts
export type {
  // Main auth types
  User,
  UserProfile,
  UserPreferences,
  NotificationPreferences,
  Organization,
  AuthTokens,
  AuthResponse,
  AuthState,
  AuthActions,
  UseAuthReturn,
  SessionInfo,

  // Request/Response types
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  RefreshTokenRequest,

  // Form data types
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  ChangePasswordFormData,
  ProfileUpdateFormData,
} from './auth.types';

export type {
  // Extended user types
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

export type {
  // Permission types
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
