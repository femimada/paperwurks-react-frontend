// src/features/auth/components/RegisterForm/components/StepNavigation.tsx
import React from 'react';
import { Button } from '@/components/ui';

interface StepNavigationProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  canProceed: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  isFirstStep,
  isLastStep,
  isSubmitting,
  canProceed,
  onNext,
  onPrev,
}) => {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
      <Button
        type="button"
        variant="ghost"
        onClick={onPrev}
        disabled={isFirstStep || isSubmitting}
        className={isFirstStep ? 'invisible' : ''}
        testId="prev-button"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Previous
      </Button>

      {isLastStep ? (
        <Button
          type="submit"
          variant="primary"
          disabled={!canProceed || isSubmitting}
          loading={isSubmitting}
          className="ml-auto"
          testId="submit-button"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      ) : (
        <Button
          type="button"
          variant="primary"
          onClick={onNext}
          disabled={!canProceed || isSubmitting}
          className="ml-auto"
          testId="next-button"
        >
          Continue
          <svg
            className="w-5 h-5 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      )}
    </div>
  );
};
