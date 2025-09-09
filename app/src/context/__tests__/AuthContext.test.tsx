// src/context/__tests__/AuthContext.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';
import type { LoginRequest } from '@/types/auth';
import type { Permission, UserRole } from '@/types/global.types';

// Mock the auth service
vi.mock('@/services/auth', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshToken: vi.fn(),
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

// Test component that uses useAuth
const TestComponent = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    hasPermission,
    hasRole,
  } = useAuth();

  const handleLogin = async () => {
    const credentials: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    };
    try {
      await login(credentials);
    } catch (error) {
      // Error is handled by context
    }
  };

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="loading-status">
        {isLoading ? 'Loading' : 'Not Loading'}
      </div>
      {error && <div data-testid="error-message">{error}</div>}
      {user && (
        <div data-testid="user-info">
          {user.firstName} {user.lastName} - {user.role}
        </div>
      )}
      <button onClick={handleLogin} data-testid="login-button">
        Login
      </button>
      <button onClick={logout} data-testid="logout-button">
        Logout
      </button>
      <div data-testid="permission-check">
        {hasPermission('property:read')
          ? 'Can Read Properties'
          : 'Cannot Read Properties'}
      </div>
      <div data-testid="role-check">
        {hasRole('owner') ? 'Is Owner' : 'Not Owner'}
      </div>
    </div>
  );
};

const renderWithAuthProvider = (component: React.ReactElement) => {
  return render(<AuthProvider>{component}</AuthProvider>);
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should provide initial auth state', () => {
    renderWithAuthProvider(<TestComponent />);

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Not Authenticated'
    );
    expect(screen.getByTestId('loading-status')).toHaveTextContent(
      'Not Loading'
    );
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
    expect(screen.getByTestId('permission-check')).toHaveTextContent(
      'Cannot Read Properties'
    );
    expect(screen.getByTestId('role-check')).toHaveTextContent('Not Owner');
  });

  it('should handle successful login', async () => {
    const user = userEvent.setup();
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'owner' as UserRole,
      permissions: [
        'property:read' as Permission,
        'property:create' as Permission,
      ],
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

    const { authService, TokenService } = await import('@/services/auth');
    vi.mocked(authService.login).mockResolvedValue({
      user: mockUser,
      tokens: mockTokens,
    });

    renderWithAuthProvider(<TestComponent />);

    // Click login button
    await user.click(screen.getByTestId('login-button'));

    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'Authenticated'
      );
    });

    expect(screen.getByTestId('user-info')).toHaveTextContent(
      'John Doe - owner'
    );
    expect(screen.getByTestId('permission-check')).toHaveTextContent(
      'Can Read Properties'
    );
    expect(screen.getByTestId('role-check')).toHaveTextContent('Is Owner');
    expect(TokenService.setTokens).toHaveBeenCalledWith(mockTokens);
  });

  it('should handle login error', async () => {
    const user = userEvent.setup();
    const { authService } = await import('@/services/auth');
    vi.mocked(authService.login).mockRejectedValue(
      new Error('Invalid credentials')
    );

    renderWithAuthProvider(<TestComponent />);

    // Click login button
    await user.click(screen.getByTestId('login-button'));

    // Wait for error to appear
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
    const { authService, TokenService } = await import('@/services/auth');
    vi.mocked(authService.logout).mockResolvedValue();

    renderWithAuthProvider(<TestComponent />);

    // Click logout button
    await user.click(screen.getByTestId('logout-button'));

    // Wait for logout to complete
    await waitFor(() => {
      expect(TokenService.clearTokens).toHaveBeenCalled();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Not Authenticated'
    );
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    console.error = originalError;
  });
});
