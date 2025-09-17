// src/features/auth/components/RegisterForm/steps/TermsStep.tsx
import React from 'react';
import { FieldError } from '../components/FieldError';
import type {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
} from 'react-hook-form';
import type { RegisterFormData } from '@/domains/auth/hooks/useRegister';

interface TermsStepProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  watch: UseFormWatch<RegisterFormData>;
}

export const TermsStep: React.FC<TermsStepProps> = ({
  register,
  errors,
  watch,
}) => {
  const acceptsTerms = watch('acceptsTerms');
  const acceptsMarketing = watch('acceptsMarketing');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Terms and Conditions
        </h2>
        <p className="text-sm text-gray-600">
          Please review and accept our terms to continue
        </p>
      </div>

      {/* Terms Agreement Box */}
      <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-2">Terms of Service</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            By creating an account with Paperwurks, you agree to our
            comprehensive terms of service and privacy policy. These terms
            govern your use of our platform and services.
          </p>
          <p>
            <strong>Key Points:</strong>
          </p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>You must provide accurate and complete information</li>
            <li>You are responsible for maintaining account security</li>
            <li>You agree to use the service lawfully and ethically</li>
            <li>Your data will be handled according to our privacy policy</li>
            <li>Service availability is subject to our SLA agreement</li>
          </ul>
          <p>
            For complete terms, please visit{' '}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 underline"
            >
              our full terms of service
            </a>{' '}
            and{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 underline"
            >
              privacy policy
            </a>
            .
          </p>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-4">
        {/* Terms Acceptance - Required */}
        <div className="relative">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                {...register('acceptsTerms')}
                id="acceptsTerms"
                type="checkbox"
                className={`
                  h-4 w-4 rounded border-gray-300 text-blue-600 
                  focus:ring-blue-500 focus:ring-2
                  ${errors.acceptsTerms ? 'border-red-500' : ''}
                `}
                aria-invalid={!!errors.acceptsTerms}
                aria-describedby={
                  errors.acceptsTerms
                    ? 'acceptsTerms-error'
                    : 'acceptsTerms-description'
                }
                data-testid="acceptsTerms-checkbox"
              />
            </div>
            <div className="ml-3">
              <label
                htmlFor="acceptsTerms"
                className="text-sm font-medium text-gray-900 cursor-pointer"
              >
                I accept the terms and conditions
                <span className="text-red-500 ml-1" aria-label="required">
                  *
                </span>
              </label>
              <p
                id="acceptsTerms-description"
                className="text-xs text-gray-500 mt-1"
              >
                You must accept our terms to create an account
              </p>
            </div>
          </div>
          <FieldError error={errors.acceptsTerms} id="acceptsTerms-error" />
        </div>

        {/* Marketing Acceptance - Optional */}
        <div className="relative">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                {...register('acceptsMarketing')}
                id="acceptsMarketing"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                aria-describedby="acceptsMarketing-description"
                data-testid="acceptsMarketing-checkbox"
              />
            </div>
            <div className="ml-3">
              <label
                htmlFor="acceptsMarketing"
                className="text-sm font-medium text-gray-900 cursor-pointer"
              >
                Send me product updates and newsletters
              </label>
              <p
                id="acceptsMarketing-description"
                className="text-xs text-gray-500 mt-1"
              >
                We'll send you relevant updates about new features and best
                practices. You can unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          Ready to create your account?
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li className="flex items-center">
            {acceptsTerms ? (
              <svg
                className="h-4 w-4 mr-2 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4 mr-2 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            Terms and conditions {acceptsTerms ? 'accepted' : 'required'}
          </li>
          <li className="flex items-center">
            {acceptsMarketing ? (
              <svg
                className="h-4 w-4 mr-2 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4 mr-2 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            Marketing emails {acceptsMarketing ? 'subscribed' : 'optional'}
          </li>
        </ul>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Privacy & Data Protection
        </h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p>Your personal information will be used to:</p>
          <ul className="list-disc list-inside ml-2 space-y-0.5">
            <li>Create and manage your account</li>
            <li>Provide access to our services</li>
            <li>Send important service updates</li>
            {acceptsMarketing && (
              <li>Send marketing communications (if opted in)</li>
            )}
          </ul>
          <p className="mt-2">
            We comply with GDPR and other data protection regulations. You can
            request data deletion or export at any time.
          </p>
        </div>
      </div>
    </div>
  );
};
