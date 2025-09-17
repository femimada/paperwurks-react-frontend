// src/pages/auth/__tests__/ResetPasswordPage.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ResetPasswordPage } from '../ResetPasswordPage';

// Mock the auth hook
const mockResetPassword = vi.fn();
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

// Mock PasswordStrengthMeter
vi.mock(
  '@/domains/auth/components/RegisterForm/components/PasswordStrengthMeter',
  () => ({
    PasswordStrengthMeter: vi.fn(({ password }) => (
      <div data-testid="password-strength">Strength for: {password}</div>
    )),
  })
);

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      resetPassword: mockResetPassword,
    });
  });

  const renderWithRouter = (token?: string) => {
    const route = token ? `/reset-password?token=${token}` : '/reset-password';

    return render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/forgot-password"
            element={<div>Forgot Password Page</div>}
          />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should render reset password page with valid token', () => {
    renderWithRouter('valid-token-123');

    expect(screen.getByTestId('reset-password-page')).toBeInTheDocument();
    expect(screen.getByText('Create new password')).toBeInTheDocument();
    expect(
      screen.getByText('Enter your new password below')
    ).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('confirmPassword-input')).toBeInTheDocument();
  });

  it('should redirect to forgot-password when no token', () => {
    renderWithRouter();

    expect(screen.getByText('Forgot Password Page')).toBeInTheDocument();
  });

  it('should redirect to dashboard when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      resetPassword: mockResetPassword,
    });

    renderWithRouter('valid-token-123');

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should validate password requirements', async () => {
    const user = userEvent.setup();
    renderWithRouter('valid-token-123');

    const passwordInput = screen.getByTestId('password-input');

    // Type weak password
    await user.type(passwordInput, 'weak');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText('Password must be at least 8 characters')
      ).toBeInTheDocument();
    });
  });

  it('should validate password confirmation', async () => {
    const user = userEvent.setup();
    renderWithRouter('valid-token-123');

    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirmPassword-input');

    await user.type(passwordInput, 'ValidPass123');
    await user.type(confirmPasswordInput, 'DifferentPass123');

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
    });
  });

  it('should show password strength meter', async () => {
    const user = userEvent.setup();
    renderWithRouter('valid-token-123');

    const passwordInput = screen.getByTestId('password-input');
    await user.type(passwordInput, 'StrongPass123!');

    await waitFor(() => {
      expect(screen.getByTestId('password-strength')).toBeInTheDocument();
      expect(
        screen.getByText('Strength for: StrongPass123!')
      ).toBeInTheDocument();
    });
  });

  it('should handle successful password reset', async () => {
    const user = userEvent.setup();
    mockResetPassword.mockResolvedValue(undefined);

    renderWithRouter('valid-token-123');

    // Fill in passwords
    await user.type(screen.getByTestId('password-input'), 'ValidPass123');
    await user.type(
      screen.getByTestId('confirmPassword-input'),
      'ValidPass123'
    );

    // Submit form
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith({
        token: 'valid-token-123',
        password: 'ValidPass123',
        confirmPassword: 'ValidPass123',
      });
    });

    // Should show success message
    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toBeInTheDocument();
      expect(screen.getByText('Password reset successful')).toBeInTheDocument();
      expect(screen.getByTestId('login-link')).toBeInTheDocument();
    });
  });

  it('should handle password reset error', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Token expired';
    mockResetPassword.mockRejectedValue(new Error(errorMessage));

    renderWithRouter('expired-token');

    // Fill in passwords
    await user.type(screen.getByTestId('password-input'), 'ValidPass123');
    await user.type(
      screen.getByTestId('confirmPassword-input'),
      'ValidPass123'
    );

    // Submit form
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should have back to sign in link', () => {
    renderWithRouter('valid-token-123');

    const backLink = screen.getByTestId('back-to-login-link');
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/login');
  });

  it('should disable submit button when form is invalid', () => {
    renderWithRouter('valid-token-123');

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when form is valid', async () => {
    const user = userEvent.setup();
    renderWithRouter('valid-token-123');

    await user.type(screen.getByTestId('password-input'), 'ValidPass123');
    await user.type(
      screen.getByTestId('confirmPassword-input'),
      'ValidPass123'
    );

    const submitButton = screen.getByTestId('submit-button');

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
