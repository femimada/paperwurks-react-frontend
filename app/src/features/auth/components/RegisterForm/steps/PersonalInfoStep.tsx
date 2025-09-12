// src/features/auth/components/RegisterForm/steps/PersonalInfoStep.tsx
import React from 'react';
import { Input } from '@/components/ui';
import { FieldError } from '../components/FieldError';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import type {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
} from 'react-hook-form';
import type { RegisterFormData } from '@/hooks/auth/useRegister';

interface PersonalInfoStepProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  watch: UseFormWatch<RegisterFormData>;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  register,
  errors,
  watch,
}) => {
  const password = watch('password');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Personal Information
        </h2>
        <p className="text-sm text-gray-600">
          We'll use this to create your account
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* First Name */}
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            First name
          </label>
          <Input
            {...register('firstName')}
            id="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="Enter your first name"
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            testId="firstName-input"
          />
          <FieldError error={errors.firstName} id="firstName-error" />
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Last name
          </label>
          <Input
            {...register('lastName')}
            id="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Enter your last name"
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            testId="lastName-input"
          />
          <FieldError error={errors.lastName} id="lastName-error" />
        </div>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email address
        </label>
        <Input
          {...register('email')}
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          icon={
            <svg
              className="h-5 w-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          }
          testId="email-input"
        />
        <FieldError error={errors.email} id="email-error" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <Input
            {...register('password')}
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? 'password-error' : 'password-requirements'
            }
            icon={
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
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
          <FieldError error={errors.password} id="password-error" />
          {password && <PasswordStrengthMeter password={password} />}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm password
          </label>
          <Input
            {...register('confirmPassword')}
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm your password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword ? 'confirmPassword-error' : undefined
            }
            icon={
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
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
          <FieldError
            error={errors.confirmPassword}
            id="confirmPassword-error"
          />
        </div>
      </div>

      {/* Password Requirements Helper Text */}
      <div
        id="password-requirements"
        className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md"
        aria-label="Password requirements"
      >
        <p className="font-medium mb-1">Password must contain:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>At least 8 characters</li>
          <li>One uppercase letter</li>
          <li>One lowercase letter</li>
          <li>One number</li>
        </ul>
      </div>
    </div>
  );
};
