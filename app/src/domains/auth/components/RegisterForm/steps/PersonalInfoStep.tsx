// src/features/auth/components/RegisterForm/steps/PersonalInfoStep.tsx
import React from 'react';
import { User, Mail, Lock } from 'lucide-react';
import { Input } from '@/shared/components/ui';
import { PasswordStrengthMeter } from '@/domains/auth/components/RegisterForm';
import type {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
} from 'react-hook-form';
import type { RegisterFormData } from '@/domains/auth/utils/validation/authSchema';

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
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Personal Information
        </h2>
        <p className="text-sm text-muted-foreground">
          We'll use this to create your account
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* First Name */}
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-foreground mb-1"
          >
            First name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              {...register('firstName')}
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              className="pl-10"
              data-testid="firstName-input"
              autoComplete="given-name"
            />
          </div>
          {errors.firstName && (
            <p className="text-sm text-destructive mt-1" role="alert">
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Last name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              {...register('lastName')}
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              className="pl-10"
              data-testid="lastName-input"
              autoComplete="family-name"
            />
          </div>
          {errors.lastName && (
            <p className="text-sm text-destructive mt-1" role="alert">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-foreground mb-1"
        >
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            {...register('email')}
            id="email"
            type="email"
            placeholder="you@example.com"
            className="pl-10"
            data-testid="email-input"
            autoComplete="email"
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive mt-1" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-foreground mb-1"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            {...register('password')}
            id="password"
            type="password"
            placeholder="Enter your password"
            className="pl-10"
            data-testid="password-input"
            autoComplete="new-password"
          />
        </div>
        {errors.password && (
          <p className="text-sm text-destructive mt-1" role="alert">
            {errors.password.message}
          </p>
        )}
        {password && <PasswordStrengthMeter password={password} />}
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-foreground mb-1"
        >
          Confirm password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            {...register('confirmPassword')}
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            className="pl-10"
            data-testid="confirmPassword-input"
            autoComplete="new-password"
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive mt-1" role="alert">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
    </div>
  );
};
