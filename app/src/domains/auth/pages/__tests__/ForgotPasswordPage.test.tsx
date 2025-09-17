// src/pages/auth/__tests__/ForgotPasswordPage.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ForgotPasswordPage } from '../ForgotPasswordPage';

// Mock the auth hook
const mockForgotPassword = vi.fn();
const mockClearError = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@/domains/auth/hooks', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock logger
vi.mock('@/shared/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to, replace }: any) => {
      mockNavigate(to, { replace });
      return null;
    },
  };
});

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockForgotPassword.mockClear();
    mockClearError.mockClear();

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      forgotPassword: mockForgotPassword,
      error: null,
      clearError: mockClearError,
    });
  });

  it('should render forgot password page when not authenticated', () => {
    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('forgot-password-page')).toBeInTheDocument();
    expect(screen.getByText('Reset your password')).toBeInTheDocument();
    expect(
      screen.getByText("Enter your email and we'll send you a reset link")
    ).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('should redirect to dashboard when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      forgotPassword: mockForgotPassword,
      error: null,
      clearError: mockClearError,
    });

    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('should validate email field', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    const submitButton = screen.getByTestId('submit-button');

    // Submit empty form
    await user.click(submitButton);

    // Should be disabled initially
    expect(submitButton).toBeDisabled();

    // Type invalid email
    const emailInput = screen.getByTestId('email-input');
    await user.type(emailInput, 'invalid-email');

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeInTheDocument();
    });
  });

  it('should handle successful password reset request', async () => {
    const user = userEvent.setup();
    mockForgotPassword.mockResolvedValue(undefined);

    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    // Fill in email
    const emailInput = screen.getByTestId('email-input');
    await user.type(emailInput, 'test@example.com');

    // Submit form
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com');
    });

    // Should show success message
    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toBeInTheDocument();
      expect(screen.getByText('Check your email')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('should handle password reset error', async () => {
    const user = userEvent.setup();
    const errorMessage = 'User not found';

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      forgotPassword: mockForgotPassword,
      error: errorMessage,
      clearError: mockClearError,
    });

    mockForgotPassword.mockRejectedValue(new Error(errorMessage));

    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    // Fill in email
    const emailInput = screen.getByTestId('email-input');
    await user.type(emailInput, 'nonexistent@example.com');

    // Submit form
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should handle resend email functionality', async () => {
    const user = userEvent.setup();
    mockForgotPassword.mockResolvedValue(undefined);

    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    // Submit initial request
    const emailInput = screen.getByTestId('email-input');
    await user.type(emailInput, 'test@example.com');
    await user.click(screen.getByTestId('submit-button'));

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toBeInTheDocument();
    });

    // Click resend
    const resendButton = screen.getByTestId('resend-button');
    await user.click(resendButton);

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledTimes(2);
      expect(resendButton).toBeDisabled();
      expect(resendButton).toHaveTextContent(/Resend email in \d+s/);
    });
  });

  it('should have back to sign in link', () => {
    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    const backLink = screen.getAllByTestId('back-to-login-link')[0];
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/login');
  });

  it('should clear error on unmount', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      forgotPassword: mockForgotPassword,
      error: 'Some error',
      clearError: mockClearError,
    });

    const { unmount } = render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    unmount();

    expect(mockClearError).toHaveBeenCalled();
  });
});
