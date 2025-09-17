// src/tests/integration/PropertyForm.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropertyForm } from '@/features/properties/components/PropertyForm';
import type { Property, CreatePropertyData } from '@/types/property';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockExistingProperty: Property = {
  id: 'property-1',
  title: 'Existing Property',
  description: 'A lovely existing property',
  address: {
    line1: '123 Test Street',
    line2: 'Test Area',
    city: 'Test City',
    county: 'Test County',
    postcode: 'TE5 1ST',
    country: 'UK',
  },
  propertyType: 'detached',
  tenure: 'freehold',
  bedrooms: 3,
  bathrooms: 2,
  askingPrice: 450000,
  status: 'draft',
  owner: {
    id: 'owner-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  },
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-15'),
};

describe('PropertyForm Integration Tests', () => {
  const mockHandlers = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    Object.values(mockHandlers).forEach((mock) => mock.mockClear());
  });

  describe('Form Rendering', () => {
    it('renders create mode form with empty fields', () => {
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Check step indicator
      expect(screen.getByText('Basic Details')).toBeInTheDocument();
      expect(screen.getByText('Address')).toBeInTheDocument();
      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('Financial')).toBeInTheDocument();

      // Check empty form fields
      expect(screen.getByLabelText(/property title/i)).toHaveValue('');
      expect(screen.getByLabelText(/description/i)).toHaveValue('');
    });

    it('renders edit mode form with pre-populated fields', () => {
      render(
        <PropertyForm
          property={mockExistingProperty}
          mode="edit"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Check pre-populated fields
      expect(screen.getByDisplayValue('Existing Property')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('A lovely existing property')
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue('123 Test Street')).toBeInTheDocument();
    });
  });

  describe('Multi-step Navigation', () => {
    it('navigates through form steps correctly', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Start at step 1 (Basic Details)
      expect(
        screen.getByText('Basic Property Information')
      ).toBeInTheDocument();

      // Fill required fields for step 1
      await user.type(
        screen.getByLabelText(/property title/i),
        'Test Property'
      );
      await user.selectOptions(
        screen.getByLabelText(/property type/i),
        'detached'
      );

      // Navigate to step 2
      await user.click(screen.getByTestId('next-step-button'));
      expect(screen.getByText('Property Address')).toBeInTheDocument();

      // Fill required fields for step 2
      await user.type(
        screen.getByLabelText(/address line 1/i),
        '123 New Street'
      );
      await user.type(screen.getByLabelText(/city/i), 'New City');
      await user.type(screen.getByLabelText(/postcode/i), 'NE1 2AB');

      // Navigate to step 3
      await user.click(screen.getByTestId('next-step-button'));
      expect(screen.getByText('Property Features')).toBeInTheDocument();

      // Navigate back to step 2
      await user.click(screen.getByTestId('prev-step-button'));
      expect(screen.getByText('Property Address')).toBeInTheDocument();
    });

    it('retains form data when navigating between steps', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Fill title on step 1
      await user.type(
        screen.getByLabelText(/property title/i),
        'Persistent Title'
      );

      // Go to step 2
      await user.click(screen.getByTestId('next-step-button'));

      // Go back to step 1
      await user.click(screen.getByTestId('prev-step-button'));

      // Check that title is still there
      expect(screen.getByDisplayValue('Persistent Title')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates required fields on each step', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Try to submit step 1 without required fields
      await user.click(screen.getByTestId('next-step-button'));

      await waitFor(() => {
        expect(
          screen.getByText(/property title is required/i)
        ).toBeInTheDocument();
      });
    });

    it('validates postcode format', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Fill basic details
      await user.type(
        screen.getByLabelText(/property title/i),
        'Test Property'
      );
      await user.click(screen.getByTestId('next-step-button'));

      // Enter invalid postcode
      await user.type(screen.getByLabelText(/postcode/i), 'INVALID');
      await user.blur(screen.getByLabelText(/postcode/i));

      await waitFor(() => {
        expect(
          screen.getByText(/invalid uk postcode format/i)
        ).toBeInTheDocument();
      });
    });

    it('validates numeric fields', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Navigate to features step
      await user.type(
        screen.getByLabelText(/property title/i),
        'Test Property'
      );
      await user.click(screen.getByTestId('next-step-button'));

      await user.type(screen.getByLabelText(/address line 1/i), '123 Test');
      await user.type(screen.getByLabelText(/city/i), 'City');
      await user.type(screen.getByLabelText(/postcode/i), 'TE1 2ST');
      await user.click(screen.getByTestId('next-step-button'));

      // Enter invalid number for bedrooms
      const bedroomsInput = screen.getByLabelText(/bedrooms/i);
      await user.type(bedroomsInput, '-1');
      await user.blur(bedroomsInput);

      await waitFor(() => {
        expect(
          screen.getByText(/number must be greater than or equal to 0/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Fill all required fields across steps
      // Step 1: Basic Details
      await user.type(
        screen.getByLabelText(/property title/i),
        'New Test Property'
      );
      await user.selectOptions(
        screen.getByLabelText(/property type/i),
        'terraced'
      );
      await user.click(screen.getByTestId('next-step-button'));

      // Step 2: Address
      await user.type(
        screen.getByLabelText(/address line 1/i),
        '456 Submit Street'
      );
      await user.type(screen.getByLabelText(/city/i), 'Submit City');
      await user.type(screen.getByLabelText(/postcode/i), 'SU1 2MT');
      await user.click(screen.getByTestId('next-step-button'));

      // Step 3: Features
      await user.type(screen.getByLabelText(/bedrooms/i), '4');
      await user.type(screen.getByLabelText(/bathrooms/i), '2');
      await user.click(screen.getByTestId('next-step-button'));

      // Step 4: Financial
      await user.type(screen.getByLabelText(/asking price/i), '350000');

      // Submit form
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(mockHandlers.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Test Property',
            propertyType: 'terraced',
            address: expect.objectContaining({
              line1: '456 Submit Street',
              city: 'Submit City',
              postcode: 'SU1 2MT',
            }),
            bedrooms: 4,
            bathrooms: 2,
            askingPrice: 350000,
          })
        );
      });
    });

    it('handles submission errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock submit function to reject
      const mockSubmitWithError = vi
        .fn()
        .mockRejectedValue(new Error('Submission failed'));

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockSubmitWithError}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Fill minimum required fields and submit
      await user.type(screen.getByLabelText(/property title/i), 'Error Test');
      await user.click(screen.getByTestId('next-step-button'));

      await user.type(screen.getByLabelText(/address line 1/i), '123 Error St');
      await user.type(screen.getByLabelText(/city/i), 'Error City');
      await user.type(screen.getByLabelText(/postcode/i), 'ER1 2OR');
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('next-step-button'));

      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByText(/submission failed/i)).toBeInTheDocument();
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();

      // Mock submit function with delay
      const mockSubmitWithDelay = vi.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockSubmitWithDelay}
          isSubmitting={true}
        />
      );

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/submitting/i)).toBeInTheDocument();
    });
  });

  describe('Cancel Functionality', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      await user.click(screen.getByTestId('cancel-button'));
      expect(mockHandlers.onCancel).toHaveBeenCalled();
    });

    it('shows confirmation dialog when canceling with unsaved changes', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Make changes to the form
      await user.type(
        screen.getByLabelText(/property title/i),
        'Unsaved Changes'
      );

      // Try to cancel
      await user.click(screen.getByTestId('cancel-button'));

      // Should show confirmation dialog
      expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    });
  });

  describe('Field Interactions', () => {
    it('handles property type selection correctly', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      const propertyTypeSelect = screen.getByLabelText(/property type/i);
      await user.selectOptions(propertyTypeSelect, 'flat');

      expect(propertyTypeSelect).toHaveValue('flat');
    });

    it('handles tenure selection correctly', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      const tenureSelect = screen.getByLabelText(/tenure/i);
      await user.selectOptions(tenureSelect, 'leasehold');

      expect(tenureSelect).toHaveValue('leasehold');
    });

    it('formats price input correctly', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Navigate to financial step
      await user.type(screen.getByLabelText(/property title/i), 'Test');
      await user.click(screen.getByTestId('next-step-button'));
      await user.type(screen.getByLabelText(/address line 1/i), 'Test St');
      await user.type(screen.getByLabelText(/city/i), 'Test City');
      await user.type(screen.getByLabelText(/postcode/i), 'TE1 2ST');
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('next-step-button'));

      const priceInput = screen.getByLabelText(/asking price/i);
      await user.type(priceInput, '250000');

      expect(priceInput).toHaveValue('250000');
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and ARIA attributes', () => {
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Check that all form fields have proper labels
      expect(screen.getByLabelText(/property title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/property type/i)).toBeInTheDocument();

      // Check for proper form structure
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('supports keyboard navigation between steps', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Tab through form elements
      await user.tab();
      expect(screen.getByLabelText(/property title/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/description/i)).toHaveFocus();
    });

    it('announces validation errors to screen readers', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Trigger validation error
      const titleInput = screen.getByLabelText(/property title/i);
      await user.click(titleInput);
      await user.tab(); // Focus away to trigger validation

      await waitFor(() => {
        const errorMessage = screen.getByText(/property title is required/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });

  describe('Dynamic Features', () => {
    it('shows/hides leasehold-specific fields based on tenure', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Navigate to basic details and set tenure to leasehold
      const tenureSelect = screen.getByLabelText(/tenure/i);
      await user.selectOptions(tenureSelect, 'leasehold');

      // Navigate to financial step to see leasehold fields
      await user.type(screen.getByLabelText(/property title/i), 'Test');
      await user.click(screen.getByTestId('next-step-button'));
      await user.type(screen.getByLabelText(/address line 1/i), 'Test St');
      await user.type(screen.getByLabelText(/city/i), 'Test City');
      await user.type(screen.getByLabelText(/postcode/i), 'TE1 2ST');
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('next-step-button'));

      // Should show leasehold-specific fields
      expect(screen.getByLabelText(/ground rent/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/lease years remaining/i)
      ).toBeInTheDocument();
    });
  });
});
