// src/pages/auth/ResetPasswordPage.tsx
import React, { useState } from 'react';
import { useSearchParams, Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

import { useAuth } from '@/domains/auth/hooks';
import { AuthLayout, AuthCard } from '@/domains/auth/components';
import {
  Button,
  Input,
  Alert,
  AlertDescription,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui';
import { PasswordStrengthMeter } from '../components/RegisterForm';
import { logger } from '@/shared/utils';
// Validation schema
const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must include uppercase, lowercase, and number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { isAuthenticated, resetPassword } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      token: token || '',
      password: '',
      confirmPassword: '',
    },
  });

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting, isValid },
  } = form;
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
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Password reset successful
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Your password has been successfully reset. You can now sign in
              with your new password.
            </p>
            <Button asChild className="w-full" data-testid="login-link">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              noValidate
            >
              {error && (
                <Alert variant="destructive" data-testid="error-message">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Hidden token field */}
              <input type="hidden" {...form.register('token')} />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter your new password"
                          className="pl-10"
                          disabled={isSubmitting}
                          data-testid="password-input"
                          autoComplete="new-password"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                    {password && <PasswordStrengthMeter password={password} />}
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...field}
                          type="password"
                          placeholder="Confirm your new password"
                          className="pl-10"
                          disabled={isSubmitting}
                          data-testid="confirmPassword-input"
                          autoComplete="new-password"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={!isValid || isSubmitting}
                data-testid="submit-button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset password'
                )}
              </Button>

              {/* Back to Sign In Link */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  data-testid="back-to-login-link"
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          </Form>
        )}
      </AuthCard>
    </AuthLayout>
  );
};
