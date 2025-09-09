// src/services/auth/__tests__/authService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../authService';
import { TokenService } from '../tokenService';
import type { LoginRequest, RegisterRequest } from '@/types/auth';

// Mock the API client
vi.mock('@/services/api', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockCredentials: LoginRequest = {
        email: 'owner@test.com',
        password: 'password123',
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

      const { apiClient } = await import('@/services/api');
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await authService.login(mockCredentials);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/login',
        mockCredentials
      );
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should throw error for invalid credentials', async () => {
      const mockCredentials: LoginRequest = {
        email: 'wrong@test.com',
        password: 'wrongpassword',
      };

      const mockResponse = {
        data: {
          success: false,
          message: 'Invalid credentials',
        },
      };

      const { apiClient } = await import('@/services/api');
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      await expect(authService.login(mockCredentials)).rejects.toThrow(
        'Invalid credentials'
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
        role: 'owner',
        acceptsTerms: true,
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

      const { apiClient } = await import('@/services/api');
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await authService.register(mockRegisterData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/register',
        mockRegisterData
      );
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should throw error for existing email', async () => {
      const mockRegisterData: RegisterRequest = {
        email: 'owner@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'Duplicate',
        lastName: 'User',
        role: 'owner',
        acceptsTerms: true,
      };

      const mockResponse = {
        data: {
          success: false,
          message: 'An account with this email already exists',
        },
      };

      const { apiClient } = await import('@/services/api');
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      await expect(authService.register(mockRegisterData)).rejects.toThrow(
        'An account with this email already exists'
      );
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh tokens', async () => {
      const mockRefreshToken = 'mock-refresh-token';
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: '1',
              email: 'owner@test.com',
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

      const { apiClient } = await import('@/services/api');
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await authService.refreshToken(mockRefreshToken);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: mockRefreshToken,
      });
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should throw error for invalid refresh token', async () => {
      const mockRefreshToken = 'invalid-token';
      const mockResponse = {
        data: {
          success: false,
          message: 'Invalid or expired refresh token',
        },
      };

      const { apiClient } = await import('@/services/api');
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      await expect(authService.refreshToken(mockRefreshToken)).rejects.toThrow(
        'Invalid or expired refresh token'
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: null,
          message: 'Logged out successfully',
        },
      };

      const { apiClient } = await import('@/services/api');
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      await expect(authService.logout()).resolves.not.toThrow();
      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('forgotPassword', () => {
    it('should successfully send password reset email', async () => {
      const email = 'owner@test.com';
      const mockResponse = {
        data: {
          success: true,
          data: null,
          message: 'Password reset link sent to your email',
        },
      };

      const { apiClient } = await import('@/services/api');
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      await expect(authService.forgotPassword(email)).resolves.not.toThrow();
      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email,
      });
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
        data: {
          success: true,
          data: mockUser,
        },
      };

      const { apiClient } = await import('@/services/api');
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await authService.getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith('/users/profile');
      expect(result).toEqual(mockUser);
    });
  });
});

// src/services/auth/__tests__/tokenService.test.ts
describe('TokenService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('setTokens and getTokens', () => {
    it('should store and retrieve tokens correctly', () => {
      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        tokenType: 'Bearer' as const,
      };

      TokenService.setTokens(mockTokens);

      expect(TokenService.getAccessToken()).toBe(mockTokens.accessToken);
      expect(TokenService.getRefreshToken()).toBe(mockTokens.refreshToken);
    });
  });

  describe('clearTokens', () => {
    it('should remove all stored tokens', () => {
      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        tokenType: 'Bearer' as const,
      };

      TokenService.setTokens(mockTokens);
      TokenService.clearTokens();

      expect(TokenService.getAccessToken()).toBeNull();
      expect(TokenService.getRefreshToken()).toBeNull();
    });
  });

  describe('hasValidTokens', () => {
    it('should return true when both tokens exist', () => {
      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        tokenType: 'Bearer' as const,
      };

      TokenService.setTokens(mockTokens);

      expect(TokenService.hasValidTokens()).toBe(true);
    });

    it('should return false when tokens are missing', () => {
      expect(TokenService.hasValidTokens()).toBe(false);
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for future expiration date', () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString();
      expect(TokenService.isTokenExpired(futureDate)).toBe(false);
    });

    it('should return true for past expiration date', () => {
      const pastDate = new Date(Date.now() - 3600000).toISOString();
      expect(TokenService.isTokenExpired(pastDate)).toBe(true);
    });

    it('should return true for invalid date', () => {
      expect(TokenService.isTokenExpired('invalid-date')).toBe(true);
    });

    it('should return true for undefined date', () => {
      expect(TokenService.isTokenExpired(undefined)).toBe(true);
    });
  });
});
