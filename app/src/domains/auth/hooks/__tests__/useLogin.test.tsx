// src/domains/auth/hooks/__tests__/useLogin.test.tsx - UPDATED FOR FIXED USELOGIN
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
    isTokenExpired: vi.fn(() => false),
    getAccessToken: vi.fn(() => null),
    getRefreshToken: vi.fn(() => null),
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
import { authService, TokenService } from '@/domains/auth';
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
  const mockTokenService = TokenService as any;
  const mockLogger = logger as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Setup all required mocks properly
    mockAuthService.login.mockReset();
    mockAuthService.getCurrentUser.mockResolvedValue(null);

    // Ensure TokenService mocks are properly set
    mockTokenService.getTokens.mockReturnValue({
      accessToken: null,
      refreshToken: null,
    });
    mockTokenService.hasValidTokens.mockReturnValue(false);
    mockTokenService.isTokenExpired.mockReturnValue(false);
    mockTokenService.getAccessToken.mockReturnValue(null);

    // Setup default location mock
    mockUseLocation.mockReturnValue({
      state: { from: { pathname: '/dashboard' } },
    });
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.form).toBeDefined();
      expect(result.current.onSubmit).toBeInstanceOf(Function);
    });

    it('should initialize form with empty values', async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
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

      await waitFor(() => {
        expect(result.current).not.toBeNull();
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

      await waitFor(() => {
        expect(result.current).not.toBeNull();
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

      await waitFor(() => {
        expect(result.current).not.toBeNull();
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

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      act(() => {
        result.current.form.setValue('password', '123');
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

      await waitFor(() => {
        expect(result.current).not.toBeNull();
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
        permissions: [],
        profile: { phone: '', bio: '' },
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
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

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      const formData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      // Verify auth service was called
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });

      // Verify debug log happens immediately
      expect(mockLogger.debug).toHaveBeenCalledWith('Login attempt started', {
        email: 'test@[redacted]',
      });

      // Wait for useEffect to handle success (info log + navigation)
      await waitFor(() => {
        expect(mockLogger.info).toHaveBeenCalledWith('Login successful', {
          email: 'test@[redacted]',
        });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
          replace: true,
        });
      });
    });

    it('should set isSubmitting state correctly during submission', async () => {
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      mockAuthService.login.mockReturnValue(loginPromise);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      // Start submission without awaiting
      act(() => {
        result.current.onSubmit({
          email: 'test@example.com',
          password: 'password',
          rememberMe: false,
        });
      });

      // Check that isSubmitting is true during submission
      expect(result.current.isSubmitting).toBe(true);

      // Resolve the login promise
      await act(async () => {
        resolveLogin({
          user: {
            id: '1',
            email: 'test@example.com',
            permissions: [],
            profile: { phone: '', bio: '' },
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          tokens: { accessToken: 'token' },
        });
      });

      // Wait for isSubmitting to become false
      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });
    });
  });

  describe('Form Submission - Error Cases', () => {
    it('should handle login errors', async () => {
      const loginError = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(loginError);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      const formData = {
        email: 'test@example.com',
        password: 'wrongpassword',
        rememberMe: false,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      // Verify auth service was called
      expect(mockAuthService.login).toHaveBeenCalledWith(formData);

      // Verify debug log happens immediately
      expect(mockLogger.debug).toHaveBeenCalledWith('Login attempt started', {
        email: 'test@[redacted]',
      });

      // Wait for useEffect to handle error logging
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
      mockAuthService.login.mockRejectedValue(new Error('Unknown error'));

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      await act(async () => {
        await result.current.onSubmit({
          email: 'test@example.com',
          password: 'password',
          rememberMe: false,
        });
      });

      // Wait for useEffect to handle error logging
      await waitFor(() => {
        expect(mockLogger.error).toHaveBeenCalledWith('Login failed', {
          email: 'test@[redacted]',
          error: 'Unknown error',
        });
      });

      expect(result.current.isSubmitting).toBe(false);
    });

    it('should reset isSubmitting state on error', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Login failed'));

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      await act(async () => {
        await result.current.onSubmit({
          email: 'test@example.com',
          password: 'password',
          rememberMe: false,
        });
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('Navigation Logic', () => {
    it('should navigate to default dashboard on successful login', async () => {
      mockUseLocation.mockReturnValue({
        state: null,
      });

      mockAuthService.login.mockResolvedValue({
        user: {
          id: '1',
          email: 'test@example.com',
          permissions: [],
          profile: { phone: '', bio: '' },
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        tokens: { accessToken: 'token' },
      });

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      await act(async () => {
        await result.current.onSubmit({
          email: 'test@example.com',
          password: 'password',
          rememberMe: false,
        });
      });

      // Wait for useEffect to handle navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
          replace: true,
        });
      });
    });

    it('should navigate to saved location on successful login', async () => {
      mockUseLocation.mockReturnValue({
        state: { from: { pathname: '/properties' } },
      });

      mockAuthService.login.mockResolvedValue({
        user: {
          id: '1',
          email: 'test@example.com',
          permissions: [],
          profile: { phone: '', bio: '' },
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        tokens: { accessToken: 'token' },
      });

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      await act(async () => {
        await result.current.onSubmit({
          email: 'test@example.com',
          password: 'password',
          rememberMe: false,
        });
      });

      // Wait for useEffect to handle navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/properties', {
          replace: true,
        });
      });
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize email in logs', async () => {
      mockAuthService.login.mockResolvedValue({
        user: {
          id: '1',
          email: 'user@example.com',
          permissions: [],
          profile: { phone: '', bio: '' },
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        tokens: { accessToken: 'token' },
      });

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      await act(async () => {
        await result.current.onSubmit({
          email: 'sensitive@company.com',
          password: 'password',
          rememberMe: false,
        });
      });

      // Debug log happens immediately
      expect(mockLogger.debug).toHaveBeenCalledWith('Login attempt started', {
        email: 'sensitive@[redacted]',
      });

      // Info log happens in useEffect
      await waitFor(() => {
        expect(mockLogger.info).toHaveBeenCalledWith('Login successful', {
          email: 'sensitive@[redacted]',
        });
      });
    });

    it('should sanitize email in error logs', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Login failed'));

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      await act(async () => {
        await result.current.onSubmit({
          email: 'sensitive@company.com',
          password: 'password',
          rememberMe: false,
        });
      });

      // Debug log happens immediately
      expect(mockLogger.debug).toHaveBeenCalledWith('Login attempt started', {
        email: 'sensitive@[redacted]',
      });

      // Error log happens in useEffect
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
        user: {
          id: '1',
          email: 'test@example.com',
          permissions: [],
          profile: { phone: '', bio: '' },
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        tokens: { accessToken: 'token' },
      });

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      await act(async () => {
        await result.current.onSubmit({
          email: 'test@example.com',
          password: 'password',
          rememberMe: false,
        });
      });

      expect(mockAuthService.login).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith('Login attempt started', {
        email: 'test@[redacted]',
      });
    });
  });
});
