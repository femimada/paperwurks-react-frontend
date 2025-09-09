// src/services/auth/authService.ts
import { apiClient } from '@/services/api';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  RefreshTokenRequest,
  User,
} from '@/types/auth';
import type { ApiResponse } from '@/types/api/common.types';

/**
 * Authentication service for handling auth-related API calls
 */
export class AuthService {
  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Login failed');
    }

    return response.data.data;
  }

  /**
   * Register a new user account
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      userData
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Registration failed');
    }

    return response.data.data;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    const response = await apiClient.post<ApiResponse<null>>('/auth/logout');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Logout failed');
    }
  }

  /**
   * Refresh authentication tokens
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const requestData: RefreshTokenRequest = { refreshToken };

    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/refresh',
      requestData
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Token refresh failed');
    }

    return response.data.data;
  }

  /**
   * Send password reset email
   */
  async forgotPassword(email: string): Promise<void> {
    const requestData: ForgotPasswordRequest = { email };

    const response = await apiClient.post<ApiResponse<null>>(
      '/auth/forgot-password',
      requestData
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Password reset request failed');
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    const response = await apiClient.post<ApiResponse<null>>(
      '/auth/reset-password',
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Password reset failed');
    }
  }

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    const response = await apiClient.put<ApiResponse<null>>(
      '/users/change-password',
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Password change failed');
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/users/profile');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch user profile');
    }

    return response.data.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(
      '/users/profile',
      profileData
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Profile update failed');
    }

    return response.data.data;
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<null>>(
      `/auth/verify-email/${token}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Email verification failed');
    }
  }

  /**
   * Resend email verification
   */
  async resendVerification(): Promise<void> {
    const response = await apiClient.post<ApiResponse<null>>(
      '/auth/resend-verification'
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || 'Failed to resend verification email'
      );
    }
  }
}
