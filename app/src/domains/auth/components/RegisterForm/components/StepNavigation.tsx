// src/features/auth/components/RegisterForm/components/StepNavigation.tsx
import React from 'react';
import { Button } from '@/shared/components/ui';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

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
    <div className="flex items-center justify-between pt-6 border-t border-border">
      <Button
        type="button"
        variant="ghost"
        onClick={onPrev}
        disabled={isFirstStep || isSubmitting}
        className={isFirstStep ? 'invisible' : ''}
        data-testid="prev-button"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      {isLastStep ? (
        <Button
          type="submit"
          disabled={!canProceed || isSubmitting}
          className="ml-auto"
          data-testid="submit-button"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onNext}
          disabled={!canProceed || isSubmitting}
          className="ml-auto"
          data-testid="next-button"
        >
          Continue
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
};
