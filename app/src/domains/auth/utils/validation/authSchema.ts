import { roleValues } from '@/shared/constants';
import type { UserRole } from '@/shared/types/global.types';
import { z } from 'zod';

/**
 * Shared validation schemas for authentication forms
 */

// Common email validation
export const EmailSchema = z
  .email({
    error: (iss) =>
      iss.input === undefined
        ? `Email is required.`
        : 'Please enter a valid email address',
  })
  .toLowerCase()
  .trim();

// Simple password validation for LOGIN - no length restrictions
export const LoginPasswordSchema = z.string().min(1, 'Password is required.'); // Only require non-empty - server validates credentials

// Strict password validation for REGISTRATION
export const RegisterPasswordSchema = z
  .string()
  .min(1, 'Password is required.')
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
  rememberMe: z.boolean().optional(),
});

// Full validation schema - single source of truth for form data
export const RegisterSchema = z
  .object({
    // Personal Info
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

    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .toLowerCase()
      .trim(),

    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),

    confirmPassword: z.string().min(1, 'Please confirm your password'),

    role: z.enum(roleValues as [UserRole, ...UserRole[]]),

    organizationName: z.string().optional(),

    organizationType: z
      .enum(['estate_agency', 'law_firm', 'property_company'])
      .optional(),

    acceptsTerms: z
      .boolean()
      .refine(
        (val) => val === true,
        'You must accept the terms and conditions'
      ),

    acceptsMarketing: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      const requiresOrg = ['agent', 'solicitor'].includes(data.role);
      if (!requiresOrg) return true;
      return !!(data.organizationName?.trim() && data.organizationType);
    },
    {
      message: 'Organization details are required for this role',
      path: ['organizationName'],
    }
  );

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
