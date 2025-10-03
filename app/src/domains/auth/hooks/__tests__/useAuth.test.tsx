// src/domains/auth/hooks/__tests__/useAuth.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { AuthContext } from '@/context/AuthContext';
import type { AuthContextType } from '@/context/AuthContext';
import type { ReactNode } from 'react';
import type { Permission } from '@/shared/types/global.types';

// Mock AuthContext value
const createMockAuthContext = (
  overrides: Partial<AuthContextType> = {}
): AuthContextType => ({
  user: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  changePassword: vi.fn(),
  updateProfile: vi.fn(),
  verifyEmail: vi.fn(),
  resendVerification: vi.fn(),
  clearError: vi.fn(),
  hasPermission: vi.fn(),
  hasRole: vi.fn(),
  hasAnyPermission: vi.fn(),
  ...overrides,
});

// Test wrapper that provides AuthContext
const createWrapper = (contextValue: AuthContextType) => {
  return ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

describe('useAuth', () => {
  describe('Context Access', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Spy on console.error to suppress the error log in test output
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });

    it('should return auth context when used within AuthProvider', () => {
      const mockContext = createMockAuthContext({
        isAuthenticated: true,
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'owner',
          permissions: ['property:read'] as Permission[],
          profile: { phone: '', bio: '' },
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockContext),
      });

      expect(result.current).toBe(mockContext);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe('test@example.com');
    });
  });

  describe('Authentication State', () => {
    it('should provide correct unauthenticated state', () => {
      const mockContext = createMockAuthContext({
        isAuthenticated: false,
        user: null,
        permissions: [],
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockContext),
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.permissions).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide correct authenticated state', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'agent' as const,
        permissions: ['property:read', 'property:create'] as Permission[],
        profile: { phone: '+1234567890', bio: 'Test bio' },
        isEmailVerified: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const mockContext = createMockAuthContext({
        isAuthenticated: true,
        user: mockUser,
        permissions: ['property:read', 'property:create'] as Permission[],
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockContext),
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.permissions).toEqual([
        'property:read',
        'property:create',
      ]);
    });

    it('should provide loading state', () => {
      const mockContext = createMockAuthContext({
        isAuthenticated: false,
        user: null,
        isLoading: true,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockContext),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should provide error state', () => {
      const mockContext = createMockAuthContext({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: 'Invalid credentials',
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockContext),
      });

      expect(result.current.error).toBe('Invalid credentials');
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Authentication Actions', () => {
    it('should provide all required authentication functions', () => {
      const mockLogin = vi.fn();
      const mockRegister = vi.fn();
      const mockLogout = vi.fn();
      const mockRefreshToken = vi.fn();
      const mockForgotPassword = vi.fn();
      const mockResetPassword = vi.fn();
      const mockChangePassword = vi.fn();
      const mockUpdateProfile = vi.fn();
      const mockVerifyEmail = vi.fn();
      const mockResendVerification = vi.fn();
      const mockClearError = vi.fn();

      const mockContext = createMockAuthContext({
        login: mockLogin,
        register: mockRegister,
        logout: mockLogout,
        refreshToken: mockRefreshToken,
        forgotPassword: mockForgotPassword,
        resetPassword: mockResetPassword,
        changePassword: mockChangePassword,
        updateProfile: mockUpdateProfile,
        verifyEmail: mockVerifyEmail,
        resendVerification: mockResendVerification,
        clearError: mockClearError,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockContext),
      });

      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.register).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.refreshToken).toBe('function');
      expect(typeof result.current.forgotPassword).toBe('function');
      expect(typeof result.current.resetPassword).toBe('function');
      expect(typeof result.current.changePassword).toBe('function');
      expect(typeof result.current.updateProfile).toBe('function');
      expect(typeof result.current.verifyEmail).toBe('function');
      expect(typeof result.current.resendVerification).toBe('function');
      expect(typeof result.current.clearError).toBe('function');

      expect(result.current.login).toBe(mockLogin);
      expect(result.current.register).toBe(mockRegister);
      expect(result.current.logout).toBe(mockLogout);
    });
  });

  describe('Permission Functions', () => {
    it('should provide permission checking functions', () => {
      const mockHasPermission = vi.fn();
      const mockHasRole = vi.fn();
      const mockHasAnyPermission = vi.fn();

      const mockContext = createMockAuthContext({
        hasPermission: mockHasPermission,
        hasRole: mockHasRole,
        hasAnyPermission: mockHasAnyPermission,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockContext),
      });

      expect(typeof result.current.hasPermission).toBe('function');
      expect(typeof result.current.hasRole).toBe('function');
      expect(typeof result.current.hasAnyPermission).toBe('function');

      expect(result.current.hasPermission).toBe(mockHasPermission);
      expect(result.current.hasRole).toBe(mockHasRole);
      expect(result.current.hasAnyPermission).toBe(mockHasAnyPermission);
    });
  });

  describe('Hook Stability', () => {
    it('should return stable reference when context does not change', () => {
      const mockContext = createMockAuthContext();

      const { result, rerender } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockContext),
      });

      const firstResult = result.current;

      rerender();

      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });
  });
});
