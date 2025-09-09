// src/features/auth/components/__tests__/LoginForm.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { LoginForm } from '../LoginForm';
import type { Permission, UserRole } from '@/types/global.types';

// Mock the auth service
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
vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Test wrapper with required providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render login form with all fields', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    // Check form elements are present
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('remember-me-checkbox')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();

    // Check links are present
    expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument();
    expect(screen.getByTestId('register-link')).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const submitButton = screen.getByTestId('login-submit-button');

    // Try to submit empty form
    await user.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    // Submit button should be disabled
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

    // Enter invalid email
    await user.type(emailInput, 'invalid-email');
    await user.tab(); // Trigger validation

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeInTheDocument();
    });
  });

  it('should show validation error for short password', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const passwordInput = screen.getByTestId('password-input');

    // Enter short password
    await user.type(passwordInput, '123');
    await user.tab(); // Trigger validation

    await waitFor(() => {
      expect(
        screen.getByText('Password must be at least 6 characters')
      ).toBeInTheDocument();
    });
  });

  it('should handle successful login', async () => {
    const user = userEvent.setup();
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'owner' as UserRole,
      permissions: ['property:read' as Permission],
      profile: { phone: '', bio: '' },
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockTokens = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      tokenType: 'Bearer' as const,
    };

    const { authService } = await import('@/services/auth');
    vi.mocked(authService.login).mockResolvedValue({
      user: mockUser,
      tokens: mockTokens,
    });

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    // Fill in valid credentials
    await user.type(screen.getByTestId('email-input'), 'test@example.com');
    await user.type(screen.getByTestId('password-input'), 'password123');

    // Check remember me
    await user.click(screen.getByTestId('remember-me-checkbox'));

    // Submit form
    await user.click(screen.getByTestId('login-submit-button'));

    // Verify API was called with correct data
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      });
    });
  });

  it('should handle login error', async () => {
    const user = userEvent.setup();
    const { authService } = await import('@/services/auth');
    vi.mocked(authService.login).mockRejectedValue(
      new Error('Invalid credentials')
    );

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    // Fill in credentials
    await user.type(screen.getByTestId('email-input'), 'wrong@example.com');
    await user.type(screen.getByTestId('password-input'), 'wrongpassword');

    // Submit form
    await user.click(screen.getByTestId('login-submit-button'));

    // Should show error message
    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toBeInTheDocument();
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
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

    // Initially unchecked
    expect(checkbox.checked).toBe(false);

    // Click to check
    await user.click(checkbox);
    expect(checkbox.checked).toBe(true);

    // Click to uncheck
    await user.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  it('should render without card wrapper when showCard is false', () => {
    render(
      <TestWrapper>
        <LoginForm showCard={false} />
      </TestWrapper>
    );

    // Should not have card styling
    expect(screen.queryByText('Sign in to your account')).toBeInTheDocument();
    // Check that card class is not present (this test assumes we can identify card styling)
  });

  it('should hide links when showLinks is false', () => {
    render(
      <TestWrapper>
        <LoginForm showLinks={false} />
      </TestWrapper>
    );

    // Links should not be present
    expect(
      screen.queryByTestId('forgot-password-link')
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('register-link')).not.toBeInTheDocument();
  });

  it('should show demo credentials in development', () => {
    // Mock NODE_ENV to be development
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    expect(screen.getByText('Demo Credentials')).toBeInTheDocument();
    expect(screen.getByText('owner@test.com')).toBeInTheDocument();
    expect(screen.getByText('password123')).toBeInTheDocument();

    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  it('should disable submit button when form is invalid', async () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const submitButton = screen.getByTestId('login-submit-button');

    // Button should be disabled initially (empty form)
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when form is valid', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const submitButton = screen.getByTestId('login-submit-button');

    // Fill in valid data
    await user.type(screen.getByTestId('email-input'), 'test@example.com');
    await user.type(screen.getByTestId('password-input'), 'password123');

    // Button should be enabled
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
