// src/features/auth/hooks/useRegister.ts
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
//import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { logger } from '@/utils/logger';
import { USER_ROLES } from '@/constants/roles';
//import type { RegisterFormData } from '@/types/auth';
import type { UserRole } from '@/types/global.types';
import type { UseFormReturn } from 'react-hook-form';

// Registration steps
export type RegistrationStep = 'personal' | 'role' | 'terms';
const STEPS: RegistrationStep[] = ['personal', 'role', 'terms'];

// Local Organization type (RegisterFormData didn't contain `organization`)
type Organization = {
  name: string;
  type: 'estate_agency' | 'law_firm' | 'property_company' | undefined;
};

// Derive role values from USER_ROLES (single source of truth)
const roleValues = Object.keys(USER_ROLES) as (keyof typeof USER_ROLES)[];
const RoleEnum = z.enum(roleValues as [string, ...string[]]);

// ---------------- schemas ----------------

const FullSchema = z
  .object({
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
      .max(255),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: RoleEnum.optional(),
    organizationName: z.string().optional(),
    organizationType: z
      .enum(['estate_agency', 'law_firm', 'property_company'])
      .optional(),
    acceptsTerms: z.boolean(),
    acceptsMarketing: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine(
    (data) =>
      !['agent', 'solicitor'].includes(data.role ?? '') ||
      (!!data.organizationName?.trim() && !!data.organizationType),
    {
      message: 'Organization details are required for this role',
      path: ['organizationName'],
    }
  )
  .refine((data) => (data.acceptsTerms ? true : data.acceptsTerms !== false), {
    message: 'You must accept the terms and conditions',
    path: ['acceptsTerms'],
  });

export type RegisterFormData = z.infer<typeof FullSchema>;

const PersonalInfoSchema = FullSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  password: true,
  confirmPassword: true,
});
// role schema made from runtime roleValues
const RoleSelectionSchema = FullSchema.pick({ role: true });

// Terms + Org schema (includes role for conditional refine)
const TermsAndOrgSchema = FullSchema.pick({
  role: true,
  organizationName: true,
  organizationType: true,
  acceptsTerms: true,
  acceptsMarketing: true,
});

// Define the specific types for each step's schema
type PersonalInfoSchemaType = z.infer<typeof PersonalInfoSchema>;
type RoleSelectionSchemaType = z.infer<typeof RoleSelectionSchema>;
type TermsAndOrgSchemaType = z.infer<typeof TermsAndOrgSchema>;

// Get the union type of all possible schema outputs
type CurrentStepData =
  | PersonalInfoSchemaType
  | RoleSelectionSchemaType
  | TermsAndOrgSchemaType;

const getSchemaForStep = (
  step: RegistrationStep
): z.ZodType<CurrentStepData> => {
  switch (step) {
    case 'personal':
      return PersonalInfoSchema;
    case 'role':
      return RoleSelectionSchema;
    case 'terms':
      return TermsAndOrgSchema;
    default:
      logger.error('Invalid registration step', { step });
      throw new Error(`Invalid step: ${step}`);
  }
};

// ---------------- hook ----------------
export interface UseRegisterReturn
  extends Pick<
    UseFormReturn<RegisterFormData>,
    'register' | 'handleSubmit' | 'formState' | 'watch' | 'setValue' | 'trigger'
  > {
  // Step management
  currentStep: RegistrationStep;
  currentStepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  canProceed: boolean;

  // Step navigation
  nextStep: () => Promise<void>;
  prevStep: () => void;
  goToStep: (step: RegistrationStep) => void;

  // Form submission
  onSubmit: (data: RegisterFormData) => Promise<void>;
  validateCurrentStep: () => Promise<boolean>;

  // State
  isSubmitting: boolean;

  // Helper data
  roleOptions: Array<{
    value: UserRole;
    label: string;
    description: string;
  }>;
  requiresOrganization: boolean;
  passwordStrength: {
    score: number;
    feedback: string[];
    strength: 'weak' | 'medium' | 'strong';
  };
}

export const useRegister = (): UseRegisterReturn => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('personal');

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(FullSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: undefined as unknown as UserRole | undefined,
      organizationName: '',
      organizationType: undefined,
      acceptsTerms: false,
      acceptsMarketing: false,
    },
  });

  const { formState, handleSubmit, register, watch, setValue, trigger } = form;
  const watchedValues = watch();

  useEffect(() => {
    form.reset(undefined, { keepValues: true, keepDirty: true });
    form.clearErrors();
    trigger(); // Validate new step
  }, [currentStep, form, trigger]);

  // Step management
  const currentStepIndex = STEPS.indexOf(currentStep);
  const totalSteps = STEPS.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Role options derived from USER_ROLES (safe indexing)
  const roleOptions = useMemo(
    () =>
      roleValues.map((role) => ({
        value: role,
        label: USER_ROLES[role as UserRole].label,
        description: USER_ROLES[role as UserRole].description,
      })),
    []
  );

  // whether organization is required
  const requiresOrganization = useMemo(
    () =>
      (watchedValues.role as string) === 'agent' ||
      (watchedValues.role as string) === 'solicitor',
    [watchedValues.role]
  );

  // password strength (synchronous)
  const passwordStrength = useMemo(() => {
    const password = (watchedValues.password as string) || '';
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score++;
    else if (password.length > 0) feedback.push('At least 8 characters');

    if (/[a-z]/.test(password)) score++;
    else if (password.length > 0) feedback.push('One lowercase letter');

    if (/[A-Z]/.test(password)) score++;
    else if (password.length > 0) feedback.push('One uppercase letter');

    if (/\d/.test(password)) score++;
    else if (password.length > 0) feedback.push('One number');

    if (/[^A-Za-z0-9]/.test(password)) score++;

    let strength: 'weak' | 'medium' | 'strong';
    if (score <= 2) strength = 'weak';
    else if (score <= 3) strength = 'medium';
    else strength = 'strong';

    return { score, feedback, strength };
  }, [watchedValues.password]);

  // Validate only current step (sync)
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const schema = getSchemaForStep(currentStep);
    const result = schema.safeParse(watchedValues);
    return result.success;
  }, [currentStep, watchedValues]);

  // canProceed computed synchronously
  const canProceed = useMemo(() => {
    const schema = getSchemaForStep(currentStep);
    const result = schema.safeParse(watchedValues);
    if (!result.success) return false;

    if (currentStep === 'terms' && requiresOrganization) {
      const ok = !!(
        watchedValues.organizationName?.trim() && watchedValues.organizationType
      );
      return ok;
    }

    return true;
  }, [currentStep, watchedValues, requiresOrganization]);

  // navigation
  const nextStep = useCallback(async (): Promise<void> => {
    if (isLastStep) return;
    const isValid = await validateCurrentStep();
    if (!isValid) {
      await trigger();
      return;
    }
    setCurrentStep(STEPS[currentStepIndex + 1]);
    logger.debug('Moved to next registration step', {
      from: currentStep,
      to: STEPS[currentStepIndex + 1],
    });
  }, [currentStep, currentStepIndex, isLastStep, trigger, validateCurrentStep]);

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(STEPS[currentStepIndex - 1]);
      logger.debug('Moved to previous registration step', {
        from: currentStep,
        to: STEPS[currentStepIndex - 1],
      });
    }
  }, [currentStep, currentStepIndex, isFirstStep]);

  const goToStep = useCallback(
    async (step: RegistrationStep) => {
      const targetIndex = STEPS.indexOf(step);
      if (targetIndex < 0) return;

      if (targetIndex > currentStepIndex) {
        // require current step valid before jumping forward
        const ok = await validateCurrentStep();
        if (!ok) {
          await trigger();
          return;
        }
      }
      setCurrentStep(step);
      logger.debug('Jumped to registration step', { to: step });
    },
    [currentStepIndex, trigger, validateCurrentStep]
  );

  // submission
  const onSubmit = useCallback(
    async (data: RegisterFormData): Promise<void> => {
      try {
        logger.debug('Registration attempt started', {
          email: data.email,
          role: data.role,
        });

        let organization: Organization | undefined = undefined;
        if (requiresOrganization) {
          organization = {
            name: (data.organizationName || '').trim(),
            type: data.organizationType ?? 'property_company',
          };
        }

        await registerUser({
          email: (data.email || '').toLowerCase().trim(),
          password: data.password,
          confirmPassword: data.confirmPassword,
          firstName: (data.firstName || '').trim(),
          lastName: (data.lastName || '').trim(),
          role: data.role as UserRole,
          // Auth API field name `organization` may differ; adapt as needed
          // We pass `organization` as a regular object (UI/backend contract)
          // if backend expects another shape, map here.
          organization: organization as unknown as any,
          acceptsTerms: data.acceptsTerms,
          acceptsMarketing: data.acceptsMarketing,
        } as any);

        logger.info('Registration successful', {
          email: data.email,
          role: data.role,
        });
        navigate('/dashboard', { replace: true });
      } catch (error) {
        logger.error('Registration failed', {
          email: data.email,
          role: data.role,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        // rethrow so UI/auth-context can handle UI/state as you had before
        throw error;
      }
    },
    [registerUser, navigate, requiresOrganization]
  );

  return {
    register,
    handleSubmit,
    formState,
    watch,
    setValue,
    trigger,

    currentStep,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    canProceed,

    nextStep,
    prevStep,
    goToStep,

    onSubmit,
    validateCurrentStep,

    isSubmitting: formState.isSubmitting,

    roleOptions,
    requiresOrganization,
    passwordStrength,
  };
};
