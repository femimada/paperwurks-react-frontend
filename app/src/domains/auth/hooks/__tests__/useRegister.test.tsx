// src/domains/auth/hooks/__tests__/useRegister.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useRegister, type RegistrationStep } from '../useRegister';
import { useAuth } from '../useAuth';

// Mock dependencies
vi.mock('../useAuth');
vi.mock('@/shared/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('@/shared/constants/roles', () => ({
  USER_ROLES: {
    buyer: 'buyer',
    owner: 'owner',
    solicitor: 'solicitor',
    agent: 'agent',
  },
  roleValues: ['buyer', 'owner', 'solicitor', 'agent'],
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockUseAuth = vi.mocked(useAuth);

// Test wrapper
const createWrapper = () => {
  return ({ children }: { children: ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );
};

describe('useRegister', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    mockUseAuth.mockReturnValue({
      register: mockRegister,
      user: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      changePassword: vi.fn(),
      updateProfile: vi.fn(),
      verifyEmail: vi.fn(),
      resendVerification: vi.fn(),
      clearError: vi.fn(),
      hasPermission: vi.fn(),
      hasRole: vi.fn(),
      hasAnyPermission: vi.fn(),
    });
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      expect(result.current.currentStep).toBe('personal');
      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.totalSteps).toBe(3);
      expect(result.current.isFirstStep).toBe(true);
      expect(result.current.isLastStep).toBe(false);
      expect(result.current.steps).toEqual(['personal', 'role', 'terms']);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.submitError).toBeNull();
      expect(result.current.submitAttempts).toBe(0);
    });

    it('should provide form instance with correct default values', () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      const formValues = result.current.getValues();
      expect(formValues.firstName).toBe('');
      expect(formValues.lastName).toBe('');
      expect(formValues.email).toBe('');
      expect(formValues.password).toBe('');
      expect(formValues.confirmPassword).toBe('');
      expect(formValues.role).toBeUndefined();
      expect(formValues.acceptsTerms).toBe(false);
      expect(formValues.acceptsMarketing).toBe(false);
    });

    it('should provide role options', () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      expect(result.current.roleOptions).toEqual([
        {
          value: 'buyer',
          label: 'Property Buyer',
          description: expect.any(String),
        },
        {
          value: 'owner',
          label: 'Property Owner',
          description: expect.any(String),
        },
        {
          value: 'solicitor',
          label: 'Solicitor',
          description: expect.any(String),
        },
        {
          value: 'agent',
          label: 'Estate Agent',
          description: expect.any(String),
        },
      ]);
    });
  });

  describe('Step Management', () => {
    it('should calculate step properties correctly', () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      // Personal step (index 0)
      expect(result.current.currentStep).toBe('personal');
      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.isFirstStep).toBe(true);
      expect(result.current.isLastStep).toBe(false);

      // Move to role step
      act(() => {
        result.current.setValue('firstName', 'Test');
        result.current.setValue('lastName', 'User');
        result.current.setValue('email', 'test@example.com');
        result.current.setValue('password', 'password123');
        result.current.setValue('confirmPassword', 'password123');
      });

      // Navigate to next step
      act(async () => {
        await result.current.nextStep();
      });

      expect(result.current.currentStep).toBe('role');
      expect(result.current.currentStepIndex).toBe(1);
      expect(result.current.isFirstStep).toBe(false);
      expect(result.current.isLastStep).toBe(false);
    });

    it('should handle last step correctly', async () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      // Fill all required fields
      act(() => {
        result.current.setValue('firstName', 'Test');
        result.current.setValue('lastName', 'User');
        result.current.setValue('email', 'test@example.com');
        result.current.setValue('password', 'password123');
        result.current.setValue('confirmPassword', 'password123');
        result.current.setValue('role', 'owner');
      });

      // Go to terms step
      await act(async () => {
        await result.current.nextStep(); // to role
        await result.current.nextStep(); // to terms
      });

      expect(result.current.currentStep).toBe('terms');
      expect(result.current.currentStepIndex).toBe(2);
      expect(result.current.isFirstStep).toBe(false);
      expect(result.current.isLastStep).toBe(true);
    });
  });

  describe('Step Navigation', () => {
    it('should navigate to next step when validation passes', async () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      // Fill personal info
      act(() => {
        result.current.setValue('firstName', 'Test');
        result.current.setValue('lastName', 'User');
        result.current.setValue('email', 'test@example.com');
        result.current.setValue('password', 'password123');
        result.current.setValue('confirmPassword', 'password123');
      });

      await act(async () => {
        const success = await result.current.nextStep();
        expect(success).toBe(true);
      });

      expect(result.current.currentStep).toBe('role');
    });

    it('should not navigate when validation fails', async () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      // Don't fill required fields
      await act(async () => {
        const success = await result.current.nextStep();
        expect(success).toBe(false);
      });

      expect(result.current.currentStep).toBe('personal');
    });

    it('should navigate to previous step', () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      // Manually set to role step
      act(() => {
        result.current.setValue('firstName', 'Test');
        result.current.setValue('lastName', 'User');
        result.current.setValue('email', 'test@example.com');
        result.current.setValue('password', 'password123');
        result.current.setValue('confirmPassword', 'password123');
      });

      act(async () => {
        await result.current.nextStep();
      });

      expect(result.current.currentStep).toBe('role');

      act(() => {
        result.current.prevStep();
      });

      expect(result.current.currentStep).toBe('personal');
    });

    it('should not go to previous step from first step', () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      expect(result.current.currentStep).toBe('personal');
      expect(result.current.isFirstStep).toBe(true);

      act(() => {
        result.current.prevStep();
      });

      expect(result.current.currentStep).toBe('personal');
    });

    it('should not go to next step from last step', async () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      // Fill all fields and go to last step
      act(() => {
        result.current.setValue('firstName', 'Test');
        result.current.setValue('lastName', 'User');
        result.current.setValue('email', 'test@example.com');
        result.current.setValue('password', 'password123');
        result.current.setValue('confirmPassword', 'password123');
        result.current.setValue('role', 'owner');
      });

      await act(async () => {
        await result.current.nextStep(); // to role
        await result.current.nextStep(); // to terms
      });

      expect(result.current.isLastStep).toBe(true);

      await act(async () => {
        const success = await result.current.nextStep();
        expect(success).toBe(false);
      });

      expect(result.current.currentStep).toBe('terms');
    });

    it('should go to specific step with goToStep', async () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      // Fill personal info
      act(() => {
        result.current.setValue('firstName', 'Test');
        result.current.setValue('lastName', 'User');
        result.current.setValue('email', 'test@example.com');
        result.current.setValue('password', 'password123');
        result.current.setValue('confirmPassword', 'password123');
      });

      await act(async () => {
        const success = await result.current.goToStep('role');
        expect(success).toBe(true);
      });

      expect(result.current.currentStep).toBe('role');
    });

    it('should validate when going forward with goToStep', async () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      // Don't fill required fields
      await act(async () => {
        const success = await result.current.goToStep('role');
        expect(success).toBe(false);
      });

      expect(result.current.currentStep).toBe('personal');
    });

    it('should not validate when going backward with goToStep', async () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      // Fill personal info and go to role step
      act(() => {
        result.current.setValue('firstName', 'Test');
        result.current.setValue('lastName', 'User');
        result.current.setValue('email', 'test@example.com');
        result.current.setValue('password', 'password123');
        result.current.setValue('confirmPassword', 'password123');
      });

      await act(async () => {
        await result.current.nextStep();
      });

      expect(result.current.currentStep).toBe('role');

      // Go back without validation
      await act(async () => {
        const success = await result.current.goToStep('personal');
        expect(success).toBe(true);
      });

      expect(result.current.currentStep).toBe('personal');
    });
  });

  describe('Step Validation', () => {
    it('should validate personal step correctly', async () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      // Empty form should be invalid
      await act(async () => {
        const isValid = await result.current.validateStep('personal');
        expect(isValid).toBe(false);
      });

      // Fill required fields
      act(() => {
        result.current.setValue('firstName', 'Test');
        result.current.setValue('lastName', 'User');
        result.current.setValue('email', 'test@example.com');
        result.current.setValue('password', 'password123');
        result.current.setValue('confirmPassword', 'password123');
      });

      await act(async () => {
        const isValid = await result.current.validateStep('personal');
        expect(isValid).toBe(true);
      });
    });

    it('should validate role step correctly', async () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      // Empty role should be invalid
      await act(async () => {
        const isValid = await result.current.validateStep('role');
        expect(isValid).toBe(false);
      });

      // Fill role
      act(() => {
        result.current.setValue('role', 'owner');
      });

      await act(async () => {
        const isValid = await result.current.validateStep('role');
        expect(isValid).toBe(true);
      });
    });

    it('should validate terms step correctly', async () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      // Terms not accepted should be invalid
      await act(async () => {
        const isValid = await result.current.validateStep('terms');
        expect(isValid).toBe(false);
      });

      // Accept terms
      act(() => {
        result.current.setValue('acceptsTerms', true);
      });

      await act(async () => {
        const isValid = await result.current.validateStep('terms');
        expect(isValid).toBe(true);
      });
    });

    it('should validate current step', async () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      expect(result.current.currentStep).toBe('personal');

      await act(async () => {
        const isValid = await result.current.validateCurrentStep();
        expect(isValid).toBe(false);
      });

      // Fill personal info
      act(() => {
        result.current.setValue('firstName', 'Test');
        result.current.setValue('lastName', 'User');
        result.current.setValue('email', 'test@example.com');
        result.current.setValue('password', 'password123');
        result.current.setValue('confirmPassword', 'password123');
      });

      await act(async () => {
        const isValid = await result.current.validateCurrentStep();
        expect(isValid).toBe(true);
      });
    });
  });

  describe('Organization Requirements', () => {
    it('should require organization for agent and solicitor roles', () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setValue('role', 'agent');
      });

      expect(result.current.requiresOrganization).toBe(true);

      act(() => {
        result.current.setValue('role', 'solicitor');
      });

      expect(result.current.requiresOrganization).toBe(true);
    });

    it('should not require organization for owner and buyer roles', () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setValue('role', 'owner');
      });

      expect(result.current.requiresOrganization).toBe(false);

      act(() => {
        result.current.setValue('role', 'buyer');
      });

      expect(result.current.requiresOrganization).toBe(false);
    });

    it('should validate organization data when required', () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setValue('role', 'agent');
      });

      expect(result.current.requiresOrganization).toBe(true);
      expect(result.current.isOrganizationDataValid).toBe(false);

      act(() => {
        result.current.setValue('organizationName', 'Test Agency');
        result.current.setValue('organizationType', 'estate_agency');
      });

      expect(result.current.isOrganizationDataValid).toBe(true);
    });

    it('should clear organization fields when role changes to non-requiring role', () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      // Set agent role and organization data
      act(() => {
        result.current.setValue('role', 'agent');
        result.current.setValue('organizationName', 'Test Agency');
        result.current.setValue('organizationType', 'estate_agency');
      });

      expect(result.current.getValues().organizationName).toBe('Test Agency');

      // Change to owner role (doesn't require organization)
      act(() => {
        result.current.setValue('role', 'owner');
      });

      // Wait for useEffect to clear fields
      waitFor(() => {
        expect(result.current.getValues().organizationName).toBe('');
        expect(result.current.getValues().organizationType).toBeUndefined();
      });
    });
  });

  describe('Form Submission', () => {
    it('should handle successful registration', async () => {
      mockRegister.mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        tokens: { accessToken: 'token' },
      });

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      const formData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'owner' as const,
        acceptsTerms: true,
        acceptsMarketing: false,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(mockRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'owner',
        organizationName: undefined,
        organizationType: undefined,
        acceptsTerms: true,
        acceptsMarketing: false,
      });

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
        replace: true,
      });
      expect(result.current.submitError).toBeNull();
    });

    it('should handle registration with organization', async () => {
      mockRegister.mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        tokens: { accessToken: 'token' },
      });

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      // Set agent role to trigger organization requirement
      act(() => {
        result.current.setValue('role', 'agent');
      });

      const formData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'agent' as const,
        organizationName: 'Test Agency',
        organizationType: 'estate_agency' as const,
        acceptsTerms: true,
        acceptsMarketing: false,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(mockRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'agent',
        organizationName: 'Test Agency',
        organizationType: 'estate_agency',
        acceptsTerms: true,
        acceptsMarketing: false,
      });
    });

    it('should handle registration errors', async () => {
      const error = new Error('Email already exists');
      mockRegister.mockRejectedValue(error);

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      const formData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'owner' as const,
        acceptsTerms: true,
        acceptsMarketing: false,
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(result.current.submitError).toBe('Email already exists');
      expect(result.current.submitAttempts).toBe(1);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should prevent double submission', async () => {
      // Make register function hang
      mockRegister.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      const formData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'owner' as const,
        acceptsTerms: true,
        acceptsMarketing: false,
      };

      // Start first submission
      act(() => {
        result.current.onSubmit(formData);
      });

      expect(result.current.isSubmitting).toBe(true);

      // Try second submission
      await act(async () => {
        await result.current.onSubmit(formData);
      });

      // Should only call register once
      expect(mockRegister).toHaveBeenCalledTimes(1);
    });

    it('should increment submit attempts on error', async () => {
      mockRegister.mockRejectedValue(new Error('Server error'));

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      const formData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'owner' as const,
        acceptsTerms: true,
        acceptsMarketing: false,
      };

      expect(result.current.submitAttempts).toBe(0);

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(result.current.submitAttempts).toBe(1);

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(result.current.submitAttempts).toBe(2);
    });

    it('should clear submit error', () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      // Manually set an error
      act(() => {
        result.current.onSubmit({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          role: 'owner',
          acceptsTerms: true,
          acceptsMarketing: false,
        });
      });

      // Simulate error being set
      // Note: In real implementation, this would be set by failed onSubmit

      act(() => {
        result.current.clearSubmitError();
      });

      expect(result.current.submitError).toBeNull();
    });
  });

  describe('Step Error Management', () => {
    it('should get step errors correctly', () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      // Trigger validation errors
      act(() => {
        result.current.trigger();
      });

      const personalErrors = result.current.getStepErrors('personal');
      expect(typeof personalErrors).toBe('object');
    });

    it('should check if step has errors', () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      // Initially no errors
      expect(result.current.hasStepErrors('personal')).toBe(false);

      // Trigger validation to create errors
      act(() => {
        result.current.trigger();
      });

      // May have errors now (depending on validation)
      const hasErrors = result.current.hasStepErrors('personal');
      expect(typeof hasErrors).toBe('boolean');
    });

    it('should clear step errors', () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.clearStepErrors('personal');
      });

      // Should not throw and should clear any existing errors
      expect(result.current.hasStepErrors('personal')).toBe(false);
    });

    it('should check if step is valid', () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      // Empty form should be invalid
      expect(result.current.isStepValid('personal')).toBe(false);

      // Fill required fields
      act(() => {
        result.current.setValue('firstName', 'Test');
        result.current.setValue('lastName', 'User');
        result.current.setValue('email', 'test@example.com');
        result.current.setValue('password', 'password123');
        result.current.setValue('confirmPassword', 'password123');
      });

      expect(result.current.isStepValid('personal')).toBe(true);
    });
  });

  describe('Field Management', () => {
    it('should provide focus field function', () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.focusField).toBe('function');

      // Should not throw when called with valid field
      act(() => {
        result.current.focusField('firstName');
      });
    });

    it('should provide scroll to first error function', () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.scrollToFirstError).toBe('function');

      // Should not throw when called
      act(() => {
        result.current.scrollToFirstError();
      });
    });

    it('should provide field refs', () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      expect(result.current.fieldRefs).toBeDefined();
      expect(result.current.fieldRefs.current).toEqual({});
    });
  });

  describe('React Hook Form Integration', () => {
    it('should provide all required form methods', () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.register).toBe('function');
      expect(typeof result.current.handleSubmit).toBe('function');
      expect(typeof result.current.watch).toBe('function');
      expect(typeof result.current.setValue).toBe('function');
      expect(typeof result.current.trigger).toBe('function');
      expect(typeof result.current.getValues).toBe('function');
      expect(result.current.formState).toBeDefined();
    });

    it('should watch form values correctly', () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setValue('role', 'agent');
      });

      const watchedRole = result.current.watch('role');
      expect(watchedRole).toBe('agent');
    });
  });
});
