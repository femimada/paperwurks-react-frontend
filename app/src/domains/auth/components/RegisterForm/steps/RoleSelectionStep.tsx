// src/features/auth/components/RegisterForm/steps/RoleSelectionStep.tsx
import React, { useEffect } from 'react';
import { Input } from '@/shared/components/ui';
import { FieldError } from '../components/FieldError';
import type {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from 'react-hook-form';
import type { RegisterFormData } from '@/domains/auth/hooks/useRegister';
import type { UserRole } from '@/shared/types/global.types';

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
}

interface RoleSelectionStepProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  watch: UseFormWatch<RegisterFormData>;
  setValue: UseFormSetValue<RegisterFormData>;
  roleOptions: RoleOption[];
  requiresOrganization: boolean;
}

export const RoleSelectionStep: React.FC<RoleSelectionStepProps> = ({
  register,
  errors,
  watch,
  roleOptions,
  requiresOrganization,
}) => {
  const selectedRole = watch('role');

  // Focus on first radio when step loads
  useEffect(() => {
    const firstRadio =
      document.querySelector<HTMLInputElement>('input[name="role"]');
    firstRadio?.focus();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Select your role
        </h2>
        <p className="text-sm text-gray-600">
          Choose the role that best describes your involvement in property
          transactions
        </p>
      </div>

      {/* Role Selection */}
      <fieldset>
        <legend className="sr-only">Select your role</legend>
        <div
          className="space-y-3"
          role="radiogroup"
          aria-required="true"
          aria-invalid={!!errors.role}
          aria-describedby={errors.role ? 'role-error' : undefined}
        >
          {roleOptions.map((option) => (
            <label
              key={option.value}
              className={`
                relative flex items-start p-4 cursor-pointer rounded-lg border
                transition-all duration-200
                ${
                  selectedRole === option.value
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }
              `}
              data-testid={`role-option-${option.value}`}
            >
              <input
                {...register('role')}
                type="radio"
                value={option.value}
                className="h-4 w-4 mt-0.5 text-blue-600 border-gray-300 focus:ring-blue-500"
                aria-describedby={`role-${option.value}-description`}
              />
              <div className="ml-3">
                <span className="block text-sm font-medium text-gray-900">
                  {option.label}
                </span>
                <span
                  id={`role-${option.value}-description`}
                  className="block text-sm text-gray-500 mt-1"
                >
                  {option.description}
                </span>
              </div>
            </label>
          ))}
        </div>
        <FieldError error={errors.role} id="role-error" />
      </fieldset>

      {/* Organization Details - Conditional */}
      {requiresOrganization && (
        <div
          className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
          role="group"
          aria-labelledby="organization-heading"
        >
          <h3
            id="organization-heading"
            className="text-sm font-medium text-blue-900"
          >
            Organization Information Required
          </h3>

          <div>
            <label
              htmlFor="organizationName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Organization name
            </label>
            <Input
              {...register('organizationName')}
              id="organizationName"
              type="text"
              placeholder="Enter your organization name"
              aria-invalid={!!errors.organizationName}
              aria-describedby={
                errors.organizationName ? 'organizationName-error' : undefined
              }
              data-testid="organizationName-input"
            />
            <FieldError
              error={errors.organizationName}
              id="organizationName-error"
            />
          </div>

          <div>
            <label
              htmlFor="organizationType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Organization type
            </label>
            <select
              {...register('organizationType')}
              id="organizationType"
              className={`
                form-input w-full px-3 py-2 border rounded-md
                ${errors.organizationType ? 'border-red-500' : 'border-gray-300'}
                focus:ring-blue-500 focus:border-blue-500
              `}
              aria-invalid={!!errors.organizationType}
              aria-describedby={
                errors.organizationType ? 'organizationType-error' : undefined
              }
              data-testid="organizationType-select"
            >
              <option value="">Select organization type</option>
              <option value="estate_agency">Estate Agency</option>
              <option value="law_firm">Law Firm</option>
              <option value="property_company">Property Company</option>
            </select>
            <FieldError
              error={errors.organizationType}
              id="organizationType-error"
            />
          </div>
        </div>
      )}

      {/* Role-specific information */}
      {selectedRole && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            As a {roleOptions.find((r) => r.value === selectedRole)?.label},
            you'll be able to:
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {selectedRole === 'owner' && (
              <>
                <li>• Create and manage property packs</li>
                <li>• Upload and organize documents</li>
                <li>• Track progress and completion</li>
                <li>• View shared pack analytics</li>
              </>
            )}
            {selectedRole === 'agent' && (
              <>
                <li>• Manage multiple property listings</li>
                <li>• Coordinate between all parties</li>
                <li>• Share packs with buyers and solicitors</li>
                <li>• Track transaction progress</li>
              </>
            )}
            {selectedRole === 'solicitor' && (
              <>
                <li>• Review legal documents</li>
                <li>• Provide risk assessments</li>
                <li>• Add professional annotations</li>
                <li>• Approve property packs</li>
              </>
            )}
            {selectedRole === 'buyer' && (
              <>
                <li>• View shared property packs</li>
                <li>• Download documents</li>
                <li>• Track property status</li>
                <li>• Contact agents and solicitors</li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
