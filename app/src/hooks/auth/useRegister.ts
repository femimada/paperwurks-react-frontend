// src/features/auth/hooks/useRegister.ts
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { logger } from '@/utils/logger';
import { USER_ROLES } from '@/constants/roles';
import type { UserRole } from '@/types/global.types';
import type { UseFormReturn } from 'react-hook-form';

// ============== Types ==============

export type RegistrationStep = 'personal' | 'role' | 'terms';

// ============== Constants ==============

const STEPS: RegistrationStep[] = ['personal', 'role', 'terms'];

// Derive role values from USER_ROLES (single source of truth)
const roleValues = Object.keys(USER_ROLES) as UserRole[];

// ============== Schemas ==============

// Full validation schema - single source of truth for form data
const RegisterSchema = z
  .object({
    // Personal Info
    firstName: z
      .string()
      .min(1, 'First name is required')
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters')
      .regex(
        /^[a-zA-Z\s'-]+$/,
        'First name can only contain letters, spaces, hyphens, and apostrophes'
      ),

    lastName: z
      .string()
      .min(1, 'Last name is required')
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters')
      .regex(
        /^[a-zA-Z\s'-]+$/,
        'Last name can only contain letters, spaces, hyphens, and apostrophes'
      ),

    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .toLowerCase()
      .trim(),

    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),

    confirmPassword: z.string().min(1, 'Please confirm your password'),

    role: z.enum(roleValues as [UserRole, ...UserRole[]]),

    organizationName: z.string().optional(),

    organizationType: z
      .enum(['estate_agency', 'law_firm', 'property_company'])
      .optional(),

    acceptsTerms: z
      .boolean()
      .refine(
        (val) => val === true,
        'You must accept the terms and conditions'
      ),

    acceptsMarketing: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      const requiresOrg = ['agent', 'solicitor'].includes(data.role);
      if (!requiresOrg) return true;
      return !!(data.organizationName?.trim() && data.organizationType);
    },
    {
      message: 'Organization details are required for this role',
      path: ['organizationName'],
    }
  );

// Infer form data type from schema
export type RegisterFormData = z.infer<typeof RegisterSchema>;

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
  submitError: string | null;
  clearSubmitError: () => void;
  submitAttempts: number;

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
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  // State
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('personal');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for field focus management
  const fieldRefs = useRef<
    Partial<Record<keyof RegisterFormData, HTMLElement | null>>
  >({});

  // React Hook Form
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'owner' as UserRole,
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
    clearErrors,
    getValues,
  } = form;

  const watchedValues = watch();

  // ============== Computed Values ==============

  const currentStepIndex = STEPS.indexOf(currentStep);
  const totalSteps = STEPS.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const roleOptions = useMemo(
    () =>
      roleValues.map((role) => ({
        value: role,
        label: USER_ROLES[role].label,
        description: USER_ROLES[role].description,
      })),
    []
  );

  const requiresOrganization = useMemo(
    () => ['agent', 'solicitor'].includes(watchedValues.role),
    [watchedValues.role]
  );

  const isOrganizationDataValid = useMemo(() => {
    if (!requiresOrganization) return true;
    return !!(
      watchedValues.organizationName?.trim() && watchedValues.organizationType
    );
  }, [
    requiresOrganization,
    watchedValues.organizationName,
    watchedValues.organizationType,
  ]);

  // ============== Effects ==============

  // Clear organization fields when role changes to one that doesn't require them
  useEffect(() => {
    if (!requiresOrganization) {
      setValue('organizationName', '');
      setValue('organizationType', undefined);
      clearErrors(['organizationName', 'organizationType']);
    }
  }, [requiresOrganization, setValue, clearErrors]);

  // Clear submit error on step change
  useEffect(() => {
    setSubmitError(null);
  }, [currentStep]);

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

  // ============== Submission ==============

  const onSubmit = useCallback(
    async (data: RegisterFormData): Promise<void> => {
      // Prevent double submission
      if (isSubmitting) {
        logger.warn('Registration already in progress');
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitAttempts((prev) => prev + 1);

      try {
        logger.debug('Registration attempt started', {
          email: data.email,
          role: data.role,
          attempt: submitAttempts + 1,
        });

        // Prepare organization data if required
        const organization = requiresOrganization
          ? {
              name: data.organizationName?.trim() || '',
              type: data.organizationType,
            }
          : undefined;

        // Call auth service
        await registerUser({
          email: data.email.toLowerCase().trim(),
          password: data.password,
          confirmPassword: data.confirmPassword,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          role: data.role,
          organization,
          acceptsTerms: data.acceptsTerms,
          acceptsMarketing: data.acceptsMarketing,
        });

        logger.info('Registration successful', {
          email: data.email,
          role: data.role,
        });

        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Registration failed';

        logger.error('Registration failed', {
          email: data.email,
          role: data.role,
          error: errorMessage,
          attempt: submitAttempts + 1,
        });

        setSubmitError(errorMessage);

        // Scroll to show error
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, submitAttempts, requiresOrganization, registerUser, navigate]
  );

  // ============== Clear Submit Error ==============

  const clearSubmitError = useCallback((): void => {
    setSubmitError(null);
  }, []);

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

    // Submission
    onSubmit,
    isSubmitting: isSubmitting,
    submitError,
    clearSubmitError,
    submitAttempts,

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
