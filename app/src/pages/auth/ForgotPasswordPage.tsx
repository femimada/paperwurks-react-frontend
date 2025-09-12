// src/pages/auth/ForgotPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { AuthLayout, AuthCard } from '@/components/auth';
import { Input, Button } from '@/components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ForgotPasswordSchema,
  type ForgotPasswordData,
} from '@/utils/validation/authSchemas';
import { logger } from '@/utils/logger';

export const ForgotPasswordPage: React.FC = () => {
  const {
    isAuthenticated,
    forgotPassword,
    error: authError,
    clearError,
  } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    getValues,
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: 'onChange',
  });

  // Handle resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Clear auth error on unmount
  useEffect(() => {
    return () => {
      if (authError) {
        clearError();
      }
    };
  }, [authError, clearError]);

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: ForgotPasswordData) => {
    try {
      await forgotPassword(data.email);
      setIsSubmitted(true);
      logger.info('Password reset email sent', { email: data.email });
    } catch (err) {
      // Error is handled by AuthContext
      logger.error('Password reset failed', err);
    }
  };

  const handleResend = async () => {
    const email = getValues('email');
    if (email && resendTimer === 0) {
      try {
        await forgotPassword(email);
        setResendTimer(60); // 60 second cooldown
        logger.info('Password reset email resent', { email });
      } catch (err) {
        logger.error('Resend failed', err);
      }
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link"
      testId="forgot-password-page"
    >
      <AuthCard>
        {isSubmitted ? (
          <div className="text-center" data-testid="success-message">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Check your email
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              We've sent a password reset link to{' '}
              <strong>{getValues('email')}</strong>. Please check your inbox and
              follow the instructions.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleResend}
                disabled={resendTimer > 0}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                data-testid="resend-button"
              >
                {resendTimer > 0
                  ? `Resend email in ${resendTimer}s`
                  : "Didn't receive it? Resend email"}
              </button>

              <div>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  data-testid="back-to-login-link"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {authError && (
              <div
                className="alert alert--error"
                role="alert"
                aria-live="assertive"
                data-testid="error-message"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 0016 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{authError}</span>
              </div>
            )}

            <Input
              {...register('email')}
              type="email"
              label="Email address"
              placeholder="Enter your email"
              error={errors.email?.message}
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              icon={
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              }
              testId="email-input"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
              testId="submit-button"
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-900"
                data-testid="back-to-login-link"
              >
                <span className="font-medium">Remember your password?</span>{' '}
                Sign in instead
              </Link>
            </div>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
};
