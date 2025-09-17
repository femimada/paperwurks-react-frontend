// src/pages/auth/ForgotPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

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
import { logger } from '@/shared/utils';

// Validation schema
const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .trim(),
});

type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const {
    isAuthenticated,
    forgotPassword,
    error: authError,
    clearError,
  } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const {
    handleSubmit,
    getValues,
    formState: { isSubmitting, isValid },
  } = form;

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
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      logger.info('Password reset email sent', { email: data.email });
    } catch (err) {
      // Error is handled by AuthContext
      logger.error('Password reset failed', err);
    }
  };

  const handleResend = async () => {
    const email = getValues('email') || submittedEmail;
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
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Check your email
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              We've sent a password reset link to{' '}
              <span className="font-medium text-foreground">
                {submittedEmail}
              </span>
            </p>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email?
              </p>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={resendTimer > 0}
                onClick={handleResend}
                data-testid="resend-button"
              >
                {resendTimer > 0 ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4" />
                    Resend email in {resendTimer}s
                  </>
                ) : (
                  'Resend email'
                )}
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  data-testid="back-to-login-link"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              noValidate
            >
              {authError && (
                <Alert variant="destructive" data-testid="error-message">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter your email address"
                          className="pl-10"
                          disabled={isSubmitting}
                          data-testid="email-input"
                          autoComplete="email"
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
                    Sending...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>

              {/* Back to Sign In Link */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="back-to-login-link"
                >
                  <span className="font-medium">Remember your password?</span>{' '}
                  Sign in instead
                </Link>
              </div>
            </form>
          </Form>
        )}
      </AuthCard>
    </AuthLayout>
  );
};
