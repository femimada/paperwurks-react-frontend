// src/features/auth/hooks/useLogin.ts
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { logger } from '@/utils/logger';
//import type { LoginFormData } from '@/types/auth';

// Validation schema for login form
const LoginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginFormData = z.input<typeof LoginSchema>;
export type LoginData = z.output<typeof LoginSchema>;

// Form return type
export interface UseLoginReturn {
  // Form methods
  register: ReturnType<typeof useForm<LoginFormData>>['register'];
  handleSubmit: ReturnType<typeof useForm<LoginFormData>>['handleSubmit'];
  formState: ReturnType<typeof useForm<LoginFormData>>['formState'];
  reset: ReturnType<typeof useForm<LoginFormData>>['reset'];

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

  /**
   * Handle form submission
   */
  const onSubmit = useCallback(
    async (data: LoginFormData): Promise<void> => {
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

        // Error is already handled by AuthContext and will be displayed in UI
        // We don't need to do anything else here
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
    isSubmitting: formState.isSubmitting,
  };
};
