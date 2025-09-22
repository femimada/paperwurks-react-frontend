// src/domains/auth/components/__tests__/LoginForm.integration.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from '../LoginForm';
import { useAuth } from '@/domains/auth/hooks/useAuth';

// Real hook integration - NOT mocking useLogin for integration tests
vi.mock('@/domains/auth/hooks/useAuth');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: null }),
  };
});

vi.mock('@/shared/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

const mockUseAuth = vi.mocked(useAuth);

const createMockAuthContext = (overrides = {}) => ({
  user: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: vi.fn(),
  register: vi.fn(),
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

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('LoginForm Integration Tests', () => {
  const mockLogin = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(
      createMockAuthContext({
        login: mockLogin,
        clearError: mockClearError,
      })
    );
  });

  describe('1. Form-Hook Integration', () => {
    it('should call useLogin.onSubmit when form is submitted', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-submit-button');

      // Fill form with valid data
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.tab(); // Trigger validation

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      // Submit form
      await user.click(submitButton);

      // Verify that useAuth.login was called with correct data
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        });
      });
    });

    it('should properly integrate React Hook Form handleSubmit with useLogin onSubmit', async () => {
      const user = userEvent.setup();
      let submitCallCount = 0;

      // Track how many times login is called
      mockLogin.mockImplementation(() => {
        submitCallCount++;
        return Promise.resolve();
      });

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // Submit via form submit event (not button click)
      await user.type(passwordInput, '{enter}');

      await waitFor(() => {
        expect(submitCallCount).toBe(1);
      });

      // Verify form only submitted once despite multiple triggers
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    it('should work end-to-end with real useLogin hook behavior', async () => {
      const user = userEvent.setup();

      // Mock successful login flow
      mockLogin.mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        tokens: { accessToken: 'token' },
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
      await user.click(submitButton);

      // Verify the complete flow: form submission -> hook execution -> auth call
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        });
      });

      // Verify clearError was called before login attempt
      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe('2. React Hook Form Validation Flow', () => {
    it('should perform final validation before calling onSubmit', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId('login-submit-button');

      // Try to submit empty form
      await user.click(submitButton);

      // Should not call login with invalid form
      expect(mockLogin).not.toHaveBeenCalled();
      expect(submitButton).toBeDisabled();
    });

    it('should block invalid forms even if button appears enabled', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('login-submit-button');

      // Fill valid email but leave password empty
      await user.type(emailInput, 'test@example.com');
      await user.tab();

      // Button should still be disabled due to missing password
      expect(submitButton).toBeDisabled();

      // Try to submit anyway
      await user.click(submitButton);

      // Should not call login
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should integrate zodResolver with LoginSchema validation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      // Test email validation
      await user.type(emailInput, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid email address')
        ).toBeInTheDocument();
      });

      // Clear and test password validation
      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');
      await user.click(passwordInput);
      await user.tab(); // Leave password empty

      await waitFor(() => {
        expect(screen.getByText('Password is required.')).toBeInTheDocument();
      });

      // Both fields valid should enable submit
      await user.type(passwordInput, 'password123');
      await user.tab();

      await waitFor(() => {
        const submitButton = screen.getByTestId('login-submit-button');
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('3. Async State Coordination', () => {
    it('should handle concurrent state updates without interference', async () => {
      const user = userEvent.setup();

      // Mock slow login
      mockLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
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
      await user.type(passwordInput, 'password123');

      // Submit form
      await user.click(submitButton);

      // Should prevent double submission
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only call login once
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle multiple rapid submissions correctly', async () => {
      const user = userEvent.setup();
      let loginCallCount = 0;

      mockLogin.mockImplementation(() => {
        loginCallCount++;
        return new Promise((resolve) => setTimeout(resolve, 50));
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

      // Rapid fire submissions
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Wait for any async operations to complete
      await waitFor(
        () => {
          expect(loginCallCount).toBe(1);
        },
        { timeout: 200 }
      );

      expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    it('should maintain proper component behavior during async login', async () => {
      const user = userEvent.setup();

      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      mockLogin.mockReturnValue(loginPromise);

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
      await user.click(submitButton);

      // During async operation, form should still be responsive
      await user.clear(emailInput);
      await user.type(emailInput, 'newemail@example.com');

      // Resolve the login
      resolveLogin!({ user: {}, tokens: {} });

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com', // Original email, not the one typed during loading
          password: 'password123',
          rememberMe: false,
        });
      });
    });
  });

  describe('4. Event Handling Chain', () => {
    it('should trigger form onSubmit via button click', async () => {
      const user = userEvent.setup();

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
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });

    it('should trigger form submission via Enter key', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(passwordInput, '{enter}');

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });

    it('should prevent submission when button is disabled', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId('login-submit-button');

      // Button should be disabled initially
      expect(submitButton).toBeDisabled();

      // Click disabled button
      await user.click(submitButton);

      // Should not call login
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should handle form submission chain correctly', async () => {
      const user = userEvent.setup();

      const formSubmitSpy = vi.fn();

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const form = screen.getByTestId('login-form');

      // Add event listeners to track the event chain
      form.addEventListener('submit', formSubmitSpy);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-submit-button');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(formSubmitSpy).toHaveBeenCalled();
        expect(mockLogin).toHaveBeenCalled();
      });
    });
  });

  describe('5. Component Lifecycle Integration', () => {
    it('should handle hook behavior across mount/unmount cycles', async () => {
      const { unmount, rerender } = render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Verify initial state
      expect(screen.getByTestId('login-form')).toBeInTheDocument();

      // Unmount component
      unmount();

      // Verify clearError was called on unmount
      expect(mockClearError).toHaveBeenCalled();

      // Remount component
      rerender(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Should be back to initial state
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByTestId('login-submit-button')).toBeDisabled();
    });

    it('should handle component re-renders without breaking hook state', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      // Fill form
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // Force re-render
      rerender(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Form state should be preserved
      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');

      const submitButton = screen.getByTestId('login-submit-button');
      expect(submitButton).not.toBeDisabled();
    });

    it('should properly cleanup effects on unmount', async () => {
      const { unmount } = render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Clear the mock call count
      mockClearError.mockClear();

      unmount();

      // Verify cleanup was called
      expect(mockClearError).toHaveBeenCalledTimes(1);
    });
  });

  describe('6. Error Boundary Cases', () => {
    it('should handle unexpected errors during form submission', async () => {
      const user = userEvent.setup();

      // Mock login to throw unexpected error
      mockLogin.mockRejectedValue(new Error('Network timeout'));

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
      await user.click(submitButton);

      // Should gracefully handle the error
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });

      // Component should still be functional
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    it('should recover from network errors', async () => {
      const user = userEvent.setup();

      // First attempt fails
      mockLogin
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ user: {}, tokens: {} });

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

      // First attempt
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledTimes(1);
      });

      // Second attempt should work
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle component behavior when auth context enters error states', async () => {
      const user = userEvent.setup();

      // Mock auth context with error state
      mockUseAuth.mockReturnValue(
        createMockAuthContext({
          login: mockLogin,
          clearError: mockClearError,
          error: 'Authentication failed',
          isLoading: false,
        })
      );

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Should display error
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Authentication failed/)).toBeInTheDocument();

      // Form should still be functional
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByTestId('login-submit-button');
      expect(submitButton).not.toBeDisabled();
    });
  });
});
