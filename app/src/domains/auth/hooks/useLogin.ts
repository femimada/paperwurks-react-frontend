// src/domains/auth/hooks/useLogin.ts
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/domains/auth/hooks';
import { logger } from '@/shared/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Minimal login validation - only check for required fields and basic format
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .trim(),
  password: z.string().min(1, 'Password is required'), // No length requirement - let server validate
  rememberMe: z.boolean().optional().default(false),
});

export type LoginFormData = z.input<typeof LoginSchema>;

export interface UseLoginReturn {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isSubmitting: boolean;
  form: ReturnType<typeof useForm<LoginFormData>>;
}

/**
 * Custom hook for login authentication logic
 *
 * Handles authentication and navigation logic with simplified validation
 * for better user experience - complex password rules only apply during registration
 *
 * @returns {UseLoginReturn} Submission handler and state
 */
export const useLogin = (): UseLoginReturn => {
  const { login, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    mode: 'onBlur', // Changed from onChange to reduce aggressive validation
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const from = useMemo(
    () => location.state?.from?.pathname || '/dashboard',
    [location.state?.from?.pathname]
  );

  /**
   * Handle form submission
   */
  const onSubmit = useCallback(
    async (data: LoginFormData): Promise<void> => {
      setIsSubmitting(true);
      try {
        // Sanitize data for logging
        const sanitizedEmail = data.email.replace(/@.*/, '@[redacted]');
        logger.debug('Login attempt started', { email: sanitizedEmail });
        const rememberMe = data.rememberMe ?? false;

        // Clear any previous errors before submission
        clearError();

        // Call login from auth context
        await login({
          email: data.email,
          password: data.password,
          rememberMe: rememberMe,
        });

        logger.info('Login successful', { email: sanitizedEmail });

        // Navigate to intended page
        navigate(from, { replace: true });
      } catch (error) {
        logger.error('Login failed', {
          email: data.email.replace(/@.*/, '@[redacted]'),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        // Error is already set in context by login
      } finally {
        setIsSubmitting(false);
      }
    },
    [login, navigate, from, clearError]
  );

  return {
    onSubmit,
    isSubmitting,
    form,
  };
};
