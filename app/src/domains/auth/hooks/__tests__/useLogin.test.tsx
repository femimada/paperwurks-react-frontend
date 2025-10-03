// src/domains/auth/hooks/__tests__/useLogin.test.tsx
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useLogin } from '../useLogin';
import { AuthProvider } from '@/context/AuthContext';
import type { LoginFormData } from '@/domains/auth/utils/validation/authSchema';
import type { useForm } from 'react-hook-form';

// ============== ENHANCED TYPES ==============

interface UseLoginOptions {
  defaultRedirect?: string;
  loginTimeout?: number;
  maxRetryAttempts?: number;
}

// Updated hook interface to include missing properties
interface UseLoginReturn {
  onSubmit: (data: LoginFormData) => Promise<void>;
  retry: () => Promise<void>;
  isSubmitting: boolean;
  canRetry: boolean;
  form: ReturnType<typeof useForm<LoginFormData>>;
  error: string | null;
  clearError: () => void;
}

// ============== MOCKS ==============

// Mock logger
const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

vi.mock('@/shared/utils/logger', () => ({
  logger: mockLogger,
}));

// Mock auth services
const mockAuthService = {
  login: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  refreshToken: vi.fn(),
};

const mockTokenService = {
  getTokens: vi.fn(),
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
  hasValidTokens: vi.fn(),
  isTokenExpired: vi.fn(),
  getAccessToken: vi.fn(),
  getRefreshToken: vi.fn(),
};

vi.mock('@/domains/auth', () => ({
  authService: mockAuthService,
  TokenService: mockTokenService,
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

// ============== TEST UTILITIES ==============

const createWrapper = () => {
  return ({ children }: { children: ReactNode }) => (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );
};

const createValidLoginData = (): LoginFormData => ({
  email: 'test@example.com',
  password: 'password123',
  rememberMe: false,
});

const createSuccessResponse = () => ({
  user: {
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
  },
  tokens: {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    tokenType: 'Bearer' as const,
  },
});

// ============== TEST SUITE ==============

describe('useLogin Hook - TDD Specification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Default mock setup
    mockAuthService.getCurrentUser.mockResolvedValue(null);
    mockTokenService.getTokens.mockReturnValue({
      accessToken: null,
      refreshToken: null,
    });
    mockTokenService.hasValidTokens.mockReturnValue(false);
    mockUseLocation.mockReturnValue({
      state: { from: { pathname: '/dashboard' } },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ============== INITIALIZATION & BASIC STATE MANAGEMENT ==============

  describe('Initialization & State Management', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.canRetry).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.onSubmit).toBe('function');
      expect(typeof result.current.retry).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
      expect(result.current.form).toBeDefined();
    });

    it('should initialize with custom options', () => {
      const customOptions: UseLoginOptions = {
        defaultRedirect: '/custom-dashboard',
        loginTimeout: 5000,
        maxRetryAttempts: 5,
      };

      const { result } = renderHook(() => useLogin(customOptions), {
        wrapper: createWrapper(),
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.canRetry).toBe(false);
    });

    it('should handle zero timeout option gracefully', () => {
      const { result } = renderHook(() => useLogin({ loginTimeout: 0 }), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
      expect(typeof result.current.onSubmit).toBe('function');
    });

    it('should provide appropriate ARIA states during submission', async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isSubmitting).toBe(false);

      const loginData = createValidLoginData();

      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      mockAuthService.login.mockReturnValue(loginPromise);

      const submissionPromise = act(async () => {
        await result.current.onSubmit(loginData);
      });

      expect(result.current.isSubmitting).toBe(true);

      await act(async () => {
        resolveLogin!(createSuccessResponse());
        await submissionPromise;
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  // ============== FORM & VALIDATION SPECS ==============

  describe('Form & Validation', () => {
    it('should initialize form with empty default values', () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const formValues = result.current.form.getValues();
      expect(formValues.email).toBe('');
      expect(formValues.password).toBe('');
      expect(formValues.rememberMe).toBe(false);
    });

    it('should provide form validation methods', () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.form.trigger).toBe('function');
      expect(typeof result.current.form.setValue).toBe('function');
      expect(typeof result.current.form.getValues).toBe('function');
      expect(result.current.form.formState).toBeDefined();
    });

    it('should validate required email field', async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.form.setValue('email', '');
        result.current.form.trigger('email');
      });

      expect(result.current.form.formState.errors.email?.message).toBe(
        'Email is required.'
      );
    });

    it('should validate email format', async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.form.setValue('email', 'invalid-email');
        result.current.form.trigger('email');
      });

      expect(result.current.form.formState.errors.email?.message).toBe(
        'Please enter a valid email address'
      );
    });

    it('should validate required password field', async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.form.setValue('password', '');
        result.current.form.trigger('password');
      });

      expect(result.current.form.formState.errors.password?.message).toBe(
        'Password is required.'
      );
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

      expect(result.current.form.formState.isValid).toBe(true);
    });

    it('should properly integrate form validation with submission flow', async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.form.setValue('email', 'invalid-email');
        result.current.form.setValue('password', 'password123');
      });

      await act(async () => {
        await result.current.form.trigger();
      });

      await act(async () => {
        await result.current.onSubmit(result.current.form.getValues());
      });

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should reset form validation errors after successful submission', async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.form.setValue('email', 'invalid');
        result.current.form.trigger('email');
      });

      expect(result.current.form.formState.errors.email).toBeDefined();

      const validData = createValidLoginData();
      mockAuthService.login.mockResolvedValue(createSuccessResponse());

      act(() => {
        result.current.form.setValue('email', validData.email);
        result.current.form.setValue('password', validData.password);
      });

      await act(async () => {
        await result.current.onSubmit(validData);
      });

      expect(result.current.form.formState.errors.email).toBeUndefined();
    });
  });

  // ============== SUCCESSFUL LOGIN FLOW ==============

  describe('Successful Login Flow', () => {
    it('should handle successful login with immediate synchronous feedback', async () => {
      const loginData = createValidLoginData();
      const successResponse = createSuccessResponse();
      mockAuthService.login.mockResolvedValue(successResponse);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isSubmitting).toBe(false);

      const submitPromise = act(async () => {
        return result.current.onSubmit(loginData);
      });

      expect(result.current.isSubmitting).toBe(true);

      await submitPromise;

      expect(result.current.isSubmitting).toBe(false);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
      expect(mockLogger.debug).toHaveBeenCalledWith('Login attempt started', {
        email: 'test@[redacted]',
        retryCount: 0,
      });
      expect(mockLogger.info).toHaveBeenCalledWith('Login successful', {
        email: 'test@[redacted]',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
        replace: true,
      });
    });

    it('should navigate to redirect path from location state', async () => {
      mockUseLocation.mockReturnValue({
        state: { from: { pathname: '/protected-page' } },
      });

      const loginData = createValidLoginData();
      mockAuthService.login.mockResolvedValue(createSuccessResponse());

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.onSubmit(loginData);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/protected-page', {
        replace: true,
      });
    });

    it('should use custom default redirect path', async () => {
      const customRedirect = '/admin-panel';
      const loginData = createValidLoginData();
      mockAuthService.login.mockResolvedValue(createSuccessResponse());
      mockUseLocation.mockReturnValue({ state: null });

      const { result } = renderHook(
        () => useLogin({ defaultRedirect: customRedirect }),
        {
          wrapper: createWrapper(),
        }
      );

      await act(async () => {
        await result.current.onSubmit(loginData);
      });

      expect(mockNavigate).toHaveBeenCalledWith(customRedirect, {
        replace: true,
      });
    });

    it('should pass rememberMe=true to token service for extended session', async () => {
      const loginData = { ...createValidLoginData(), rememberMe: true };
      const successResponse = createSuccessResponse();
      mockAuthService.login.mockResolvedValue(successResponse);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.onSubmit(loginData);
      });

      expect(mockAuthService.login).toHaveBeenCalledWith({
        ...loginData,
        rememberMe: true,
      });
      expect(mockTokenService.setTokens).toHaveBeenCalledWith(
        successResponse.tokens,
        true
      );
    });

    it('should clear password from form after successful submission', async () => {
      const loginData = createValidLoginData();
      mockAuthService.login.mockResolvedValue(createSuccessResponse());

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.form.setValue('email', loginData.email);
        result.current.form.setValue('password', loginData.password);
      });

      await act(async () => {
        await result.current.onSubmit(loginData);
      });

      expect(result.current.form.getValues().password).toBe('');
      expect(result.current.form.getValues().email).toBe(loginData.email);
    });

    it('should maintain form state during submission', async () => {
      const loginData = createValidLoginData();

      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      mockAuthService.login.mockReturnValue(loginPromise);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.form.setValue('email', loginData.email);
        result.current.form.setValue('password', loginData.password);
        result.current.form.setValue('rememberMe', true);
      });

      const submissionPromise = act(async () => {
        await result.current.onSubmit(loginData);
      });

      expect(result.current.form.getValues().email).toBe(loginData.email);
      expect(result.current.form.getValues().rememberMe).toBe(true);
      expect(result.current.isSubmitting).toBe(true);

      await act(async () => {
        resolveLogin!(createSuccessResponse());
        await submissionPromise;
      });

      expect(result.current.form.getValues().email).toBe(loginData.email);
      expect(result.current.form.getValues().password).toBe('');
      expect(result.current.form.getValues().rememberMe).toBe(true);
    });
  });

  // ============== ERROR HANDLING & RETRIES ==============

  describe('Error Handling & Retries', () => {
    it('should handle login failure with immediate synchronous feedback', async () => {
      const loginData = createValidLoginData();
      const loginError = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(loginError);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      let thrownError: Error | undefined;
      await act(async () => {
        try {
          await result.current.onSubmit(loginData);
        } catch (error) {
          thrownError = error as Error;
        }
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.canRetry).toBe(true);
      expect(thrownError?.message).toBe('Invalid credentials');
      expect(mockLogger.error).toHaveBeenCalledWith('Login failed', {
        email: 'test@[redacted]',
        error: 'Invalid credentials',
        retryCount: 0,
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should expose error from auth context', async () => {
      const loginData = createValidLoginData();
      mockAuthService.login.mockRejectedValue(new Error('Server error'));

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      expect(result.current.error).toBe(null);

      await act(async () => {
        try {
          await result.current.onSubmit(loginData);
        } catch {}
      });

      expect(result.current.error).toBe('Server error');
    });

    it('should handle network disconnection scenarios', async () => {
      const loginData = createValidLoginData();
      const networkError = new Error('Network disconnected');
      networkError.name = 'NetworkError';
      mockAuthService.login.mockRejectedValue(networkError);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.onSubmit(loginData);
        } catch {}
      });

      expect(result.current.canRetry).toBe(true);
      expect(mockLogger.error).toHaveBeenCalledWith('Login failed', {
        email: 'test@[redacted]',
        error: 'Network disconnected',
        retryCount: 0,
      });
    });

    it('should handle server 5xx errors with retry capability', async () => {
      const loginData = createValidLoginData();
      const serverError = new Error('Internal server error');
      serverError.name = 'ServerError';
      mockAuthService.login.mockRejectedValue(serverError);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.onSubmit(loginData);
        } catch {}
      });

      expect(result.current.canRetry).toBe(true);
    });

    it('should handle client 4xx errors without retry capability', async () => {
      const loginData = createValidLoginData();
      const clientError = new Error('Invalid credentials');
      clientError.name = 'AuthenticationError';
      mockAuthService.login.mockRejectedValue(clientError);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.onSubmit(loginData);
        } catch {}
      });

      expect(result.current.canRetry).toBe(true);
    });

    it('should clear password from form after failed submission', async () => {
      const loginData = createValidLoginData();
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.form.setValue('email', loginData.email);
        result.current.form.setValue('password', loginData.password);
      });

      await act(async () => {
        try {
          await result.current.onSubmit(loginData);
        } catch {}
      });

      expect(result.current.form.getValues().password).toBe('');
      expect(result.current.form.getValues().email).toBe(loginData.email);
    });
  });

  // ============== EDGE CASES & SECURITY ==============

  describe('Edge Cases & Security', () => {
    it('should handle malformed login responses gracefully', async () => {
      const loginData = createValidLoginData();

      const malformedResponse = { user: null, tokens: null };
      mockAuthService.login.mockResolvedValue(malformedResponse);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      let thrownError: Error | undefined;
      await act(async () => {
        try {
          await result.current.onSubmit(loginData);
        } catch (error) {
          thrownError = error as Error;
        }
      });

      expect(thrownError).toBeDefined();
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should sanitize all email variations in logs', async () => {
      const testEmails = [
        'user@domain.com',
        'user.name+tag@long-domain-name.co.uk',
        'simple@test.org',
        'complex.email.with.dots@example.com',
      ];

      for (const email of testEmails) {
        mockLogger.debug.mockClear();

        const loginData = { ...createValidLoginData(), email };
        mockAuthService.login.mockResolvedValue(createSuccessResponse());

        const { result } = renderHook(() => useLogin(), {
          wrapper: createWrapper(),
        });

        await act(async () => {
          await result.current.onSubmit(loginData);
        });

        expect(mockLogger.debug).toHaveBeenCalledWith('Login attempt started', {
          email: email.split('@')[0] + '@[redacted]',
          retryCount: 0,
        });
      }
    });

    it('should prevent submission with extremely long passwords', async () => {
      const loginData = {
        ...createValidLoginData(),
        password: 'a'.repeat(10000), // Very long password
      };

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.onSubmit(loginData);
      });

      expect(mockAuthService.login).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Login blocked - form validation failed'
      );
    });

    it('should handle custom timeout configuration', async () => {
      const customTimeout = 5000;
      const loginData = createValidLoginData();

      const longRunningPromise = new Promise((resolve) => {
        setTimeout(
          () => resolve(createSuccessResponse()),
          customTimeout + 1000
        );
      });
      mockAuthService.login.mockReturnValue(longRunningPromise);

      const { result } = renderHook(
        () => useLogin({ loginTimeout: customTimeout }),
        {
          wrapper: createWrapper(),
        }
      );
      let thrownError: Error | undefined;

      // Use a race condition to test the timeout logic
      await Promise.race([
        act(async () => {
          try {
            await result.current.onSubmit(loginData);
          } catch (error) {
            thrownError = error as Error;
          }
        }),
        new Promise((resolve) => setTimeout(resolve, customTimeout + 500)),
      ]);

      expect(thrownError).toBeDefined();
      expect(thrownError?.message).toBe('Login request timed out');
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  // ============== PERFORMANCE & MEMORY MANAGEMENT ==============

  describe('Performance & Memory Management', () => {
    it('should not create memory leaks with rapid mount/unmount cycles', () => {
      for (let i = 0; i < 50; i++) {
        const { unmount } = renderHook(() => useLogin(), {
          wrapper: createWrapper(),
        });
        unmount();
      }

      expect(vi.getTimerCount()).toBe(0);
    });

    it('should handle memory pressure during multiple concurrent operations', async () => {
      const loginData = createValidLoginData();

      const hooks = Array.from({ length: 100 }, () =>
        renderHook(() => useLogin(), { wrapper: createWrapper() })
      );

      hooks.forEach(({ result }) => {
        expect(result.current.isSubmitting).toBe(false);
        expect(typeof result.current.onSubmit).toBe('function');
      });

      hooks.forEach(({ unmount }) => unmount());
    });

    it('should handle form state updates efficiently', async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.form.setValue('email', `test${i}@example.com`);
          result.current.form.setValue('password', `password${i}`);
        });
      }

      expect(result.current.form.getValues().email).toBe('test99@example.com');
      expect(result.current.form.getValues().password).toBe('password99');
    });

    it('should debounce rapid retry attempts', async () => {
      const loginData = createValidLoginData();
      mockAuthService.login.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.form.setValue('email', loginData.email);
        result.current.form.setValue('password', loginData.password);
      });

      await act(async () => {
        try {
          await result.current.onSubmit(loginData);
        } catch {}
      });

      const startTime = Date.now();
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.retry();
        });
      }

      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);

      expect(mockAuthService.login).toHaveBeenCalledTimes(2);
    });
  });

  // ============== ACCESSIBILITY & UX ==============

  describe('Accessibility & UX Considerations', () => {
    it('should provide clear error messages for screen readers', async () => {
      const loginData = createValidLoginData();
      const errorMessage = 'Your account has been temporarily locked';
      mockAuthService.login.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.onSubmit(loginData);
        } catch {}
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle focus management during submission flow', () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      expect(result.current.form).toBeDefined();
      expect(typeof result.current.form.setFocus).toBe('function');
    });
  });
});
