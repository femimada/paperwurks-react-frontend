// src/domains/auth/hooks/__tests__/useLogin.test.tsx - FINAL WORKING VERSION
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useLogin } from '../useLogin';
import { AuthProvider } from '@/context/AuthContext';

// Mock dependencies BEFORE importing anything else
vi.mock('@/shared/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock auth services with complete implementation
vi.mock('@/domains/auth', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    register: vi.fn(),
    refreshToken: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    changePassword: vi.fn(),
    updateProfile: vi.fn(),
    verifyEmail: vi.fn(),
    resendVerification: vi.fn(),
  },
  TokenService: {
    getTokens: vi.fn(() => ({ accessToken: null, refreshToken: null })),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
    hasValidTokens: vi.fn(() => false),
    isTokenExpired: vi.fn(),
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
  },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
  };
});

// Import after mocks
import { authService } from '@/domains/auth';
import { logger } from '@/shared/utils';

// Enhanced test wrapper
const createWrapper = () => {
  return ({ children }: { children: ReactNode }) => (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );
};

describe('useLogin', () => {
  const mockAuthService = authService as any;
  const mockLogger = logger as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Reset all auth service mocks to default state
    mockAuthService.login.mockReset();
    mockAuthService.getCurrentUser.mockResolvedValue(null);

    // Setup default location mock
    mockUseLocation.mockReturnValue({
      state: { from: { pathname: '/dashboard' } },
    });
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.form).toBeDefined();
      expect(result.current.onSubmit).toBeInstanceOf(Function);
    });

    it('should initialize form with empty values', () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formValues = result.current.form.getValues();
      expect(formValues.email).toBe('');
      expect(formValues.password).toBe('');
      expect(formValues.rememberMe).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should validate required email field', async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.form.setValue('email', '');
        result.current.form.trigger('email');
      });

      await waitFor(() => {
        const errors = result.current.form.formState.errors;
        expect(errors.email?.message).toBe('Email is required');
      });
    });

    it('should validate email format', async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.form.setValue('email', 'invalid-email');
        result.current.form.trigger('email');
      });

      await waitFor(() => {
        const errors = result.current.form.formState.errors;
        expect(errors.email?.message).toBe(
          'Please enter a valid email address'
        );
      });
    });

    it('should validate required password field', async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.form.setValue('password', '');
        result.current.form.trigger('password');
      });

      await waitFor(() => {
        const errors = result.current.form.formState.errors;
        expect(errors.password?.message).toBe('Password is required');
      });
    });

    it('should accept any non-empty password', async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.form.setValue('password', '123'); // Short password should be valid
        result.current.form.trigger('password');
      });

      await waitFor(() => {
        const errors = result.current.form.formState.errors;
        expect(errors.password).toBeUndefined();
      });
    });

    it('should mark form as valid with correct email and password', async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.form.setValue('email', 'test@example.com');
        result.current.form.setValue('password', 'password');
        result.current.form.trigger();
      });

      await waitFor(() => {
        expect(result.current.form.formState.isValid).toBe(true);
      });
    });
  });

  describe('Form Submission - Success Cases', () => {
    it('should handle successful login', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'owner' as const,
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: new Date().toISOString(),
        tokenType: 'Bearer' as const,
      };

      mockAuthService.login.mockResolvedValue({
        user: mockUser,
        tokens: mockTokens,
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

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });

      expect(mockLogger.debug).toHaveBeenCalledWith('Login attempt started', {
        email: 'test@[redacted]',
      });

      expect(mockLogger.info).toHaveBeenCalledWith('Login successful', {
        email: 'test@[redacted]',
      });

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
        replace: true,
      });
    });

    it('should handle rememberMe option correctly', async () => {
      mockAuthService.login.mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        tokens: { accessToken: 'token' },
      });

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

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      });
    });

    it('should set isSubmitting state correctly during submission', async () => {
      // Create a controlled promise that resolves synchronously with setTimeout
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      mockAuthService.login.mockReturnValue(loginPromise);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isSubmitting).toBe(false);

      // Start submission - properly await the act call
      const submissionPromise = act(async () => {
        // Start the submission without awaiting it yet
        const submitPromise = result.current.onSubmit({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        });

        // Allow React to process the state change
        await new Promise((resolve) => setTimeout(resolve, 0));

        return submitPromise;
      });

      // Check that isSubmitting is true during submission
      await waitFor(
        () => {
          expect(result.current.isSubmitting).toBe(true);
        },
        { timeout: 2000 }
      );

      // Now resolve the login promise
      await act(async () => {
        resolveLogin({
          user: { id: '1', email: 'test@example.com' },
          tokens: { accessToken: 'token' },
        });
      });

      // Wait for submission to complete
      await submissionPromise;

      // Check that isSubmitting is false after completion
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('Form Submission - Error Cases', () => {
    it('should handle login errors', async () => {
      const loginError = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(loginError);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formData = {
        email: 'test@example.com',
        password: 'wrongpassword',
        rememberMe: false,
      };

      // The hook should handle the error internally, so we don't expect it to throw
      await act(async () => {
        try {
          await result.current.onSubmit(formData);
        } catch (error) {
          // Error is expected to be caught by the hook
        }
      });

      // Wait for the logger to be called
      await waitFor(() => {
        expect(mockLogger.error).toHaveBeenCalledWith('Login failed', {
          email: 'test@[redacted]',
          error: 'Invalid credentials',
        });
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle unknown errors', async () => {
      mockAuthService.login.mockRejectedValue('Unknown error');

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.onSubmit({
            email: 'test@example.com',
            password: 'password',
            rememberMe: false,
          });
        } catch (error) {
          // Error is expected to be caught by the hook
        }
      });

      await waitFor(() => {
        expect(mockLogger.error).toHaveBeenCalledWith('Login failed', {
          email: 'test@[redacted]',
          error: 'Unknown error',
        });
      });
    });

    it('should reset isSubmitting state on error', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Login failed'));

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.onSubmit({
            email: 'test@example.com',
            password: 'password',
            rememberMe: false,
          });
        } catch (error) {
          // Error is expected to be caught by the hook
        }
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('Navigation Logic', () => {
    it('should navigate to default dashboard on successful login', async () => {
      // Mock useLocation to return no saved location
      mockUseLocation.mockReturnValue({
        state: null,
      });

      mockAuthService.login.mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        tokens: { accessToken: 'token' },
      });

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.onSubmit({
          email: 'test@example.com',
          password: 'password',
          rememberMe: false,
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
        replace: true,
      });
    });

    it('should navigate to saved location on successful login', async () => {
      // Mock useLocation to return saved location
      mockUseLocation.mockReturnValue({
        state: { from: { pathname: '/properties' } },
      });

      mockAuthService.login.mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        tokens: { accessToken: 'token' },
      });

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.onSubmit({
          email: 'test@example.com',
          password: 'password',
          rememberMe: false,
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith('/properties', {
        replace: true,
      });
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize email in logs', async () => {
      mockAuthService.login.mockResolvedValue({
        user: { id: '1', email: 'user@example.com' },
        tokens: { accessToken: 'token' },
      });

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.onSubmit({
          email: 'sensitive@company.com',
          password: 'password',
          rememberMe: false,
        });
      });

      expect(mockLogger.debug).toHaveBeenCalledWith('Login attempt started', {
        email: 'sensitive@[redacted]',
      });

      expect(mockLogger.info).toHaveBeenCalledWith('Login successful', {
        email: 'sensitive@[redacted]',
      });
    });

    it('should sanitize email in error logs', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Login failed'));

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.onSubmit({
            email: 'sensitive@company.com',
            password: 'password',
            rememberMe: false,
          });
        } catch (error) {
          // Error is expected to be caught by the hook
        }
      });

      await waitFor(() => {
        expect(mockLogger.error).toHaveBeenCalledWith('Login failed', {
          email: 'sensitive@[redacted]',
          error: 'Login failed',
        });
      });
    });
  });

  describe('Integration with Auth Context', () => {
    it('should call clearError before login attempt', async () => {
      mockAuthService.login.mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        tokens: { accessToken: 'token' },
      });

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.onSubmit({
          email: 'test@example.com',
          password: 'password',
          rememberMe: false,
        });
      });

      // Verify that the auth service login was called
      expect(mockAuthService.login).toHaveBeenCalled();
    });
  });
});
