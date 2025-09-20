import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/services/api', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../tokenService', () => ({
  TokenService: {
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
    getTokens: vi.fn(),
    hasValidTokens: vi.fn(),
    isTokenExpired: vi.fn(),
  },
}));

vi.mock('@/shared/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Now import after mocks
import { TokenService } from '../tokenService';
import { apiClient } from '@/services/api';
import { logger } from '@/shared/utils/logger';
import type { LoginFormData as LoginRequest } from '@/domains/auth/utils/validation/authSchema';
import type { RegisterFormData as RegisterRequest } from '@/domains/auth/utils/validation/authSchema';

import { authService } from '../authService';

import type {
  ResetPasswordRequest,
  ChangePasswordRequest,
  User,
} from '@/domains/auth/types/auth.types';

// Mock the API client
vi.mock('@/services/api', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));

// Mock TokenService
vi.mock('../tokenService', () => ({
  TokenService: {
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
    getTokens: vi.fn(),
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    hasValidTokens: vi.fn(),
    isTokenExpired: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/shared/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(TokenService.getTokens).mockClear();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockCredentials: LoginRequest = {
        email: 'owner@test.com',
        password: 'password123',
        rememberMe: false,
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: '1',
              email: 'owner@test.com',
              firstName: 'John',
              lastName: 'Owner',
              role: 'owner',
            },
            tokens: {
              accessToken: 'mock-access-token',
              refreshToken: 'mock-refresh-token',
              expiresAt: new Date(Date.now() + 3600000).toISOString(),
              tokenType: 'Bearer',
            },
          },
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);
      vi.mocked(TokenService.setTokens).mockReturnValue(undefined);

      const result = await authService.login(mockCredentials);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/login',
        mockCredentials,
        { withCredentials: true }
      );
      expect(TokenService.setTokens).toHaveBeenCalledWith(
        mockResponse.data.data.tokens
      );
      expect(logger.debug).toHaveBeenCalledWith('Login successful', {
        email: mockCredentials.email,
      });
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should throw error for invalid credentials', async () => {
      const mockCredentials: LoginRequest = {
        email: 'wrong@test.com',
        password: 'wrongpassword',
        rememberMe: false,
      };

      const mockError = {
        response: { data: { message: 'Invalid credentials' } },
      };

      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      await expect(authService.login(mockCredentials)).rejects.toThrow(
        'Invalid credentials'
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Login failed',
        expect.anything()
      );
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockRegisterData: RegisterRequest = {
        email: 'newuser@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'New',
        lastName: 'User',
        acceptsTerms: true,
        acceptsMarketing: false,
        role: 'owner',
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: '5',
              email: 'newuser@test.com',
              firstName: 'New',
              lastName: 'User',
              role: 'owner',
            },
            tokens: {
              accessToken: 'mock-access-token',
              refreshToken: 'mock-refresh-token',
              expiresAt: new Date(Date.now() + 3600000).toISOString(),
              tokenType: 'Bearer',
            },
          },
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);
      vi.mocked(TokenService.setTokens).mockReturnValue(undefined);

      const result = await authService.register(mockRegisterData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/register',
        mockRegisterData
      );
      expect(TokenService.setTokens).toHaveBeenCalledWith(
        mockResponse.data.data.tokens
      );
      expect(logger.debug).toHaveBeenCalledWith('Registration successful', {
        email: mockRegisterData.email,
      });
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should throw error for existing email', async () => {
      const mockRegisterData: RegisterRequest = {
        email: 'owner@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'Duplicate',
        lastName: 'User',
        acceptsTerms: true,
        acceptsMarketing: false,
        role: 'owner',
      };

      const mockError = {
        response: {
          data: { message: 'An account with this email already exists' },
        },
      };

      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      await expect(authService.register(mockRegisterData)).rejects.toThrow(
        'An account with this email already exists'
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Registration failed',
        expect.anything()
      );
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh tokens', async () => {
      const mockTokens = {
        accessToken: 'old-access-token',
        refreshToken: 'mock-refresh-token',
        tokenType: 'Bearer',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      };
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: '1',
              email: 'owner@test.com',
              firstName: 'John',
              lastName: 'Owner',
              role: 'owner',
            },
            tokens: {
              accessToken: 'new-access-token',
              refreshToken: 'new-refresh-token',
              expiresAt: new Date(Date.now() + 3600000).toISOString(),
              tokenType: 'Bearer',
            },
          },
        },
      };

      vi.mocked(TokenService.getTokens).mockReturnValue(mockTokens);
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);
      vi.mocked(TokenService.setTokens).mockReturnValue(undefined);

      const result = await authService.refreshToken();

      expect(TokenService.getTokens).toHaveBeenCalled();
      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/refresh',
        { refreshToken: mockTokens.refreshToken },
        { withCredentials: true }
      );
      expect(TokenService.setTokens).toHaveBeenCalledWith(
        mockResponse.data.data.tokens
      );
      expect(logger.debug).toHaveBeenCalledWith('Token refresh successful');
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should throw error for invalid refresh token', async () => {
      const mockTokens = {
        accessToken: 'old-access-token',
        refreshToken: 'invalid-token',
        tokenType: 'Bearer',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      };
      const mockError = {
        response: { data: { message: 'Invalid refresh token' } },
      };

      vi.mocked(TokenService.getTokens).mockReturnValue(mockTokens);
      vi.mocked(apiClient.post).mockRejectedValue(mockError);
      vi.mocked(TokenService.clearTokens).mockReturnValue(undefined);

      await expect(authService.refreshToken()).rejects.toThrow(
        'Invalid refresh token'
      );
      expect(TokenService.clearTokens).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        'Token refresh failed',
        expect.anything()
      );
    });

    it('should throw "No refresh token available" if no token is found', async () => {
      vi.mocked(TokenService.getTokens).mockReturnValue({
        accessToken: '',
        refreshToken: '',
        tokenType: 'Bearer',
        expiresAt: '',
      });

      await expect(authService.refreshToken()).rejects.toThrow(
        'No refresh token available'
      );
      expect(apiClient.post).not.toHaveBeenCalled();
      expect(TokenService.clearTokens).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      const mockResponse = {
        data: { success: true, data: null },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);
      vi.mocked(TokenService.clearTokens).mockReturnValue(undefined);

      await authService.logout();

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/logout',
        {},
        { withCredentials: true }
      );
      expect(TokenService.clearTokens).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith('Logout successful');
    });

    it('should throw error on logout failure', async () => {
      const mockError = {
        response: { data: { message: 'Logout failed' } },
      };

      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      await expect(authService.logout()).rejects.toThrow('Logout failed');
      expect(logger.error).toHaveBeenCalledWith(
        'Logout failed',
        expect.anything()
      );
    });
  });

  describe('forgotPassword', () => {
    it('should successfully send password reset email', async () => {
      const email = 'owner@test.com';
      const mockResponse = {
        data: { success: true, data: null },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      await authService.forgotPassword(email);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email,
      });
      expect(logger.debug).toHaveBeenCalledWith('Password reset email sent', {
        email,
      });
    });

    it('should throw error on failure', async () => {
      const email = 'owner@test.com';
      const mockError = {
        response: { data: { message: 'Password reset request failed' } },
      };

      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      await expect(authService.forgotPassword(email)).rejects.toThrow(
        'Password reset request failed'
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to send password reset email',
        expect.anything()
      );
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password', async () => {
      const resetData: ResetPasswordRequest = {
        token: 'reset-token',
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      };
      const mockResponse = {
        data: { success: true, data: null },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      await authService.resetPassword(resetData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/reset-password',
        resetData
      );
      expect(logger.debug).toHaveBeenCalledWith('Password reset successful');
    });

    it('should throw error on failure', async () => {
      const resetData: ResetPasswordRequest = {
        token: 'invalid-token',
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      };
      const mockError = {
        response: { data: { message: 'Password reset failed' } },
      };

      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      await expect(authService.resetPassword(resetData)).rejects.toThrow(
        'Password reset failed'
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Password reset failed',
        expect.anything()
      );
    });
  });

  describe('changePassword', () => {
    it('should successfully change password', async () => {
      const changeData: ChangePasswordRequest = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      };
      const mockResponse = {
        data: { success: true, data: null },
      };

      vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

      await authService.changePassword(changeData);

      expect(apiClient.put).toHaveBeenCalledWith(
        '/users/change-password',
        changeData
      );
      expect(logger.debug).toHaveBeenCalledWith('Password change successful');
    });

    it('should throw error on failure', async () => {
      const changeData: ChangePasswordRequest = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };
      const mockError = {
        response: { data: { message: 'Password change failed' } },
      };

      vi.mocked(apiClient.put).mockRejectedValue(mockError);

      await expect(authService.changePassword(changeData)).rejects.toThrow(
        'Password change failed'
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Password change failed',
        expect.anything()
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should successfully get current user profile', async () => {
      const mockUser = {
        id: '1',
        email: 'owner@test.com',
        firstName: 'John',
        lastName: 'Owner',
        role: 'owner',
      };
      const mockResponse = {
        data: { success: true, data: mockUser },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await authService.getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith('/users/profile');
      expect(logger.debug).toHaveBeenCalledWith(
        'Fetched current user successfully'
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw error on failure', async () => {
      const mockError = {
        response: { data: { message: 'Failed to fetch user profile' } },
      };

      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      await expect(authService.getCurrentUser()).rejects.toThrow(
        'Failed to fetch user profile'
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to fetch current user',
        expect.anything()
      );
    });
  });

  describe('updateProfile', () => {
    it('should successfully update user profile', async () => {
      const profileData: Partial<User> = {
        firstName: 'John',
        lastName: 'Doe Updated',
      };
      const mockUser = {
        id: '1',
        email: 'owner@test.com',
        firstName: 'John',
        lastName: 'Doe Updated',
        role: 'owner',
      };
      const mockResponse = {
        data: { success: true, data: mockUser },
      };

      vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

      const result = await authService.updateProfile(profileData);

      expect(apiClient.put).toHaveBeenCalledWith('/users/profile', profileData);
      expect(logger.debug).toHaveBeenCalledWith('Profile update successful');
      expect(result).toEqual(mockUser);
    });

    it('should throw error on failure', async () => {
      const profileData: Partial<User> = {
        firstName: 'John',
        lastName: 'Doe Updated',
      };
      const mockError = {
        response: { data: { message: 'Profile update failed' } },
      };

      vi.mocked(apiClient.put).mockRejectedValue(mockError);

      await expect(authService.updateProfile(profileData)).rejects.toThrow(
        'Profile update failed'
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Profile update failed',
        expect.anything()
      );
    });
  });

  describe('verifyEmail', () => {
    it('should successfully verify email', async () => {
      const token = 'verification-token';
      const mockResponse = {
        data: { success: true, data: null },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      await authService.verifyEmail(token);

      expect(apiClient.post).toHaveBeenCalledWith(
        `/auth/verify-email/${token}`
      );
      expect(logger.debug).toHaveBeenCalledWith(
        'Email verification successful'
      );
    });

    it('should throw error on failure', async () => {
      const token = 'invalid-token';
      const mockError = {
        response: { data: { message: 'Email verification failed' } },
      };

      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      await expect(authService.verifyEmail(token)).rejects.toThrow(
        'Email verification failed'
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Email verification failed',
        expect.anything()
      );
    });
  });

  describe('resendVerification', () => {
    it('should successfully resend verification email', async () => {
      const mockResponse = {
        data: { success: true, data: null },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      await authService.resendVerification();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/resend-verification');
      expect(logger.debug).toHaveBeenCalledWith(
        'Verification email resent successfully'
      );
    });

    it('should throw error on failure', async () => {
      const mockError = {
        response: { data: { message: 'Failed to resend verification email' } },
      };

      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      await expect(authService.resendVerification()).rejects.toThrow(
        'Failed to resend verification email'
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to resend verification email',
        expect.anything()
      );
    });
  });
});
