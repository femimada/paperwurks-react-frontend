// src/domains/auth/hooks/useLogin.ts - IDIOMATIC REACT IMPLEMENTATION

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/domains/auth/hooks';
import { logger } from '@/shared/utils';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  LoginSchema,
  type LoginFormData,
} from '@/domains/auth/utils/validation/authSchema';
import { TokenService } from '@/domains/auth/services/tokenService';

// ============== TYPES ==============

export interface UseLoginOptions {
  defaultRedirect?: string;
  loginTimeout?: number;
  maxRetryAttempts?: number;
}

export interface UseLoginReturn {
  onSubmit: (data: LoginFormData) => Promise<void>;
  retry: () => Promise<void>;
  isSubmitting: boolean;
  canRetry: boolean;
  form: UseFormReturn<LoginFormData>;
  error: string | null;
  clearError: () => void;
}

interface AttemptState {
  email: string;
  timestamp: number;
  retryCount: number;
}

// ============== UTILITY FUNCTIONS ==============

/**
 * Sanitizes email addresses for secure logging
 */
const sanitizeEmail = (email: string): string => {
  return email.replace(/@.*/, '@[redacted]');
};

/**
 * Creates a timeout promise that rejects after specified duration
 */
const createTimeoutPromise = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    if (ms === 0) {
      reject(new Error('Login request timed out'));
      return;
    }
    setTimeout(() => reject(new Error('Login request timed out')), ms);
  });
};

/**
 * Creates a delay promise for retry backoff
 */
const createDelayPromise = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Validates configuration options
 */
const validateConfig = (options: Required<UseLoginOptions>): void => {
  if (options.loginTimeout < 0) {
    throw new Error('loginTimeout cannot be negative');
  }
  if (options.maxRetryAttempts < 0) {
    throw new Error('maxRetryAttempts cannot be negative');
  }
};

// ============== MAIN HOOK IMPLEMENTATION ==============

export const useLogin = (
  options: Partial<UseLoginOptions> = {}
): UseLoginReturn => {
  // ============== CONFIGURATION ==============

  const config = useMemo(() => {
    const resolved = {
      defaultRedirect: '/dashboard',
      loginTimeout: 30000,
      maxRetryAttempts: 3,
      ...options,
    };
    validateConfig(resolved);
    return resolved;
  }, [options]);

  // ============== EXTERNAL DEPENDENCIES ==============

  const { login, clearError: authClearError, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ============== STATE ==============

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<AttemptState | null>(null);

  // ============== REFS ==============

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const submissionPromiseRef = useRef<{
    resolve: (value: void) => void;
    reject: (error: Error) => void;
  } | null>(null);

  // ============== FORM SETUP ==============

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

  // ============== COMPUTED VALUES ==============

  const redirectPath = useMemo(
    () => location.state?.from?.pathname || config.defaultRedirect,
    [location.state?.from?.pathname, config.defaultRedirect]
  );

  const canRetry = useMemo(
    () =>
      lastAttempt !== null && lastAttempt.retryCount < config.maxRetryAttempts,
    [lastAttempt, config.maxRetryAttempts]
  );

  // ============== UTILITY FUNCTIONS ==============

  const clearLoginTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const clearSensitiveData = useCallback(() => {
    form.setValue('password', '');
  }, [form]);

  const cleanup = useCallback(() => {
    clearLoginTimeout();
    submissionPromiseRef.current = null;
    clearSensitiveData();
  }, [clearLoginTimeout, clearSensitiveData]);

  const guardAgainstDoubleSubmission = useCallback((): boolean => {
    if (isSubmitting) {
      logger.warn('Login submission blocked - already in progress');
      return false;
    }
    return true;
  }, [isSubmitting]);

  // ============== CORE HANDLERS ==============

  const handleLoginSuccess = useCallback(
    (email: string, response: any, rememberMe: boolean) => {
      const sanitizedEmail = sanitizeEmail(email);

      // Log success immediately
      logger.info('Login successful', { email: sanitizedEmail });

      // Set tokens with remember me preference
      TokenService.setTokens(response.tokens, rememberMe);

      // Navigate immediately
      navigate(redirectPath, { replace: true });

      // Clear attempt state
      setLastAttempt(null);

      // Resolve promise
      if (submissionPromiseRef.current) {
        submissionPromiseRef.current.resolve();
      }

      // Cleanup
      setIsSubmitting(false);
      cleanup();
    },
    [navigate, redirectPath, cleanup]
  );

  const handleLoginFailure = useCallback(
    (email: string, error: Error, retryCount: number) => {
      const sanitizedEmail = sanitizeEmail(email);

      // Log error immediately
      logger.error('Login failed', {
        email: sanitizedEmail,
        error: error.message,
        retryCount,
      });

      // Update attempt state for potential retry
      setLastAttempt({
        email,
        timestamp: Date.now(),
        retryCount,
      });

      // Reject promise
      if (submissionPromiseRef.current) {
        submissionPromiseRef.current.reject(error);
      }

      // Cleanup
      setIsSubmitting(false);
      cleanup();
    },
    [cleanup]
  );

  // ============== LOGIN EXECUTION ==============

  const executeLogin = useCallback(
    async (data: LoginFormData, retryCount: number) => {
      try {
        // Create timeout promise
        const timeoutPromise = createTimeoutPromise(config.loginTimeout);

        // Race login against timeout
        const response = await Promise.race([
          login({
            email: data.email,
            password: data.password,
            rememberMe: data.rememberMe ?? false,
          }),
          timeoutPromise,
        ]);

        // Clear timeout since login succeeded
        clearLoginTimeout();

        // Handle success
        handleLoginSuccess(data.email, response, data.rememberMe ?? false);
      } catch (error) {
        // Clear timeout on any error
        clearLoginTimeout();

        // Handle failure
        handleLoginFailure(data.email, error as Error, retryCount);
      }
    },
    [
      config.loginTimeout,
      login,
      clearLoginTimeout,
      handleLoginSuccess,
      handleLoginFailure,
    ]
  );

  // ============== PUBLIC API ==============

  const onSubmit = useCallback(
    async (data: LoginFormData): Promise<void> => {
      // Guard against double submission
      if (!guardAgainstDoubleSubmission()) {
        return;
      }

      // Validate form
      const isValid = await form.trigger();
      if (!isValid) {
        logger.warn('Login blocked - form validation failed');
        return;
      }

      // Set up promise for external callers
      return new Promise<void>((resolve, reject) => {
        submissionPromiseRef.current = { resolve, reject };
        setIsSubmitting(true);

        // Clear any previous errors
        authClearError();

        // Log attempt start
        const sanitizedEmail = sanitizeEmail(data.email);
        logger.debug('Login attempt started', {
          email: sanitizedEmail,
          retryCount: 0,
        });

        // Execute login
        executeLogin(data, 0);
      });
    },
    [guardAgainstDoubleSubmission, form, authClearError, executeLogin]
  );

  const retry = useCallback(async (): Promise<void> => {
    if (!lastAttempt || !canRetry) {
      throw new Error(
        'Cannot retry - no previous attempt or max retries exceeded'
      );
    }

    if (!guardAgainstDoubleSubmission()) {
      return;
    }

    // Get current form values
    const currentData = form.getValues();
    const retryData: LoginFormData = {
      ...currentData,
      email: lastAttempt.email, // Use email from last attempt
    };

    // Add retry delay
    await createDelayPromise(1000);

    // Set up promise for external callers
    return new Promise<void>((resolve, reject) => {
      submissionPromiseRef.current = { resolve, reject };
      setIsSubmitting(true);

      // Execute retry with incremented count
      executeLogin(retryData, lastAttempt.retryCount + 1);
    });
  }, [lastAttempt, canRetry, guardAgainstDoubleSubmission, form, executeLogin]);

  // ============== CLEANUP ==============

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // ============== RETURN API ==============

  return {
    onSubmit,
    retry,
    isSubmitting,
    canRetry,
    form,
    error: authError,
    clearError: authClearError,
  };
};
