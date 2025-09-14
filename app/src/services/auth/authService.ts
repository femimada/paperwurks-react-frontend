// src/services/auth/authService.ts
import { logger } from '@/utils/logger';
import { TokenService } from './tokenService';
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

export class AuthService {
  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/auth/login',
        credentials,
        { withCredentials: true }
      );
      if (!response.data.success) {
        throw new Error(response.data.message || 'Invalid credentials');
      }
      TokenService.setTokens(response.data.data.tokens);
      logger.debug('Login successful', { email: credentials.email });
      return response.data.data;
    } catch (error: any) {
      logger.error('Login failed', error);
      throw new Error(error.response?.data?.message || 'Invalid credentials');
    }
  }

  /**
   * Register a new user account
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/auth/register',
        userData
      );
      if (!response.data.success) {
        throw new Error(
          response.data.message || 'An account with this email already exists'
        );
      }
      TokenService.setTokens(response.data.data.tokens);
      logger.debug('Registration successful', { email: userData.email });
      return response.data.data;
    } catch (error: any) {
      logger.error('Registration failed', error);
      throw new Error(
        error.response?.data?.message ||
          'An account with this email already exists'
      );
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<null>>(
        '/auth/logout',
        {},
        { withCredentials: true }
      );
      if (!response.data.success) {
        throw new Error(response.data.message || 'Logout failed');
      }
      logger.debug('Logout successful');
    } catch (error: any) {
      logger.error('Logout failed', error);
      throw new Error(error.response?.data?.message || 'Logout failed');
    } finally {
      TokenService.clearTokens();
    }
  }

  /**
   * Refresh authentication tokens
   */
  async refreshToken(): Promise<AuthResponse> {
    const tokens = TokenService.getTokens();
    if (!tokens.refreshToken) {
      logger.warn('Token refresh failed: No refresh token available.');
      throw new Error('No refresh token available');
    }
    try {
      const requestData: RefreshTokenRequest = {
        refreshToken: tokens.refreshToken,
      };
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/auth/refresh',
        requestData,
        { withCredentials: true }
      );
      if (!response.data.success) {
        throw new Error(response.data.message || 'Invalid refresh token');
      }
      TokenService.setTokens(response.data.data.tokens);
      logger.debug('Token refresh successful');
      return response.data.data;
    } catch (error: any) {
      logger.error('Token refresh failed', error);
      TokenService.clearTokens();
      throw new Error(error.response?.data?.message || 'Invalid refresh token');
    }
  }

  /**
   * Send password reset email
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      const requestData: ForgotPasswordRequest = { email };
      const response = await apiClient.post<ApiResponse<null>>(
        '/auth/forgot-password',
        requestData
      );
      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Password reset request failed'
        );
      }
      logger.debug('Password reset email sent', { email });
    } catch (error: any) {
      logger.error('Failed to send password reset email', error);
      throw new Error(
        error.response?.data?.message || 'Password reset request failed'
      );
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<null>>(
        '/auth/reset-password',
        data
      );
      if (!response.data.success) {
        throw new Error(response.data.message || 'Password reset failed');
      }
      logger.debug('Password reset successful');
    } catch (error: any) {
      logger.error('Password reset failed', error);
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  }

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      const response = await apiClient.put<ApiResponse<null>>(
        '/users/change-password',
        data
      );
      if (!response.data.success) {
        throw new Error(response.data.message || 'Password change failed');
      }
      logger.debug('Password change successful');
    } catch (error: any) {
      logger.error('Password change failed', error);
      throw new Error(
        error.response?.data?.message || 'Password change failed'
      );
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/users/profile');
      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to fetch user profile'
        );
      }
      logger.debug('Fetched current user successfully');
      return response.data.data;
    } catch (error: any) {
      logger.error('Failed to fetch current user', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch user profile'
      );
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put<ApiResponse<User>>(
        '/users/profile',
        profileData
      );
      if (!response.data.success) {
        throw new Error(response.data.message || 'Profile update failed');
      }
      logger.debug('Profile update successful');
      return response.data.data;
    } catch (error: any) {
      logger.error('Profile update failed', error);
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<User> {
    try {
      const response = await apiClient.post<ApiResponse<User>>(
        `/auth/verify-email/${token}`
      );
      if (!response.data.success) {
        throw new Error(response.data.message || 'Email verification failed');
      }
      logger.debug('Email verification successful');
      return response.data.data;
    } catch (error: any) {
      logger.error('Email verification failed', error);
      throw new Error(
        error.response?.data?.message || 'Email verification failed'
      );
    }
  }

  /**
   * Resend email verification
   */
  async resendVerification(): Promise<User> {
    try {
      const response = await apiClient.post<ApiResponse<User>>(
        '/auth/resend-verification'
      );
      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to resend verification email'
        );
      }
      logger.debug('Verification email resent successfully');
      return response.data.data;
    } catch (error: any) {
      logger.error('Failed to resend verification email', error);
      throw new Error(
        error.response?.data?.message || 'Failed to resend verification email'
      );
    }
  }
}
