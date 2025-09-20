// src/domains/auth/components/__tests__/RegisterForm.test.tsx - FIXED VERSION

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import type { SubmitHandler } from 'react-hook-form';
import { RegisterForm } from '../RegisterForm';
import { useRegister } from '@/domains/auth/hooks/useRegister';
import { useAuth } from '@/domains/auth/hooks/useAuth';
import type { UseRegisterReturn } from '@/domains/auth/hooks/useRegister';

// Mock both hooks
vi.mock('@/domains/auth/hooks/useRegister');
vi.mock('@/domains/auth/hooks/useAuth');

const mockUseRegister = vi.mocked(useRegister);
const mockUseAuth = vi.mocked(useAuth);

// Helper to create a default mock return value for useRegister hook
const createMockRegisterHook = (
  overrides: Partial<UseRegisterReturn> = {}
): UseRegisterReturn => {
  const formState = {
    errors: {},
    isSubmitting: false,
    isValid: false,
    ...overrides.formState,
  };

  return {
    // Mock RHF methods
    register: vi.fn().mockImplementation((name) => ({ name })),
    handleSubmit: vi
      .fn()
      .mockImplementation(
        (onValid: SubmitHandler<any>) =>
          async (e?: React.BaseSyntheticEvent) => {
            e?.preventDefault();
            await onValid({}, e);
          }
      ),
    formState,
    watch: vi.fn(() => ({})),
    setValue: vi.fn(),
    trigger: vi.fn(),
    getValues: vi.fn(),
    scrollToFirstError: vi.fn(),

    // Mock step management state
    currentStep: 'personal',
    currentStepIndex: 0,
    totalSteps: 3,
    isFirstStep: true,
    isLastStep: false,
    steps: ['personal', 'role', 'terms'],

    // Mock navigation methods
    nextStep: vi.fn().mockResolvedValue(true),
    prevStep: vi.fn(),
    goToStep: vi.fn().mockResolvedValue(true),

    // Mock validation methods
    validateCurrentStep: vi.fn().mockResolvedValue(true),
    validateStep: vi.fn().mockResolvedValue(true),
    isStepValid: vi.fn().mockReturnValue(true),
    getStepErrors: vi.fn().mockReturnValue({}),
    clearStepErrors: vi.fn(),
    hasStepErrors: vi.fn().mockReturnValue(false),

    // Mock submission state
    onSubmit: vi.fn(),
    isSubmitting: false,
    // ✅ REMOVED: submitError, clearSubmitError, submitAttempts

    // Mock field management
    focusField: vi.fn(),
    fieldRefs: { current: {} },

    // Mock helper data
    roleOptions: [
      {
        value: 'owner',
        label: 'Property Owner',
        description: 'Owns a property',
      },
      {
        value: 'agent',
        label: 'Estate Agent',
        description: 'Works for an agency',
      },
    ],
    requiresOrganization: false,
    isOrganizationDataValid: true,

    // Apply any test-specific overrides
    ...overrides,
  } as unknown as UseRegisterReturn;
};

// Helper to create mock useAuth return value
const createMockAuthHook = (overrides: any = {}) => ({
  user: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,
  clearError: vi.fn(),
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
  hasPermission: vi.fn(),
  hasRole: vi.fn(),
  hasAnyPermission: vi.fn(),
  ...overrides,
});

// Test wrapper for Router context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    mockUseAuth.mockReturnValue(createMockAuthHook());
    mockUseRegister.mockReturnValue(createMockRegisterHook());
  });

  it('should render the personal info step by default', () => {
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    );

    expect(screen.getByText('Create Your Account')).toBeInTheDocument();
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
  });

  it('should display different steps based on currentStep', () => {
    mockUseRegister.mockReturnValue(
      createMockRegisterHook({
        currentStep: 'role',
        currentStepIndex: 1,
        isFirstStep: false,
      })
    );

    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    );

    expect(
      screen.getByRole('heading', { name: /select your role/i })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument();
  });

  it('should call prevStep when the "Previous" button is clicked', async () => {
    const user = userEvent.setup();
    const mockPrevStep = vi.fn();

    mockUseRegister.mockReturnValue(
      createMockRegisterHook({
        currentStep: 'role',
        isFirstStep: false,
        prevStep: mockPrevStep,
      })
    );

    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button', { name: /previous/i }));
    expect(mockPrevStep).toHaveBeenCalled();
  });

  it('should show the submit button on the last step', () => {
    mockUseRegister.mockReturnValue(
      createMockRegisterHook({
        currentStep: 'terms',
        isLastStep: true,
      })
    );

    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    );

    expect(
      screen.getByRole('button', { name: /create account/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /continue/i })
    ).not.toBeInTheDocument();
  });

  it('should call handleSubmit and onSubmit when the form is submitted', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    const mockHandleSubmit = vi
      .fn()
      .mockImplementation((onValid: SubmitHandler<any>) => {
        return async (e?: React.BaseSyntheticEvent) => {
          e?.preventDefault();
          await onValid({}, e);
        };
      });

    mockUseRegister.mockReturnValue(
      createMockRegisterHook({
        currentStep: 'terms',
        isLastStep: true,
        onSubmit: mockOnSubmit,
        handleSubmit: mockHandleSubmit,
      })
    );

    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(mockHandleSubmit).toHaveBeenCalledWith(mockOnSubmit);
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('should display error message from useAuth', () => {
    // ✅ FIXED: Mock error from useAuth, not useRegister
    mockUseAuth.mockReturnValue(
      createMockAuthHook({
        error: 'This email is already in use.',
      })
    );

    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    );

    expect(screen.getByText('Registration failed')).toBeInTheDocument();
    expect(
      screen.getByText('This email is already in use.')
    ).toBeInTheDocument();
    // ✅ REMOVED: submitAttempts check (no longer tracked)
  });

  it('should clear error when step changes', () => {
    const mockClearError = vi.fn();

    mockUseAuth.mockReturnValue(
      createMockAuthHook({
        error: 'Some error',
        clearError: mockClearError,
      })
    );

    const { rerender } = render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    );

    // Change step
    mockUseRegister.mockReturnValue(
      createMockRegisterHook({
        currentStep: 'role',
        currentStepIndex: 1,
      })
    );

    rerender(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    );

    // Should call clearError when step changes and there's an error
    expect(mockClearError).toHaveBeenCalled();
  });

  it('should handle form submission with loading state', () => {
    mockUseRegister.mockReturnValue(
      createMockRegisterHook({
        currentStep: 'terms',
        isLastStep: true,
        isSubmitting: true,
      })
    );

    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', {
      name: /creating account/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it('should render step progress correctly', () => {
    mockUseRegister.mockReturnValue(
      createMockRegisterHook({
        currentStep: 'role',
        currentStepIndex: 1,
        totalSteps: 3,
      })
    );

    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    );

    // Check that step progress is displayed
    expect(screen.getByText('Role Selection')).toBeInTheDocument();
  });
});
