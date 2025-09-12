// src/pages/auth/ResetPasswordPage.tsx
import React, { useState } from 'react';
import { useSearchParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { AuthLayout, AuthCard } from '@/components/auth';
import { Input, Button } from '@/components/ui';
import { PasswordStrengthMeter } from '@/features/auth/components/RegisterForm/components/PasswordStrengthMeter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ResetPasswordSchema,
  type ResetPasswordData,
} from '@/utils/validation/authSchemas';
import { logger } from '@/utils/logger';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { isAuthenticated, resetPassword } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      token: token || '',
    },
  });

  const password = watch('password');

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Redirect if no token
  if (!token) {
    return <Navigate to="/forgot-password" replace />;
  }

  const onSubmit = async (data: ResetPasswordData) => {
    setError(null);
    try {
      await resetPassword(data);
      setIsSubmitted(true);
      logger.info('Password reset successful');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to reset password';
      setError(message);
      logger.error('Password reset failed', { error: message });
    }
  };

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Enter your new password below"
      testId="reset-password-page"
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
              Password reset successful
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Your password has been successfully reset. You can now sign in
              with your new password.
            </p>
            <Link
              to="/login"
              className="btn btn--primary w-full"
              data-testid="login-link"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {error && (
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
                <span>{error}</span>
              </div>
            )}

            <input type="hidden" {...register('token')} />

            <div>
              <Input
                {...register('password')}
                type="password"
                label="New password"
                placeholder="Enter your new password"
                error={errors.password?.message}
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? 'password-error' : 'password-requirements'
                }
                icon={
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
                testId="password-input"
              />
              {password && <PasswordStrengthMeter password={password} />}
            </div>

            <Input
              {...register('confirmPassword')}
              type="password"
              label="Confirm password"
              placeholder="Confirm your new password"
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword ? 'confirmPassword-error' : undefined
              }
              icon={
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              testId="confirmPassword-input"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
              testId="submit-button"
            >
              {isSubmitting ? 'Resetting...' : 'Reset password'}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-900"
                data-testid="back-to-login-link"
              >
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
};
