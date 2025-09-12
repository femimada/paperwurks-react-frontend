// src/features/auth/hooks/useLogin.ts
import { useCallback, useEffect, useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { logger } from '@/utils/logger';

// Validation schema for login form
const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginFormData = z.input<typeof LoginSchema>;
export type LoginData = z.output<typeof LoginSchema>;

// Form return type
export interface UseLoginReturn
  extends Pick<
    UseFormReturn<LoginFormData>,
    'register' | 'handleSubmit' | 'formState' | 'reset'
  > {
  // Custom handlers
  onSubmit: (data: LoginFormData) => Promise<void>;
  // State
  isSubmitting: boolean;
}

/**
 * Custom hook for login form management
 *
 * Provides form validation, submission handling, and navigation logic
 *
 * @returns {UseLoginReturn} Form methods and handlers
 */
export const useLogin = (): UseLoginReturn => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const { formState, handleSubmit, register, reset } = form;

  useEffect(() => {
    if (formState.errors.email || formState.errors.password) {
      logger.debug('Validation errors set:', formState.errors);
    }
  }, [formState.errors]);

  /**
   * Handle form submission
   */
  const onSubmit = useCallback(
    async (data: LoginFormData): Promise<void> => {
      setIsProcessing(true);
      try {
        logger.debug('Login attempt started', { email: data.email });

        // Call login from auth context
        await login({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
        });

        logger.info('Login successful', { email: data.email });

        // Get the intended destination from location state or default to dashboard
        const from = location.state?.from?.pathname || '/dashboard';

        // Navigate to intended page
        navigate(from, { replace: true });
      } catch (error) {
        logger.error('Login failed', {
          email: data.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [login, navigate, location.state]
  );

  return {
    // Form methods from react-hook-form
    register,
    handleSubmit,
    formState,
    reset,

    // Custom submission handler
    onSubmit,

    // Loading state
    isSubmitting: formState.isSubmitting || isProcessing,
  };
};
