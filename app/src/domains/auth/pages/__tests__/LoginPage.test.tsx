// src/pages/auth/__tests__/LoginPage.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../LoginPage';

// Mock the auth hook
const mockUseAuth = vi.fn();
vi.mock('@/domains/auth/hooks', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the LoginForm component
vi.mock('@/domains/auth/components/LoginForm', () => ({
  LoginForm: vi.fn(({ showCard }) => (
    <div data-testid="login-form">
      LoginForm Component {showCard === false && '(no card)'}
    </div>
  )),
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

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('should render login page when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Check page structure
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.getByText('Sign in to Paperwurks')).toBeInTheDocument();
    expect(
      screen.getByText('Welcome back! Enter your credentials to continue.')
    ).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('should redirect to dashboard when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('should render logo', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const logo = screen.getByLabelText('Paperwurks logo');
    expect(logo).toBeInTheDocument();
  });

  it('should pass showCard=false to LoginForm', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/no card/)).toBeInTheDocument();
  });
});
