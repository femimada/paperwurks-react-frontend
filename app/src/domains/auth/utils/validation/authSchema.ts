import { z } from 'zod';

/**
 * Shared validation schemas for authentication forms
 */

// Common email validation
export const EmailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim();

// Simple password validation for LOGIN - no length restrictions
export const LoginPasswordSchema = z.string().min(1, 'Password is required'); // Only require non-empty - server validates credentials

// Strict password validation for REGISTRATION
export const RegisterPasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and number'
  );

// Login schema - simplified for better UX
export const LoginSchema = z.object({
  email: EmailSchema,
  password: LoginPasswordSchema,
  rememberMe: z.boolean().optional().default(false),
});

// Registration schema - strict for security
export const RegisterSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters')
      .regex(
        /^[a-zA-Z\s'-]+$/,
        'First name can only contain letters, spaces, hyphens, and apostrophes'
      ),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters')
      .regex(
        /^[a-zA-Z\s'-]+$/,
        'Last name can only contain letters, spaces, hyphens, and apostrophes'
      ),
    email: EmailSchema,
    password: RegisterPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptsTerms: z
      .boolean()
      .refine(
        (val) => val === true,
        'You must accept the terms and conditions'
      ),
    acceptsMarketing: z.boolean().optional().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Forgot password schema
export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
});

// Reset password schema - uses strict validation for new password
export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: RegisterPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Type exports
export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;
