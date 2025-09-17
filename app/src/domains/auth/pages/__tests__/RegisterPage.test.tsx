// src/pages/auth/__tests__/RegisterPage.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RegisterPage } from '../RegisterPage';

// Mock the auth hook
const mockUseAuth = vi.fn();
vi.mock('@/domains/auth/hooks', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the RegisterForm component
vi.mock('@/domains/auth/components/RegisterForm', () => ({
  RegisterForm: vi.fn(() => (
    <div data-testid="register-form">RegisterForm Component</div>
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

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('should render register page when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('register-page')).toBeInTheDocument();
    expect(screen.getByText('Join Paperwurks')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Create your account to get started with property documentation'
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });

  it('should redirect to dashboard when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <RegisterPage />
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
        <RegisterPage />
      </BrowserRouter>
    );

    const logo = screen.getByLabelText('Paperwurks logo');
    expect(logo).toBeInTheDocument();
  });
});
