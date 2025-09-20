// src/domains/auth/hooks/useLogin.ts

import { useCallback, useMemo, useState } from 'react';
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
}

export const useLogin = (): UseLoginReturn => {
  const { login, clearError, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const from = useMemo(
    () => location.state?.from?.pathname || '/dashboard',
    [location.state?.from?.pathname]
  );

  const onSubmit = useCallback(
    async (data: LoginFormData): Promise<void> => {
      setIsSubmitting(true);

      try {
        const sanitizedEmail = data.email.replace(/@.*/, '@[redacted]');
        logger.debug('Login attempt started', { email: sanitizedEmail });
        clearError();
        await login({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe ?? false,
        });
        if (!error && !isLoading) {
          logger.info('Login successful', { email: sanitizedEmail });
          navigate(from, { replace: true });
        } else if (error) {
          logger.error('Login failed', {
            email: sanitizedEmail,
            error: error,
          });
        }
      } catch (unexpectedError) {
        logger.error('Unexpected login error', {
          error:
            unexpectedError instanceof Error
              ? unexpectedError.message
              : 'Unknown error',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [login, navigate, from, clearError, error, isLoading]
  );

  return {
    onSubmit,
    isSubmitting,
    form,
  };
};
