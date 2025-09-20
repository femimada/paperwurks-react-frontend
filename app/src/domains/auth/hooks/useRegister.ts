// src/domains/auth/hooks/useRegister.ts - FIXED TO ALIGN WITH RESPONSIBILITY MODEL

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/domains/auth/hooks';
import { logger } from '@/shared/utils/logger';
import type { UserRole } from '@/shared/types/global.types';
import type { UseFormReturn } from 'react-hook-form';
import {
  type RegisterFormData,
  RegisterSchema,
} from '@/domains/auth/utils/validation/authSchema';

// ============== Types ==============
export type RegistrationStep = 'personal' | 'role' | 'terms';
const STEPS: RegistrationStep[] = ['personal', 'role', 'terms'];

// Step-specific schemas for validation
const PersonalInfoSchema = RegisterSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  password: true,
  confirmPassword: true,
});

const RoleSelectionSchema = RegisterSchema.pick({
  role: true,
  organizationName: true,
  organizationType: true,
});

const TermsSchema = RegisterSchema.pick({
  acceptsTerms: true,
  acceptsMarketing: true,
});

// Map steps to their field names
const STEP_FIELDS: Record<RegistrationStep, (keyof RegisterFormData)[]> = {
  personal: Object.keys(PersonalInfoSchema.shape) as (keyof RegisterFormData)[],
  role: Object.keys(RoleSelectionSchema.shape) as (keyof RegisterFormData)[],
  terms: Object.keys(TermsSchema.shape) as (keyof RegisterFormData)[],
};

// ============== Hook Return Type ==============

export interface UseRegisterReturn
  extends Pick<
    UseFormReturn<RegisterFormData>,
    | 'register'
    | 'handleSubmit'
    | 'formState'
    | 'watch'
    | 'setValue'
    | 'trigger'
    | 'getValues'
  > {
  // Step management
  currentStep: RegistrationStep;
  currentStepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  steps: RegistrationStep[];

  // Navigation
  nextStep: () => Promise<boolean>;
  prevStep: () => void;
  goToStep: (step: RegistrationStep) => Promise<boolean>;

  // Validation
  validateCurrentStep: () => Promise<boolean>;
  validateStep: (step: RegistrationStep) => Promise<boolean>;
  isStepValid: (step: RegistrationStep) => boolean;
  getStepErrors: (step: RegistrationStep) => FieldErrors<RegisterFormData>;
  clearStepErrors: (step: RegistrationStep) => void;
  hasStepErrors: (step: RegistrationStep) => boolean;

  // Submission
  onSubmit: (data: RegisterFormData) => Promise<void>;
  isSubmitting: boolean;

  // Field management
  focusField: (field: keyof RegisterFormData) => void;
  scrollToFirstError: () => void;
  fieldRefs: React.RefObject<
    Partial<Record<keyof RegisterFormData, HTMLElement | null>>
  >;

  // Helper data
  roleOptions: Array<{
    value: UserRole;
    label: string;
    description: string;
  }>;
  requiresOrganization: boolean;
  isOrganizationDataValid: boolean;
}

// ============== Hook Implementation ==============

export const useRegister = (): UseRegisterReturn => {
  const {
    register: registerUser,
    error,
    isLoading,
    isAuthenticated,
    clearError,
  } = useAuth();
  const navigate = useNavigate();

  // State - ONLY form/UI state, no error state
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastRegistrationAttempt, setLastRegistrationAttempt] = useState<{
    email: string;
    timestamp: number;
  } | null>(null);

  // Form setup
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: undefined,
      organizationName: '',
      organizationType: undefined,
      acceptsTerms: false,
      acceptsMarketing: false,
    },
  });

  const {
    register,
    handleSubmit,
    formState,
    watch,
    setValue,
    trigger,
    getValues,
    clearErrors,
  } = form;

  // Field refs for focus management
  const fieldRefs = useRef<
    Partial<Record<keyof RegisterFormData, HTMLElement | null>>
  >({});

  // ============== Computed Values ==============

  const currentStepIndex = STEPS.indexOf(currentStep);
  const totalSteps = STEPS.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Watch individual fields (not as array to avoid TypeScript issues)
  const watchedRole = watch('role');
  const watchedOrgName = watch('organizationName');
  const watchedOrgType = watch('organizationType');

  const roleOptions = useMemo(
    () => [
      {
        value: 'buyer' as UserRole,
        label: 'Property Buyer',
        description: 'Looking to purchase property',
      },
      {
        value: 'owner' as UserRole,
        label: 'Property Owner',
        description: 'Own property and need due diligence',
      },
      {
        value: 'solicitor' as UserRole,
        label: 'Solicitor',
        description: 'Legal professional reviewing property packs',
      },
      {
        value: 'agent' as UserRole,
        label: 'Estate Agent',
        description: 'Real estate professional managing sales',
      },
    ],
    []
  );

  const requiresOrganization = useMemo(() => {
    return watchedRole === 'agent' || watchedRole === 'solicitor';
  }, [watchedRole]);

  const isOrganizationDataValid = useMemo(() => {
    if (!requiresOrganization) return true;
    return !!(watchedOrgName?.trim() && watchedOrgType);
  }, [requiresOrganization, watchedOrgName, watchedOrgType]);

  // ============== Auth State Response (Following useLogin Pattern) ==============

  useEffect(() => {
    if (!lastRegistrationAttempt || isLoading) {
      return;
    }

    const sanitizedEmail = lastRegistrationAttempt.email.replace(
      /@.*/,
      '@[redacted]'
    );

    if (isAuthenticated && !error) {
      // Registration was successful
      logger.info('Registration successful', { email: sanitizedEmail });
      navigate('/dashboard', { replace: true });
      setLastRegistrationAttempt(null); // Clear the attempt
    } else if (error && !isLoading) {
      // Registration failed with error
      logger.error('Registration failed', {
        email: sanitizedEmail,
        error: error,
      });
      setLastRegistrationAttempt(null); // Clear the attempt
      // Scroll to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isAuthenticated, error, isLoading, lastRegistrationAttempt, navigate]);

  // ============== Effects ==============

  // Clear organization fields when role changes to one that doesn't require them
  useEffect(() => {
    if (!requiresOrganization) {
      setValue('organizationName', '');
      setValue('organizationType', undefined);
      clearErrors(['organizationName', 'organizationType']);
    }
  }, [requiresOrganization, setValue, clearErrors]);

  // Clear auth error on step change
  useEffect(() => {
    clearError();
  }, [currentStep, clearError]);

  // Register field refs for focus management
  const registerWithRef = useCallback(
    (name: keyof RegisterFormData) => {
      const registration = register(name);
      return {
        ...registration,
        ref: (el: HTMLElement | null) => {
          fieldRefs.current[name] = el;
          registration.ref(el as any);
        },
      };
    },
    [register]
  );

  // ============== Validation Methods ==============

  const validateStep = useCallback(
    async (step: RegistrationStep): Promise<boolean> => {
      const fields = STEP_FIELDS[step];
      const result = await trigger(fields);

      if (!result) {
        logger.debug('Step validation failed', { step, fields });
      }

      return result;
    },
    [trigger]
  );

  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    return validateStep(currentStep);
  }, [currentStep, validateStep]);

  const isStepValid = useCallback(
    (step: RegistrationStep): boolean => {
      const fields = STEP_FIELDS[step];
      const errors = formState.errors;

      // Check if all fields in the step are error-free
      const hasErrors = fields.some((field) => errors[field]);

      // Special handling for organization fields
      if (step === 'role' && requiresOrganization) {
        return !hasErrors && isOrganizationDataValid;
      }

      return !hasErrors;
    },
    [formState.errors, requiresOrganization, isOrganizationDataValid]
  );

  const getStepErrors = useCallback(
    (step: RegistrationStep): FieldErrors<RegisterFormData> => {
      const fields = STEP_FIELDS[step];
      const errors: FieldErrors<RegisterFormData> = {};

      fields.forEach((field) => {
        if (formState.errors[field]) {
          errors[field] = formState.errors[field];
        }
      });

      return errors;
    },
    [formState.errors]
  );

  const hasStepErrors = useCallback(
    (step: RegistrationStep): boolean => {
      const errors = getStepErrors(step);
      return Object.keys(errors).length > 0;
    },
    [getStepErrors]
  );

  const clearStepErrors = useCallback(
    (step: RegistrationStep): void => {
      const fields = STEP_FIELDS[step];
      clearErrors(fields);
    },
    [clearErrors]
  );

  // ============== Field Management Methods ==============

  const focusField = useCallback((field: keyof RegisterFormData): void => {
    const element = fieldRefs.current[field];
    if (element) {
      element.focus();
      if (typeof element.scrollIntoView === 'function') {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        logger.warn('scrollIntoView is not available for field:', field);
      }
    }
  }, []);

  const scrollToFirstError = useCallback((): void => {
    const firstErrorField = Object.keys(
      formState.errors
    )[0] as keyof RegisterFormData;
    if (firstErrorField) {
      focusField(firstErrorField);
    }
  }, [formState.errors, focusField]);

  // ============== Navigation Methods ==============

  const goToStep = useCallback(
    async (step: RegistrationStep): Promise<boolean> => {
      const targetIndex = STEPS.indexOf(step);

      if (targetIndex < 0) {
        logger.error('Invalid step', { step });
        return false;
      }

      // If moving forward, validate current step
      if (targetIndex > currentStepIndex) {
        const isValid = await validateCurrentStep();
        if (!isValid) {
          scrollToFirstError();
          return false;
        }
      }

      setCurrentStep(step);

      // Focus first field in new step
      setTimeout(() => {
        const firstField = STEP_FIELDS[step][0];
        focusField(firstField);
      }, 100);

      return true;
    },
    [currentStepIndex, validateCurrentStep, scrollToFirstError, focusField]
  );

  const nextStep = useCallback(async (): Promise<boolean> => {
    if (isLastStep) return false;

    const isValid = await validateCurrentStep();
    if (!isValid) {
      scrollToFirstError();
      return false;
    }

    const nextStepIndex = currentStepIndex + 1;
    return goToStep(STEPS[nextStepIndex]);
  }, [
    isLastStep,
    currentStepIndex,
    validateCurrentStep,
    scrollToFirstError,
    goToStep,
  ]);

  const prevStep = useCallback((): void => {
    if (!isFirstStep) {
      const prevStepIndex = currentStepIndex - 1;
      setCurrentStep(STEPS[prevStepIndex]);

      // Focus first field in previous step
      setTimeout(() => {
        const firstField = STEP_FIELDS[STEPS[prevStepIndex]][0];
        focusField(firstField);
      }, 100);
    }
  }, [isFirstStep, currentStepIndex, focusField]);

  // ============== Submission (Following Responsibility Model) ==============

  const onSubmit = useCallback(
    async (data: RegisterFormData): Promise<void> => {
      // Prevent double submission
      if (isSubmitting) {
        logger.warn('Registration already in progress');
        return;
      }

      setIsSubmitting(true);

      const sanitizedEmail = data.email.replace(/@.*/, '@[redacted]');
      logger.debug('Registration attempt started', { email: sanitizedEmail });

      // Track this registration attempt
      setLastRegistrationAttempt({
        email: data.email,
        timestamp: Date.now(),
      });

      // Clear any previous errors before submission
      clearError();

      // Prepare organization data if required
      const organization = requiresOrganization
        ? {
            name: data.organizationName?.trim() || '',
            type: data.organizationType,
          }
        : undefined;

      // Call AuthContext register - follows responsibility model (never throws)
      await registerUser({
        email: data.email.toLowerCase().trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        role: data.role,
        organizationName: organization?.name,
        organizationType: organization?.type,
        acceptsTerms: data.acceptsTerms,
        acceptsMarketing: data.acceptsMarketing,
      });

      // Note: Success/error handling is now in useEffect above
      // which responds to auth context state changes

      setIsSubmitting(false);
    },
    [isSubmitting, requiresOrganization, registerUser, clearError]
  );

  // ============== Return ==============

  return {
    // Form methods
    register: registerWithRef as any, // Cast to avoid type issues with ref
    handleSubmit,
    formState,
    watch,
    setValue,
    trigger,
    getValues,

    // Step management
    currentStep,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    steps: STEPS,

    // Navigation
    nextStep,
    prevStep,
    goToStep,

    // Validation
    validateCurrentStep,
    validateStep,
    isStepValid,
    getStepErrors,
    clearStepErrors,
    hasStepErrors,

    // Submission - FOLLOWS RESPONSIBILITY MODEL
    onSubmit,
    isSubmitting,
    // Field management
    focusField,
    scrollToFirstError,
    fieldRefs,

    // Helper data
    roleOptions,
    requiresOrganization,
    isOrganizationDataValid,
  };
};
