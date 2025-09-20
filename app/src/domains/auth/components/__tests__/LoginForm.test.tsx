// src/domains/auth/components/__tests__/LoginForm.test.tsx - Fixed version
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { LoginForm } from '../LoginForm';

// Mock the auth service
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
  },
}));

// Mock logger
vi.mock('@/shared/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Import after mocks
import { authService } from '@/domains/auth';

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('LoginForm', () => {
  const mockAuthService = authService as any;

  beforeEach(() => {
    vi.clearAllMocks();
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

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const submitButton = screen.getByTestId('login-submit-button');

    // Initially the button should be disabled
    expect(submitButton).toBeDisabled();

    // Try to submit empty form by clicking submit button
    await user.click(submitButton);

    // Wait for validation errors to appear
    await waitFor(() => {
      // Look for specific error messages, not generic text
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    expect(submitButton).toBeDisabled();
  });

  it('should show validation error for invalid email', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByTestId('email-input');
    await user.type(emailInput, 'invalid-email');

    // Trigger validation by blurring the field
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeInTheDocument();
    });
  });

  it('should allow any non-empty password', async () => {
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
    await user.type(passwordInput, '123'); // Short password should be fine for login
    await user.tab();

    await waitFor(() => {
      // Should not show password length error and button should be enabled
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

    // Fill valid data - now using simple validation requirements
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123'); // This should now be valid

    // Wait for form validation - using onBlur mode now so trigger blur
    await user.tab();

    await waitFor(
      () => {
        expect(submitButton).not.toBeDisabled();
      },
      { timeout: 2000 }
    );
  });

  it('should handle successful login', async () => {
    const user = userEvent.setup();

    mockAuthService.login.mockResolvedValue({
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'owner',
      },
      tokens: {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: new Date().toISOString(),
        tokenType: 'Bearer',
      },
    });

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

    // Wait for button to be enabled
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });
    });
  });

  it('should handle login error and show error message', async () => {
    const user = userEvent.setup();

    mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

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
    await user.tab(); // Trigger validation

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await user.click(submitButton);

    await waitFor(() => {
      // Look for a more generic error message or check the auth context error handling
      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(/Login failed|Invalid credentials/i);
    });
  });

  it('should announce error with proper ARIA attributes', async () => {
    const user = userEvent.setup();

    mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

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
      // Find the error alert - should be unique from field validation alerts
      const alerts = screen.getAllByRole('alert');
      // The login error should be the last alert (not field validation)
      const loginErrorAlert = alerts.find(
        (alert) =>
          alert.textContent?.includes('Login failed') ||
          alert.textContent?.includes('Invalid credentials')
      );
      expect(loginErrorAlert).toBeInTheDocument();
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

  it('should render without card wrapper when showCard is false', () => {
    render(
      <TestWrapper>
        <LoginForm showCard={false} />
      </TestWrapper>
    );

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    // Card wrapper should not be present
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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

  it('should focus email input on validation error', async () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByTestId('email-input');
    const form = screen.getByTestId('login-form');

    fireEvent.submit(form);

    await waitFor(() => {
      expect(emailInput).toHaveFocus();
    });
  });
});
