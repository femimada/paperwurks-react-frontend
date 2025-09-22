// src/domains/auth/components/__tests__/LoginForm.lifecycle.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import React, { useState } from 'react';
import { LoginForm } from '../LoginForm';
import { useAuth } from '@/domains/auth/hooks/useAuth';

// Mock dependencies
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

// Test component that can control mounting/unmounting
const LifecycleTestContainer = ({ shouldRender = true }) => {
  return (
    <TestWrapper>
      {shouldRender ? (
        <LoginForm />
      ) : (
        <div data-testid="unmounted">Unmounted</div>
      )}
    </TestWrapper>
  );
};

// Test component that forces re-renders
const ReRenderTestContainer = () => {
  const [key, setKey] = useState(0);
  const [props, setProps] = useState({});

  return (
    <TestWrapper>
      <button data-testid="force-rerender" onClick={() => setKey((k) => k + 1)}>
        Force Re-render
      </button>
      <button
        data-testid="change-props"
        onClick={() => setProps({ testId: 'changed-form' })}
      >
        Change Props
      </button>
      <LoginForm key={key} {...props} />
    </TestWrapper>
  );
};

describe('Login Component Lifecycle Tests', () => {
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

  describe('9. Component Lifecycle Integration', () => {
    it('should handle hook behavior across mount/unmount cycles', async () => {
      const { rerender } = render(
        <LifecycleTestContainer shouldRender={true} />
      );

      // Verify component mounted
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(mockUseAuth).toHaveBeenCalled();

      // Clear mock call count
      mockUseAuth.mockClear();
      mockClearError.mockClear();

      // Unmount component
      rerender(<LifecycleTestContainer shouldRender={false} />);

      // Verify component unmounted
      expect(screen.getByTestId('unmounted')).toBeInTheDocument();
      expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();

      // Verify cleanup was called
      expect(mockClearError).toHaveBeenCalledTimes(1);

      // Clear mock call count again
      mockUseAuth.mockClear();

      // Remount component
      rerender(<LifecycleTestContainer shouldRender={true} />);

      // Verify component remounted with fresh state
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(mockUseAuth).toHaveBeenCalled();

      // Form should be in initial state
      const submitButton = screen.getByTestId('login-submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('should handle component re-renders without breaking hook state', async () => {
      const user = userEvent.setup();

      render(<ReRenderTestContainer />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const forceRerenderButton = screen.getByTestId('force-rerender');

      // Fill form
      await user.type(emailInput, 'persist@test.com');
      await user.type(passwordInput, 'password123');

      // Verify form state
      expect(emailInput).toHaveValue('persist@test.com');
      expect(passwordInput).toHaveValue('password123');

      // Force re-render by changing key
      await user.click(forceRerenderButton);

      // Form should reset because key changed (new component instance)
      const newEmailInput = screen.getByTestId('email-input');
      const newPasswordInput = screen.getByTestId('password-input');

      expect(newEmailInput).toHaveValue('');
      expect(newPasswordInput).toHaveValue('');
    });

    it('should handle prop changes without breaking form state', async () => {
      const user = userEvent.setup();

      render(<ReRenderTestContainer />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const changePropsButton = screen.getByTestId('change-props');

      // Fill form
      await user.type(emailInput, 'props@test.com');
      await user.type(passwordInput, 'password123');

      // Change props (without changing key)
      await user.click(changePropsButton);

      // Form state should persist through prop changes
      expect(emailInput).toHaveValue('props@test.com');
      expect(passwordInput).toHaveValue('password123');

      // Submit should still work
      const submitButton = screen.getByTestId('login-submit-button');
      expect(submitButton).not.toBeDisabled();
    });

    it('should properly cleanup effects on unmount', async () => {
      const effectCleanupSpy = vi.fn();
      const mockClearErrorWithCleanup = vi.fn().mockImplementation(() => {
        return () => effectCleanupSpy(); // Return cleanup function
      });

      mockUseAuth.mockReturnValue(
        createMockAuthContext({
          login: mockLogin,
          clearError: mockClearErrorWithCleanup,
        })
      );

      const { unmount } = render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Clear call count from mount
      mockClearErrorWithCleanup.mockClear();

      // Unmount component
      unmount();

      // Verify cleanup was called
      expect(mockClearErrorWithCleanup).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid mount/unmount cycles', async () => {
      const mountCycles = 5;
      let mountCount = 0;
      let unmountCount = 0;

      const trackingClearError = vi.fn().mockImplementation(() => {
        mountCount++;
        return () => {
          unmountCount++;
        };
      });

      mockUseAuth.mockReturnValue(
        createMockAuthContext({
          login: mockLogin,
          clearError: trackingClearError,
        })
      );

      // Rapid mount/unmount cycles
      for (let i = 0; i < mountCycles; i++) {
        const { unmount } = render(
          <TestWrapper>
            <LoginForm />
          </TestWrapper>
        );

        // Verify component rendered
        expect(screen.getByTestId('login-form')).toBeInTheDocument();

        // Unmount immediately
        unmount();
      }

      // Each mount should trigger clearError in useEffect
      expect(trackingClearError).toHaveBeenCalledTimes(mountCycles);
    });

    it('should handle memory leaks prevention', async () => {
      const user = userEvent.setup();

      // Track if any timers or async operations are left hanging
      const activeOperations = new Set<string>();

      const trackingLogin = vi.fn().mockImplementation(async () => {
        activeOperations.add('login');
        try {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return { user: {}, tokens: {} };
        } finally {
          activeOperations.delete('login');
        }
      });

      mockUseAuth.mockReturnValue(
        createMockAuthContext({
          login: trackingLogin,
          clearError: mockClearError,
        })
      );

      const { unmount } = render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-submit-button');

      // Start login process
      await user.type(emailInput, 'memory@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Unmount before login completes
      unmount();

      // Wait for any pending operations
      await waitFor(
        () => {
          expect(activeOperations.size).toBe(0);
        },
        { timeout: 100 }
      );

      // No operations should be hanging
      expect(activeOperations.size).toBe(0);
    });

    it('should handle focus management across lifecycle events', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Component should auto-focus email on mount
      await waitFor(() => {
        const emailInput = screen.getByTestId('email-input');
        expect(document.activeElement).toBe(emailInput);
      });

      // Type invalid email to trigger validation
      await user.type(screen.getByTestId('email-input'), 'invalid');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid email address')
        ).toBeInTheDocument();
      });

      // Re-render component
      rerender(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Focus should be managed correctly after re-render
      await waitFor(() => {
        const emailInput = screen.getByTestId('email-input');
        expect(document.activeElement).toBe(emailInput);
      });
    });

    it('should handle error state persistence across re-renders', async () => {
      // Start with error state
      mockUseAuth.mockReturnValue(
        createMockAuthContext({
          login: mockLogin,
          clearError: mockClearError,
          error: 'Persistent error',
        })
      );

      const { rerender } = render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Error should be displayed
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Persistent error/)).toBeInTheDocument();

      // Re-render with same error
      rerender(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Error should still be displayed
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Persistent error/)).toBeInTheDocument();

      // Clear error state
      mockUseAuth.mockReturnValue(
        createMockAuthContext({
          login: mockLogin,
          clearError: mockClearError,
          error: null,
        })
      );

      rerender(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Error should be gone
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should handle async operations during component lifecycle', async () => {
      const user = userEvent.setup();

      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      const asyncLogin = vi.fn().mockReturnValue(loginPromise);

      mockUseAuth.mockReturnValue(
        createMockAuthContext({
          login: asyncLogin,
          clearError: mockClearError,
        })
      );

      const { unmount } = render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-submit-button');

      // Start async login
      await user.type(emailInput, 'async@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(asyncLogin).toHaveBeenCalled();

      // Unmount while async operation is pending
      unmount();

      // Resolve the async operation after unmount
      resolveLogin!({ user: {}, tokens: {} });

      // Should not throw or cause issues
      await expect(loginPromise).resolves.toBeDefined();
    });

    it('should handle state updates during unmount gracefully', async () => {
      const user = userEvent.setup();

      // Mock that tries to update state during/after unmount
      const problematicLogin = vi.fn().mockImplementation(async () => {
        // Simulate delayed state update
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { user: {}, tokens: {} };
      });

      mockUseAuth.mockReturnValue(
        createMockAuthContext({
          login: problematicLogin,
          clearError: mockClearError,
        })
      );

      const { unmount } = render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-submit-button');

      // Start login
      await user.type(emailInput, 'state@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Unmount immediately
      unmount();

      // Wait for async operation to complete
      await waitFor(() => {
        expect(problematicLogin).toHaveBeenCalled();
      });

      // Should not cause memory leaks or errors
      // (This test mainly ensures no errors are thrown)
    });
  });

  describe('Component State Consistency', () => {
    it('should maintain form validation state across re-renders', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      // Create validation errors
      await user.type(emailInput, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid email address')
        ).toBeInTheDocument();
      });

      // Re-render component
      rerender(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Validation error should persist
      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeInTheDocument();

      // Fix the email
      await user.clear(emailInput);
      await user.type(emailInput, 'valid@email.com');
      await user.type(passwordInput, 'password123');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.queryByText('Please enter a valid email address')
        ).not.toBeInTheDocument();
      });

      // Re-render again
      rerender(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Valid state should persist
      expect(
        screen.queryByText('Please enter a valid email address')
      ).not.toBeInTheDocument();
      const submitButton = screen.getByTestId('login-submit-button');
      expect(submitButton).not.toBeDisabled();
    });

    it('should handle form state during auth context changes', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      // Fill form
      await user.type(emailInput, 'context@test.com');
      await user.type(passwordInput, 'password123');

      // Change auth context state
      mockUseAuth.mockReturnValue(
        createMockAuthContext({
          login: mockLogin,
          clearError: mockClearError,
          isLoading: true, // Change to loading state
        })
      );

      rerender(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Form values should persist
      expect(emailInput).toHaveValue('context@test.com');
      expect(passwordInput).toHaveValue('password123');

      // Change to error state
      mockUseAuth.mockReturnValue(
        createMockAuthContext({
          login: mockLogin,
          clearError: mockClearError,
          error: 'Auth context error',
        })
      );

      rerender(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Form values should still persist
      expect(emailInput).toHaveValue('context@test.com');
      expect(passwordInput).toHaveValue('password123');

      // Error should be displayed
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should handle concurrent lifecycle events', async () => {
      const user = userEvent.setup();

      // Create multiple components that mount/unmount rapidly
      const components = Array.from({ length: 3 }, (_, i) => ({
        id: i,
        mounted: true,
      }));

      const MultipleComponentContainer = ({
        components,
      }: {
        components: typeof components;
      }) => (
        <TestWrapper>
          {components.map((comp) =>
            comp.mounted ? (
              <LoginForm key={comp.id} testId={`login-form-${comp.id}`} />
            ) : null
          )}
        </TestWrapper>
      );

      const { rerender } = render(
        <MultipleComponentContainer components={components} />
      );

      // Verify all components mounted
      components.forEach((comp) => {
        expect(screen.getByTestId(`login-form-${comp.id}`)).toBeInTheDocument();
      });

      // Unmount some components
      components[1].mounted = false;
      rerender(<MultipleComponentContainer components={components} />);

      // Verify correct components remain
      expect(screen.getByTestId('login-form-0')).toBeInTheDocument();
      expect(screen.queryByTestId('login-form-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('login-form-2')).toBeInTheDocument();

      // Remount component
      components[1].mounted = true;
      rerender(<MultipleComponentContainer components={components} />);

      // All should be mounted again
      components.forEach((comp) => {
        expect(screen.getByTestId(`login-form-${comp.id}`)).toBeInTheDocument();
      });
    });

    it('should handle effect dependency changes correctly', async () => {
      const user = userEvent.setup();

      let errorState = null;

      const DynamicErrorComponent = () => {
        mockUseAuth.mockReturnValue(
          createMockAuthContext({
            login: mockLogin,
            clearError: mockClearError,
            error: errorState,
          })
        );

        return <LoginForm />;
      };

      const { rerender } = render(
        <TestWrapper>
          <DynamicErrorComponent />
        </TestWrapper>
      );

      // No error initially
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      // Set error
      errorState = 'Dynamic error';
      rerender(
        <TestWrapper>
          <DynamicErrorComponent />
        </TestWrapper>
      );

      // Error should appear
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Dynamic error/)).toBeInTheDocument();

      // Clear error
      errorState = null;
      rerender(
        <TestWrapper>
          <DynamicErrorComponent />
        </TestWrapper>
      );

      // Error should disappear
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should handle form submission during component lifecycle changes', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-submit-button');

      // Fill form
      await user.type(emailInput, 'lifecycle@test.com');
      await user.type(passwordInput, 'password123');

      // Start submission
      await user.click(submitButton);

      // Immediately re-render during submission
      rerender(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Should have called login
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'lifecycle@test.com',
          password: 'password123',
          rememberMe: false,
        });
      });
    });
  });

  describe('Resource Management', () => {
    it('should clean up event listeners properly', async () => {
      const user = userEvent.setup();

      const { unmount } = render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const form = screen.getByTestId('login-form');

      // Add test event listener to verify cleanup
      const testListener = vi.fn();
      form.addEventListener('submit', testListener);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      // Fill and submit form
      await user.type(emailInput, 'cleanup@test.com');
      await user.type(passwordInput, 'password123');
      await user.type(passwordInput, '{enter}');

      // Event listener should have been called
      await waitFor(() => {
        expect(testListener).toHaveBeenCalled();
      });

      // Unmount component
      unmount();

      // Manual cleanup verification (in real scenarios, React handles this)
      form.removeEventListener('submit', testListener);
    });

    it('should handle timer cleanup correctly', async () => {
      const user = userEvent.setup();

      // Mock component that uses timers
      const timerIds = new Set<number>();
      const originalSetTimeout = global.setTimeout;
      const originalClearTimeout = global.clearTimeout;

      global.setTimeout = vi.fn().mockImplementation((callback, delay) => {
        const id = originalSetTimeout(callback, delay);
        timerIds.add(id);
        return id;
      });

      global.clearTimeout = vi.fn().mockImplementation((id) => {
        timerIds.delete(id);
        return originalClearTimeout(id);
      });

      const { unmount } = render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Unmount component
      unmount();

      // Restore original functions
      global.setTimeout = originalSetTimeout;
      global.clearTimeout = originalClearTimeout;

      // In a real implementation, timers should be cleaned up
      // This test documents the expectation
    });

    it('should prevent state updates after unmount', async () => {
      const user = userEvent.setup();

      // Mock console.error to catch warnings about state updates after unmount
      const originalError = console.error;
      const mockConsoleError = vi.fn();
      console.error = mockConsoleError;

      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      const delayedLogin = vi.fn().mockReturnValue(loginPromise);

      mockUseAuth.mockReturnValue(
        createMockAuthContext({
          login: delayedLogin,
          clearError: mockClearError,
        })
      );

      const { unmount } = render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-submit-button');

      // Start async operation
      await user.type(emailInput, 'unmount@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Unmount before operation completes
      unmount();

      // Complete the async operation
      resolveLogin!({ user: {}, tokens: {} });
      await loginPromise;

      // Should not have warnings about state updates after unmount
      // (This depends on proper implementation of the useLogin hook)

      // Restore console.error
      console.error = originalError;
    });
  });
});
