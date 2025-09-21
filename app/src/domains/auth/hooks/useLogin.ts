// src/domains/auth/hooks/useLogin.ts

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/domains/auth/hooks';
import { logger } from '@/shared/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  LoginSchema,
  type LoginFormData,
} from '@/domains/auth/utils/validation/authSchema';

export interface UseLoginReturn {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isSubmitting: boolean;
  form: ReturnType<typeof useForm<LoginFormData>>;
  error: string | null; // Added to expose error to UI
}
export interface UseLoginOptions {
  defaultRedirect?: string; // Configurable default route
  loginTimeout?: number; // Timeout for stale login attempts
}

export const useLogin = (options: UseLoginOptions = {}): UseLoginReturn => {
  const { defaultRedirect = '/dashboard', loginTimeout = 30000 } = options;
  const { login, clearError, error, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastLoginAttempt, setLastLoginAttempt] = useState<{
    email: string;
    timestamp: number;
  } | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const from = useMemo(() => {
    try {
      return location.state?.from?.pathname || defaultRedirect;
    } catch {
      return defaultRedirect;
    }
  }, [location.state, defaultRedirect]);

  useEffect(() => {
    if (!lastLoginAttempt) return;

    const timeout = setTimeout(() => {
      setLastLoginAttempt(null);
      logger.warn('Cleared stale login attempt', {
        email: lastLoginAttempt.email.replace(/@.*/, '@[redacted]'),
      });
    }, loginTimeout);

    return () => clearTimeout(timeout);
  }, [lastLoginAttempt, loginTimeout]);

  // Handle auth state changes after login attempts
  useEffect(() => {
    if (!lastLoginAttempt || isLoading) {
      return;
    }

    const sanitizedEmail = lastLoginAttempt.email.replace(/@.*/, '@[redacted]');

    if (isAuthenticated && !error) {
      // Login was successful
      logger.info('Login successful', { email: sanitizedEmail });
      navigate(from, { replace: true });
      setLastLoginAttempt(null); // Clear the attempt
    } else if (error && !isLoading) {
      // Login failed with error
      logger.error('Login failed', {
        email: sanitizedEmail,
        error: error,
      });
      setLastLoginAttempt(null); // Clear the attempt
    }
  }, [isAuthenticated, error, isLoading, lastLoginAttempt, navigate, from]);

  const onSubmit = useCallback(
    async (data: LoginFormData): Promise<void> => {
      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        const sanitizedEmail = data.email.replace(/@.*/, '@[redacted]');
        logger.debug('Login attempt started', { email: sanitizedEmail });

        setLastLoginAttempt({
          email: data.email,
          timestamp: Date.now(),
        });

        clearError();
        // Attempt login - AuthContext will handle success/error state updates
        await login({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe ?? false,
        });
      } catch (unexpectedError) {
        // This should only catch unexpected errors since AuthContext login doesn't throw
        logger.error('Unexpected login error', {
          error:
            unexpectedError instanceof Error
              ? unexpectedError.message
              : 'Unknown error',
        });
        setLastLoginAttempt(null);
      } finally {
        setIsSubmitting(false);
      }
    },
    [login, clearError, isSubmitting]
  );

  return {
    onSubmit,
    isSubmitting,
    form,
    error,
  };
};
