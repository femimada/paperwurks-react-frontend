// src/features/auth/components/__tests__/RegisterForm.test.tsx

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import type { SubmitHandler } from 'react-hook-form';
import { RegisterForm } from '../RegisterForm';
import { useRegister } from '@/domains/auth/hooks/useRegister';
import type { UseRegisterReturn } from '@/domains/auth/hooks/useRegister';

// Mock the useRegister hook
vi.mock('@/domains/auth/hooks/useRegister');

const mockUseRegister = vi.mocked(useRegister);

// Helper to create a default mock return value for the hook.
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
            // Call the provided callback with empty data, as the component doesn't use it.
            await onValid({}, e);
          }
      ),
    formState,
    watch: vi.fn(() => ({})), // Return an empty object for watched values
    setValue: vi.fn(),
    scrollToFirstError: vi.fn(),

    // Mock step management state
    currentStep: 'personal',
    currentStepIndex: 0,
    totalSteps: 3,
    isFirstStep: true,
    isLastStep: false,

    // Mock navigation methods
    nextStep: vi.fn().mockResolvedValue(true),
    prevStep: vi.fn(),

    // Mock validation state
    isStepValid: vi.fn().mockReturnValue(true),

    // Mock submission state
    onSubmit: vi.fn(),
    isSubmitting: false,
    submitError: null,
    clearSubmitError: vi.fn(),
    submitAttempts: 0,

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

    // Apply any test-specific overrides
    ...overrides,
  } as unknown as UseRegisterReturn;
};

// A simple wrapper to provide the necessary Router context for <Link> components.
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('RegisterForm', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure isolation.
    vi.clearAllMocks();
  });

  it('should render the first step (Personal Info) by default', () => {
    mockUseRegister.mockReturnValue(createMockRegisterHook());
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    );

    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/what is your role/i)
    ).not.toBeInTheDocument();
  });

  it('should show the correct step in the progress indicator', () => {
    mockUseRegister.mockReturnValue(createMockRegisterHook());
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    );

    // --- CHANGE 1 START ---
    // The visual highlight is on an element with aria-label, not the sr-only span
    expect(
      screen.getByLabelText('Personal Info: Current') ||
        screen.getByLabelText('Personal Info: Completed')
    ).toHaveClass('bg-blue-600'); // Check for the background class
    // --- CHANGE 1 END ---
    expect(
      screen.getByLabelText('Role Selection: Not started')
    ).not.toHaveClass('bg-blue-600');
  });

  it('should call nextStep when the "Continue" button is clicked', async () => {
    const user = userEvent.setup();
    const mockNextStep = vi.fn().mockResolvedValue(true);
    mockUseRegister.mockReturnValue(
      createMockRegisterHook({ nextStep: mockNextStep })
    );

    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    );

    const continueButton = screen.getByRole('button', { name: /continue/i });
    await user.click(continueButton);

    expect(mockNextStep).toHaveBeenCalled();
  });

  it('should call scrollToFirstError if nextStep fails (simulating validation error)', async () => {
    const user = userEvent.setup();
    const mockNextStep = vi.fn().mockResolvedValue(false);
    const mockScroll = vi.fn();
    mockUseRegister.mockReturnValue(
      createMockRegisterHook({
        nextStep: mockNextStep,
        scrollToFirstError: mockScroll,
      })
    );

    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(mockNextStep).toHaveBeenCalled();
    expect(mockScroll).toHaveBeenCalled();
  });

  it('should display the RoleSelectionStep when currentStep is "role"', () => {
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

    // --- CHANGE 2 START ---
    // Check for the visible heading specific to the Role Selection step.
    expect(
      screen.getByRole('heading', { name: /select your role/i })
    ).toBeInTheDocument();
    // Check that a field from the personal info step is NOT present.
    expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument();
    // --- CHANGE 2 END ---
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

    const mockHandleSubmitImplementation = (onValid: SubmitHandler<any>) => {
      return async (e?: React.BaseSyntheticEvent) => {
        e?.preventDefault();
        await onValid({}, e);
      };
    };
    const mockHandleSubmit = vi
      .fn()
      .mockImplementation(mockHandleSubmitImplementation);

    mockUseRegister.mockReturnValue(
      createMockRegisterHook({
        currentStep: 'terms',
        isLastStep: true,
        onSubmit: mockOnSubmit,
        handleSubmit: mockHandleSubmit,
        isStepValid: vi.fn().mockReturnValue(true),
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

  it('should display a submission error message when provided', () => {
    mockUseRegister.mockReturnValue(
      createMockRegisterHook({
        submitError: 'This email is already in use.',
        submitAttempts: 2,
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
    expect(screen.getByText(/attempt 2/i)).toBeInTheDocument();
  });
});
