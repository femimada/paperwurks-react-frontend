// src/context/__tests__/AuthContext.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AuthProvider } from '../AuthContext';
import { authService, TokenService, useAuth } from '@/domains/auth';
import type { User } from '@/domains/auth/types';

// Mock the auth service
vi.mock('@/domains/auth', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
  TokenService: {
    getTokens: vi.fn(),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
    hasValidTokens: vi.fn(),
    isTokenExpired: vi.fn(),
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

// Test component
const TestComponent = () => {
  const { user, isAuthenticated, login, logout, error, isLoading } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      {user && (
        <div data-testid="user-info">
          {user.firstName} {user.lastName} - {user.role}
        </div>
      )}
      {error && <div data-testid="error-message">{error}</div>}
      <button
        data-testid="login-button"
        onClick={() =>
          login({
            email: 'test@test.com',
            password: 'password',
            rememberMe: false,
          })
        }
      >
        Login
      </button>
      <button data-testid="logout-button" onClick={logout}>
        Logout
      </button>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
    </div>
  );
};

const renderWithAuthProvider = (children: React.ReactNode) => {
  return render(<AuthProvider>{children}</AuthProvider>);
};

describe('AuthContext', () => {
  const mockAuthService = authService as any;
  const mockTokenService = TokenService as any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock implementations
    mockTokenService.getTokens.mockReturnValue({
      accessToken: null,
      refreshToken: null,
    });
    mockTokenService.hasValidTokens.mockReturnValue(false);
    mockAuthService.getCurrentUser.mockResolvedValue(null);
  });

  it('should provide initial auth state', () => {
    renderWithAuthProvider(<TestComponent />);

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Not Authenticated'
    );
    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    const user = userEvent.setup();
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'owner',
      permissions: ['property:read'],
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

    mockAuthService.login.mockResolvedValue({
      user: mockUser,
      tokens: mockTokens,
    });

    renderWithAuthProvider(<TestComponent />);
    await user.click(screen.getByTestId('login-button'));

    await waitFor(() => expect(mockAuthService.login).toHaveBeenCalled());
    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Authenticated'
    );
    expect(screen.getByTestId('user-info')).toHaveTextContent(
      'John Doe - owner'
    );
  });

  it('should handle login error', async () => {
    const user = userEvent.setup();
    mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

    renderWithAuthProvider(<TestComponent />);
    await user.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Invalid credentials'
      );
    });
    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Not Authenticated'
    );
  });

  it('should handle logout', async () => {
    const user = userEvent.setup();
    mockAuthService.logout.mockResolvedValue(undefined);

    renderWithAuthProvider(<TestComponent />);
    await user.click(screen.getByTestId('logout-button'));

    await waitFor(() => {
      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Not Authenticated'
    );
  });

  it('should handle logout, clearing client state even if server call fails', async () => {
    const user = userEvent.setup();
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'owner',
      permissions: ['property:read'],
      profile: { phone: '', bio: '' },
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
    mockTokenService.hasValidTokens.mockReturnValue(true);
    mockAuthService.logout.mockRejectedValue(new Error('Server unavailable'));

    renderWithAuthProvider(<TestComponent />);

    await waitFor(() =>
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'Authenticated'
      )
    );

    await user.click(screen.getByTestId('logout-button'));

    await waitFor(() => {
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Not Authenticated'
    );
    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    console.error = originalError;
  });
});
