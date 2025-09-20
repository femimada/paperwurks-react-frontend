// src/types/auth/auth.types.ts
import type { UserRole, Permission } from '@/shared/types/global.types';
import type { LoginFormData as LoginRequest } from '@/domains/auth/utils/validation/authSchema';

/**
 * User profile information
 */

export interface UserProfile {
  phone?: string;
  avatar?: string;
  bio?: string;
  preferences?: UserPreferences;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: NotificationPreferences;
  timezone?: string;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  documentUploads: boolean;
  packUpdates: boolean;
  systemAlerts: boolean;
}

/**
 * Organization information
 */
export interface Organization {
  id: string;
  name: string;
  type?: 'estate_agency' | 'law_firm' | 'property_company';
  address?: string;
  website?: string;
}

/**
 * Complete user object
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organization?: Organization;
  permissions: Permission[];
  profile?: UserProfile;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
}

/**
 * Authentication tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organization?: {
    name: string;
    type?: Organization['type'];
  };
  acceptsTerms: boolean;
  acceptsMarketing?: boolean;
}

/**
 * Registration response
 */
export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
  message: string;
}

/**
 * Password reset request
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Password reset response
 */
export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Authentication response wrapper
 */
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: Permission[];
}

/**
 * Login form data
 */
// export interface LoginFormData {
//   email: string;
//   password: string;
//   rememberMe: boolean;
// }

/**
 * Forgot password form data
 */
export interface ForgotPasswordFormData {
  email: string;
}

/**
 * Reset password form data
 */
export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Change password form data
 */
export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Profile update form data
 */
export interface ProfileUpdateFormData {
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  preferences: UserPreferences;
}

/**
 * Session information
 */
export interface SessionInfo {
  user: User;
  permissions: Permission[];
  expiresAt: Date;
  lastActivity: Date;
}

/**
 * Auth context actions
 */
export interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  updateProfile: (data: Partial<ProfileUpdateFormData>) => Promise<void>;
  clearError: () => void;
}

/**
 * Auth hook return type
 */
export interface UseAuthReturn extends AuthState, AuthActions {
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  isRole: (roles: UserRole[]) => boolean;
}
