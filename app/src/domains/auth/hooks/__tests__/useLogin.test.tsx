// src/domains/auth/hooks/__tests__/useLogin.test.tsx

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useLogin } from '../useLogin';
import { useAuth } from '../useAuth';
import type { User } from '@/domains/auth/types';
import type { Permission } from '@/shared/types/global.types';

// Mock dependencies
vi.mock('../useAuth');
vi.mock('@/shared/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { from: { pathname: '/properties' } } }),
  };
});

const mockUseAuth = vi.mocked(useAuth);

const createWrapper = () => {
  return ({ children }: { children: ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );
};

describe('useLogin Unit Tests', () => {
  const mockLogin = vi.fn();
  const mockClearError = vi.fn();
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'owner',
    permissions: ['property:read', 'property:create'] as Permission[],
    profile: { phone: '', bio: '' },
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      clearError: mockClearError,
      error: null,
      isLoading: false,
      isAuthenticated: false,
      user: null,
      permissions: [],
      register: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      changePassword: vi.fn(),
      updateProfile: vi.fn(),
      verifyEmail: vi.fn(),
      resendVerification: vi.fn(),
      hasPermission: vi.fn(),
      hasRole: vi.fn(),
      hasAnyPermission: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Initial State and Setup', () => {
    it('should initialize form with correct default values', () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      expect(result.current.form.getValues()).toEqual({
        email: '',
        password: '',
        rememberMe: false,
      });
    });

    it('should provide working React Hook Form instance', () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.form.register).toBe('function');
      expect(typeof result.current.form.handleSubmit).toBe('function');
      expect(typeof result.current.form.setValue).toBe('function');
      expect(typeof result.current.form.trigger).toBe('function');
      expect(typeof result.current.form.watch).toBe('function');
      expect(typeof result.current.form.getValues).toBe('function');
      expect(result.current.form.formState).toBeDefined();
      expect(result.current.form.formState.isValid).toBe(false);
    });
  });

  describe('2. State Management Side Effects', () => {
    it('should call setIsSubmitting(true) when onSubmit starts', () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      act(() => {
        result.current.onSubmit(formData);
      });

      expect(result.current.isSubmitting).toBe(true);
    });

    it('should set lastLoginAttempt correctly with email and timestamp', async () => {
      mockLogin.mockResolvedValue({});
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    it('should update isSubmitting state properly during async operations', async () => {
      let resolveLogin: (value: unknown) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      mockLogin.mockReturnValue(loginPromise);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      let submitPromise: Promise<void>;
      act(() => {
        submitPromise = result.current.onSubmit(formData);
      });

      await waitFor(() => expect(result.current.isSubmitting).toBe(true));

      act(() => {
        resolveLogin({ user: {}, tokens: {} });
      });

      await submitPromise;

      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
    });

    it('should prevent concurrent submissions', async () => {
      let resolveLogin: (value: unknown) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      mockLogin.mockReturnValue(loginPromise);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      act(() => {
        result.current.onSubmit(formData);
      });

      await waitFor(() => expect(result.current.isSubmitting).toBe(true));

      act(() => {
        result.current.onSubmit(formData);
      });

      expect(mockLogin).toHaveBeenCalledTimes(1);

      act(() => {
        resolveLogin({ user: {}, tokens: {} });
      });

      await loginPromise;

      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
    });
  });

  describe('3. useEffect Dependency Chain', () => {
    it('should trigger useEffect when lastLoginAttempt changes', async () => {
      mockLogin.mockResolvedValue({});
      const { result, rerender } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      mockUseAuth.mockReturnValue({
        ...mockUseAuth.mock.results[0].value,
        isAuthenticated: true,
        user: mockUser,
      });

      rerender();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/properties', {
          replace: true,
        });
      });
    });

    it('should exit early when lastLoginAttempt is null', () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should exit early when isLoading is true', async () => {
      mockUseAuth.mockReturnValue({
        ...mockUseAuth.mock.results[0].value,
        isLoading: true,
      });

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should trigger navigation on success path: isAuthenticated && !error', async () => {
      mockLogin.mockResolvedValue({});
      const { result, rerender } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      mockUseAuth.mockReturnValue({
        ...mockUseAuth.mock.results[0].value,
        isAuthenticated: true,
        user: mockUser,
      });

      rerender();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/properties', {
          replace: true,
        });
      });
    });

    it('should handle error path via useAuth: error && !isLoading', async () => {
      mockLogin.mockResolvedValue({});
      const { logger } = await import('@/shared/utils/logger');
      const { result, rerender } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      mockUseAuth.mockReturnValue({
        ...mockUseAuth.mock.results[0].value,
        error: 'Invalid credentials',
        isLoading: false,
      });

      rerender();

      await waitFor(() => {
        expect(result.current.error).toBe('Invalid credentials');
        expect(logger.error).toHaveBeenCalledWith('Login failed', {
          email: 'test@[redacted]',
          error: 'Invalid credentials',
        });
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('should clear stale login attempt after timeout', async () => {
      vi.useFakeTimers();
      const { logger } = await import('@/shared/utils/logger');

      const { result } = renderHook(() => useLogin({ loginTimeout: 1000 }), {
        wrapper: createWrapper(),
      });

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(logger.warn).toHaveBeenCalledWith(
          'Cleared stale login attempt',
          {
            email: 'test@[redacted]',
          }
        );
        expect(mockNavigate).not.toHaveBeenCalled();
      });

      vi.useRealTimers();
    });
  });

  describe('4. Schema Validation Integration', () => {
    it('should validate LoginSchema with actual component form data', async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.form.setValue('email', 'invalid-email');
      });

      await act(async () => {
        await result.current.form.trigger('email');
      });

      await waitFor(() => {
        const errors = result.current.form.formState.errors;
        expect(errors.email?.message).toBe(
          'Please enter a valid email address'
        );
      });

      act(() => {
        result.current.form.setValue('email', 'test@example.com');
        result.current.form.setValue('password', '');
      });

      await act(async () => {
        await result.current.form.trigger();
      });

      await waitFor(() => {
        const errors = result.current.form.formState.errors;
        expect(errors.password?.message).toBe('Password is required.');
      });

      act(() => {
        result.current.form.setValue('password', 'password123');
      });

      await act(async () => {
        await result.current.form.trigger();
      });

      await waitFor(() => {
        const errors = result.current.form.formState.errors;
        expect(Object.keys(errors)).toHaveLength(0);
        expect(result.current.form.formState.isValid).toBe(true);
      });
    });

    it('should handle edge cases in email validation', async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.form.setValue('email', '');
      });

      await act(async () => {
        await result.current.form.trigger('email');
      });

      await waitFor(() => {
        const errors = result.current.form.formState.errors;
        expect(errors.email?.message).toBe('Email is required.');
      });

      act(() => {
        result.current.form.setValue('email', undefined as any);
      });

      await act(async () => {
        await result.current.form.trigger('email');
      });

      await waitFor(() => {
        const errors = result.current.form.formState.errors;
        expect(errors.email).toBeDefined();
      });

      act(() => {
        result.current.form.setValue('email', 'user@example.com');
      });

      await act(async () => {
        await result.current.form.trigger('email');
      });

      await waitFor(() => {
        const errors = result.current.form.formState.errors;
        expect(errors.email).toBeUndefined();
      });
    });

    it('should handle password validation edge cases', async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.form.setValue('password', '');
      });

      await act(async () => {
        await result.current.form.trigger('password');
      });

      await waitFor(() => {
        const errors = result.current.form.formState.errors;
        expect(errors.password?.message).toBe('Password is required.');
      });

      act(() => {
        result.current.form.setValue('password', 'a');
      });

      await act(async () => {
        await result.current.form.trigger('password');
      });

      await waitFor(() => {
        const errors = result.current.form.formState.errors;
        expect(errors.password).toBeUndefined();
      });

      act(() => {
        result.current.form.setValue('password', 'a'.repeat(200));
      });

      await act(async () => {
        await result.current.form.trigger('password');
      });

      await waitFor(() => {
        const errors = result.current.form.formState.errors;
        expect(errors.password).toBeUndefined();
      });
    });
  });

  describe('5. Mock Boundary Verification', () => {
    it('should verify that mocked useAuth is being used correctly', async () => {
      mockLogin.mockResolvedValue({});
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(mockClearError).toHaveBeenCalledWith();
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      });
    });

    it('should test hook behavior with different mock return values', () => {
      mockUseAuth.mockReturnValue({
        ...mockUseAuth.mock.results[0].value,
        isLoading: true,
      });

      const { result, rerender } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isSubmitting).toBe(false);

      mockUseAuth.mockReturnValue({
        ...mockUseAuth.mock.results[0].value,
        error: 'Network error',
        isLoading: false,
      });

      rerender();

      expect(result.current.error).toBe('Network error');
      expect(mockUseAuth).toHaveBeenCalled();
    });

    it('should verify mock function call patterns', async () => {
      mockLogin.mockResolvedValue({});
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formData1 = {
        email: 'user1@example.com',
        password: 'password1',
        rememberMe: false,
      };

      const formData2 = {
        email: 'user2@example.com',
        password: 'password2',
        rememberMe: true,
      };

      await act(async () => {
        await result.current.onSubmit(formData1);
      });

      await act(async () => {
        await result.current.onSubmit(formData2);
      });

      expect(mockLogin).toHaveBeenNthCalledWith(1, formData1);
      expect(mockLogin).toHaveBeenNthCalledWith(2, formData2);
      expect(mockClearError).toHaveBeenCalledTimes(2);
    });

    it('should call clearError before login', async () => {
      mockLogin.mockResolvedValue({});
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      const clearErrorCall = mockClearError.mock.invocationCallOrder[0];
      const loginCall = mockLogin.mock.invocationCallOrder[0];
      expect(clearErrorCall).toBeLessThan(loginCall);
    });

    it('should handle undefined rememberMe', async () => {
      mockLogin.mockResolvedValue({});
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: undefined as any,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });
    });
  });

  describe('6. Error Boundary Cases', () => {
    it('should rely on useAuth for authenticator errors', async () => {
      mockLogin.mockResolvedValue({});
      const { logger } = await import('@/shared/utils/logger');
      const { result, rerender } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      mockUseAuth.mockReturnValue({
        ...mockUseAuth.mock.results[0].value,
        error: 'Invalid credentials',
        isLoading: false,
      });

      rerender();

      await waitFor(() => {
        expect(result.current.error).toBe('Invalid credentials');
        expect(logger.error).toHaveBeenCalledWith('Login failed', {
          email: 'test@[redacted]',
          error: 'Invalid credentials',
        });
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('should log unexpected errors without interfering with useAuth errors', async () => {
      const { logger } = await import('@/shared/utils/logger');
      const unexpectedError = new Error('Unexpected network error');
      mockLogin.mockImplementation(() => {
        throw unexpectedError;
      });

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      await act(async () => {
        await expect(
          result.current.onSubmit(formData)
        ).resolves.toBeUndefined();
      });

      expect(logger.error).toHaveBeenCalledWith('Unexpected login error', {
        error: 'Unexpected network error',
      });
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should recover from network errors during submission', async () => {
      mockLogin
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce({ user: {}, tokens: {} });

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(result.current.isSubmitting).toBe(false);

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(mockLogin).toHaveBeenCalledTimes(2);
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle malformed responses gracefully', async () => {
      mockLogin.mockResolvedValue(null);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('7. Form State Integration', () => {
    it('should maintain form state consistency', async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.form.setValue('email', 'test@example.com');
        result.current.form.setValue('password', 'password123');
        result.current.form.setValue('rememberMe', true);
      });

      expect(result.current.form.getValues('email')).toBe('test@example.com');
      expect(result.current.form.getValues('password')).toBe('password123');
      expect(result.current.form.getValues('rememberMe')).toBe(true);

      await act(async () => {
        await result.current.form.trigger();
      });

      await waitFor(() => {
        expect(result.current.form.formState.isValid).toBe(true);
      });
    });

    it('should handle form reset correctly', async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.form.setValue('email', 'test@example.com');
        result.current.form.setValue('password', 'password123');
      });

      act(() => {
        result.current.form.reset();
      });

      expect(result.current.form.getValues('email')).toBe('');
      expect(result.current.form.getValues('password')).toBe('');
      expect(result.current.form.getValues('rememberMe')).toBe(false);
    });
  });

  describe('8. Navigation Integration', () => {
    it('should navigate to correct route from location state', async () => {
      mockLogin.mockResolvedValue({});
      const { result, rerender } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      mockUseAuth.mockReturnValue({
        ...mockUseAuth.mock.results[0].value,
        isAuthenticated: true,
        user: mockUser,
      });

      rerender();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/properties', {
          replace: true,
        });
      });
    });

    it('should use configured default redirect when no location state', async () => {
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate,
          useLocation: () => ({ state: null }),
        };
      });

      mockLogin.mockResolvedValue({});
      const { result, rerender } = renderHook(
        () => useLogin({ defaultRedirect: '/custom' }),
        {
          wrapper: createWrapper(),
        }
      );

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      mockUseAuth.mockReturnValue({
        ...mockUseAuth.mock.results[0].value,
        isAuthenticated: true,
        user: mockUser,
      });

      rerender();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/custom', { replace: true });
      });
    });

    it('should handle malformed location.state', async () => {
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate,
          useLocation: () => ({ state: { from: null } }),
        };
      });

      mockLogin.mockResolvedValue({});
      const { result, rerender } = renderHook(
        () => useLogin({ defaultRedirect: '/custom' }),
        {
          wrapper: createWrapper(),
        }
      );

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      mockUseAuth.mockReturnValue({
        ...mockUseAuth.mock.results[0].value,
        isAuthenticated: true,
        user: mockUser,
      });

      rerender();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/custom', { replace: true });
      });
    });
  });

  describe('9. Logger Integration', () => {
    it('should log appropriate messages during login flow', async () => {
      mockLogin.mockResolvedValue({});
      const { logger } = await import('@/shared/utils/logger');

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(logger.debug).toHaveBeenCalledWith('Login attempt started', {
        email: 'test@[redacted]',
      });
    });

    it('should log success and error states correctly', async () => {
      mockLogin.mockResolvedValue({});
      const { logger } = await import('@/shared/utils/logger');

      const { result, rerender } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      mockUseAuth.mockReturnValue({
        ...mockUseAuth.mock.results[0].value,
        isAuthenticated: true,
        user: mockUser,
      });

      rerender();

      await waitFor(() => {
        expect(logger.info).toHaveBeenCalledWith('Login successful', {
          email: 'test@[redacted]',
        });
      });
    });
  });
});
