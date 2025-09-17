// src/features/auth/components/__tests__/LoginForm.test.tsx

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { LoginForm } from '../LoginForm';
import { authService } from '@/domains/auth';

// Mock the service layer, which is the true external dependency of the AuthProvider.
vi.mock('@/services/auth', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
  TokenService: {
    getTokens: vi.fn(() => ({ accessToken: null, refreshToken: null })),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
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

// A wrapper that provides the REAL AuthProvider, creating a realistic test environment.
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('LoginForm', () => {
  beforeEach(() => {
    // Clear all mocks before each test to ensure isolation
    vi.clearAllMocks();
  });

  it('should render login form with all fields', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('remember-me-checkbox')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument();
    expect(screen.getByTestId('register-link')).toBeInTheDocument();
    expect(screen.getByTestId('password-toggle-button')).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(
      <TestWrapper>
        <LoginForm testId="login-form" />
      </TestWrapper>
    );
    fireEvent.submit(screen.getByTestId('login-form'));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit-button')).toBeDisabled();
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
    await user.tab(); // Trigger onBlur validation

    expect(
      await screen.findByText('Please enter a valid email address')
    ).toBeInTheDocument();
  });

  it('should show validation error for short password', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );
    await user.type(screen.getByTestId('password-input'), '123');
    await user.tab();
    expect(
      await screen.findByText('Password must be at least 8 characters')
    ).toBeInTheDocument();
  });

  it('should enable submit button when form is valid', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );
    const submitButton = screen.getByTestId('login-submit-button');
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByTestId('email-input'), 'test@example.com');
    await user.type(screen.getByTestId('password-input'), 'ValidPass123');

    // Wait for the async validation to complete and the button to be enabled.
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should handle successful login', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.login).mockResolvedValue({
      user: {} as any,
      tokens: {} as any,
    });

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    await user.type(screen.getByTestId('email-input'), 'test@example.com');
    await user.type(screen.getByTestId('password-input'), 'ValidPass123');
    await user.click(screen.getByTestId('remember-me-checkbox'));

    const submitButton = screen.getByTestId('login-submit-button');
    await waitFor(() => expect(submitButton).not.toBeDisabled());

    await user.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'ValidPass123',
        rememberMe: true,
      });
    });
  });

  it('should handle login error and allow dismissing the error', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.login).mockRejectedValue(
      new Error('Invalid credentials')
    );

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    await user.type(screen.getByTestId('email-input'), 'wrong@example.com');
    await user.type(screen.getByTestId('password-input'), 'WrongPass123');

    const submitButton = screen.getByTestId('login-submit-button');
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    await user.click(submitButton);

    const errorAlert = await screen.findByTestId('login-error');
    expect(errorAlert).toHaveTextContent('Invalid credentials');

    const dismissButton = screen.getByTestId('error-dismiss-button');
    await user.click(dismissButton);

    await waitFor(() => {
      expect(screen.queryByTestId('login-error')).not.toBeInTheDocument();
    });
  });

  it('should announce error with aria-live', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.login).mockRejectedValue(
      new Error('Invalid credentials')
    );
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    await user.type(screen.getByTestId('email-input'), 'wrong@example.com');
    await user.type(screen.getByTestId('password-input'), 'WrongPass123');

    const submitButton = screen.getByTestId('login-submit-button');
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    await user.click(submitButton);

    const errorAlert = await screen.findByTestId('login-error');
    expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
  });

  it('should show demo credentials in test environment', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );
    const demoBox = screen.getByTestId('demo-credentials');
    expect(demoBox).toBeInTheDocument();
    expect(demoBox).toHaveTextContent('Demo Credentials');
    expect(demoBox).toHaveTextContent('owner@test.com');
  });

  it('should toggle remember me checkbox', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );
    const checkbox = screen.getByTestId(
      'remember-me-checkbox'
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    await user.click(checkbox);
    expect(checkbox.checked).toBe(true);
    await user.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  it('should render without card wrapper when showCard is false', () => {
    render(
      <TestWrapper>
        <LoginForm showCard={false} />
      </TestWrapper>
    );
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
  });

  it('should hide links when showLinks is false', () => {
    render(
      <TestWrapper>
        <LoginForm showLinks={false} />
      </TestWrapper>
    );
    expect(
      screen.queryByTestId('forgot-password-link')
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('register-link')).not.toBeInTheDocument();
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
    const passwordInput = screen.getByTestId(
      'password-input'
    ) as HTMLInputElement;
    const toggleButton = screen.getByTestId('password-toggle-button');
    expect(passwordInput).toHaveAttribute('type', 'password');
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should focus email input on validation error', async () => {
    render(
      <TestWrapper>
        <LoginForm testId="login-form" />
      </TestWrapper>
    );
    const emailInput = screen.getByTestId('email-input');
    const form = screen.getByTestId('login-form');
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    fireEvent.submit(form);
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(document.activeElement).toBe(emailInput);
    });
  });
});
