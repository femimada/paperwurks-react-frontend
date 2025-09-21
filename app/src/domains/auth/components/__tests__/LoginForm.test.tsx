// src/domains/auth/components/__tests__/LoginForm.test.tsx

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { LoginForm } from '../LoginForm';
import { type AuthContextType } from '@/context/AuthContext';

// Mock the auth service and other hooks/utilities
vi.mock('@/domains/auth', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
  TokenService: {
    getTokens: vi.fn(() => ({ accessToken: null, refreshToken: null })),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
    hasValidTokens: vi.fn(() => false),
    isTokenExpired: vi.fn(() => false),
    getAccessToken: vi.fn(() => null),
  },
}));

vi.mock('@/shared/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock the useAuth hook explicitly
vi.mock('@/domains/auth/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/domains/auth/hooks')>();
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Import after mocks
import { authService } from '@/domains/auth';
import { useAuth } from '@/domains/auth/hooks';
import type { UserRole } from '@/shared/types/global.types';

// Helper to create a complete mock for AuthContextType
const mockAuthContext = (
  overrides: Partial<AuthContextType> = {}
): AuthContextType => ({
  permissions: [],
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  register: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  changePassword: vi.fn(),
  updateProfile: vi.fn(),
  verifyEmail: vi.fn(),
  resendVerification: vi.fn(),
  clearError: vi.fn(),
  hasPermission: vi.fn(() => false),
  hasRole: vi.fn(() => false),
  hasAnyPermission: vi.fn(() => false),
  ...overrides,
});

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('LoginForm', () => {
  const mockLogin = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(
      mockAuthContext({
        login: mockLogin,
        clearError: mockClearError,
      })
    );
  });

  it('should render login form with all fields', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('remember-me-checkbox')).toBeInTheDocument();
  });

  it('should show validation errors when fields are focused and left empty', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    // Initially, errors should not be visible
    expect(screen.queryByText('Email is required.')).not.toBeInTheDocument();
    expect(screen.queryByText('Password is required.')).not.toBeInTheDocument();

    // Focus and then blur the email input
    await user.click(emailInput);
    await user.tab();

    // Expect email validation error to appear
    await waitFor(() => {
      expect(screen.getByText('Email is required.')).toBeInTheDocument();
    });

    // Focus and then blur the password input
    await user.click(passwordInput);
    await user.tab();

    // Expect password validation error to appear
    await waitFor(() => {
      expect(screen.getByText('Password is required.')).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByTestId('email-input');
    // Initially, errors should not be visible
    expect(screen.queryByText('Email is required.')).not.toBeInTheDocument();

    // Type invalid email and blur the field
    await user.type(emailInput, 'invalid-email@@@');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeInTheDocument();
    });
  });

  it('should accept any non-empty password', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-submit-button');

    // Test that even short passwords are accepted for login
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.queryByText(/Password must be at least/)
      ).not.toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should enable submit button when form is valid', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-submit-button');

    // Initially disabled
    expect(submitButton).toBeDisabled();

    // Fill valid data
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    // Trigger validation by blurring
    await user.tab();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should handle successful login', async () => {
    const user = userEvent.setup();
    const createMockAuthResponse = () => ({
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'owner' as UserRole,
        permissions: [],
        profile: { phone: '', bio: '' },
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        tokenType: 'Bearer',
      },
    });
    vi.mocked(authService.login).mockResolvedValue(createMockAuthResponse());

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-submit-button');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    // Trigger validation
    await user.tab();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });
    });
  });

  it('should handle login error and show error message', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));
    vi.mocked(useAuth).mockReturnValue(
      mockAuthContext({
        login: mockLogin,
        clearError: mockClearError,
        error: 'Invalid credentials',
      })
    );

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-submit-button');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.tab();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await user.click(submitButton);

    await waitFor(() => {
      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(/Invalid credentials/i);
    });
  });

  it('should show demo credentials in test environment', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    expect(screen.getByTestId('demo-credentials')).toBeInTheDocument();
    expect(screen.getByText('owner@test.com')).toBeInTheDocument();
  });

  it('should toggle remember me checkbox', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const checkbox = screen.getByTestId('remember-me-checkbox');

    // Should be unchecked initially
    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    await user.click(checkbox);

    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });

  it('should hide links when showLinks is false', () => {
    render(
      <TestWrapper>
        <LoginForm showLinks={false} />
      </TestWrapper>
    );

    expect(screen.queryByTestId('register-link')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('forgot-password-link')
    ).not.toBeInTheDocument();
  });

  it('should disable submit button when form is invalid', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const submitButton = screen.getByTestId('login-submit-button');
    expect(submitButton).toBeDisabled();
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const passwordInput = screen.getByTestId('password-input');
    const toggleButton = screen.getByTestId('password-toggle-button');

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('should focus email input on mount', async () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByTestId('email-input');

    await waitFor(() => {
      expect(emailInput).toHaveFocus();
    });
  });

  it('should handle form submission with loading state', async () => {
    const user = userEvent.setup();

    // Mock an async login that resolves after a delay to simulate loading
    mockLogin.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    vi.mocked(useAuth).mockReturnValue(
      mockAuthContext({
        login: mockLogin,
        isLoading: true, // Mock the loading state
      })
    );

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-submit-button');

    // The form should already be in a loading state
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/signing in/i);

    // Fill form and click submit (even though it's disabled, for completeness)
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.tab();

    await user.click(submitButton);
  });
});
