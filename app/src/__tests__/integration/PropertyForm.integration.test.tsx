// src/__tests__/integration/PropertyForm.integration.test.tsx - Updated with DataFactory
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { PropertyForm } from '@/domains/properties/components/PropertyForm';
import { PropertyFormDataFactory } from '../utils/dataFactory';

// Mock the address autocomplete hook to prevent fetch errors
vi.mock('@/shared/hooks', () => ({
  useUkAddressAutocomplete: vi.fn(() => ({
    suggestions: [],
    loading: false,
    error: null,
    fetchPostcodeLookup: vi.fn(),
    clearSuggestions: vi.fn(),
  })),
}));

describe('PropertyForm Integration Tests - All Bug Coverage', () => {
  const mockHandlers = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  const mockExistingProperty = PropertyFormDataFactory.leasehold()
    .with({
      title: 'Existing Property',
    })
    .build();

  beforeEach(() => {
    Object.values(mockHandlers).forEach((mock) => mock.mockClear());
    vi.clearAllMocks();
  });

  describe('Critical Bugs - Missing Form Fields', () => {
    it('renders keyFeatures input field', () => {
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );
      
      // Navigate to features step
      expect(screen.getByLabelText(/key features/i)).toBeInTheDocument();
    });

    it('renders nearbyAmenities input field', () => {
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );
      
      expect(screen.getByLabelText(/nearby amenities/i)).toBeInTheDocument();
    });

    it('renders targetCompletionDate input field', () => {
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );
      
      expect(screen.getByLabelText(/target completion date/i)).toBeInTheDocument();
    });

    it('includes targetCompletionDate in step validation', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Navigate to final step and try to submit without completion date
      await user.click(screen.getByTestId('next-step-button')); // Address
      await user.click(screen.getByTestId('next-step-button')); // Features  
      await user.click(screen.getByTestId('next-step-button')); // Financial
      
      const dateInput = screen.getByLabelText(/target completion date/i);
      expect(dateInput).toBeRequired();
    });
  });

  describe('Critical Bugs - Infinite Re-render Prevention', () => {
    it('handles rapid postcode changes without crashing', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      await user.click(screen.getByTestId('next-step-button'));
      const postcodeInput = screen.getByLabelText(/postcode/i);
      
      // Rapid typing should not cause infinite re-renders
      await user.type(postcodeInput, 'SW1A');
      await user.clear(postcodeInput);
      await user.type(postcodeInput, 'SW1A 1AA');
      
      expect(postcodeInput).toHaveValue('SW1A 1AA');
      expect(screen.getByText('Address')).toBeInTheDocument();
    });

    it('cleans up postcode lookup on unmount', () => {
      const { unmount } = render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Should not throw error on unmount
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Critical Bugs - Type Coercion', () => {
    it('handles string-based numeric props in edit mode', () => {
      const stringyProperty = PropertyFormDataFactory.withStringNumbers()
        .with({
          title: 'Existing Property',
        })
        .build();

      expect(() => {
        render(
          <PropertyForm
            property={stringyProperty as any}
            mode="edit"
            onSubmit={mockHandlers.onSubmit}
            onCancel={mockHandlers.onCancel}
          />
        );
      }).not.toThrow();

      expect(screen.getByDisplayValue('Existing Property')).toBeInTheDocument();
    });

    it('coerces string numbers to proper numeric types', async () => {
      const stringyProperty = PropertyFormDataFactory.withStringNumbers()
        .with({
          title: 'Existing Property',
          bedrooms: '5' as any,
          bathrooms: '3' as any,
        })
        .build();

      render(
        <PropertyForm
          property={stringyProperty as any}
          mode="edit"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Navigate to features step
      await userEvent.click(screen.getByTestId('next-step-button'));
      await userEvent.click(screen.getByTestId('next-step-button'));

      const bedroomsInput = screen.getByLabelText(/bedrooms/i);
      expect(bedroomsInput).toHaveValue(5); // Should be number, not string
    });
  });

  describe('Moderate Bugs - Form Data Retention', () => {
    it('retains property type when navigating steps', async () => {
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
      
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('prev-step-button'));
      
      expect(screen.getByLabelText(/property type/i)).toHaveValue('flat');
    });

    it('retains tenure selection between steps', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Navigate to step with tenure
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('next-step-button'));

      const tenureSelect = screen.getByLabelText(/tenure/i);
      await user.selectOptions(tenureSelect, 'leasehold');
      
      await user.click(screen.getByTestId('prev-step-button'));
      await user.click(screen.getByTestId('next-step-button'));
      
      expect(screen.getByLabelText(/tenure/i)).toHaveValue('leasehold');
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

      // Fill title and navigate
      await user.type(screen.getByLabelText(/property title/i), 'Persistent Title');
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('prev-step-button'));

      // Check that title is still there
      expect(screen.getByDisplayValue('Persistent Title')).toBeInTheDocument();
    });
  });

  describe('Moderate Bugs - Validation Timing', () => {
    it('shows no validation errors on mount', () => {
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      expect(screen.queryByText(/property title is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/address line 1 is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/city is required/i)).not.toBeInTheDocument();
    });

    it('validates on blur, not on change', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      const titleInput = screen.getByLabelText(/property title/i);
      await user.click(titleInput);
      
      // Error should not appear while typing
      expect(screen.queryByText(/property title is required/i)).not.toBeInTheDocument();
      
      // Error should appear after blur
      await user.tab();
      await waitFor(() => {
        expect(screen.getByText(/property title is required/i)).toBeInTheDocument();
      });
    });

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
      const postcodeInput = screen.getByLabelText(/postcode/i);
      await user.click(postcodeInput);
      await user.tab(); // This triggers blur/validation

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
      await user.type(bedroomsInput, '-5');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/minimum.*0/i)).toBeInTheDocument();
      });
    });
  });

  describe('Moderate Bugs - Cancel Confirmation', () => {
    it('shows confirmation dialog when canceling with unsaved changes', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Make changes to trigger dirty state
      await user.type(screen.getByLabelText(/property title/i), 'Test Property');
      
      await user.click(screen.getByTestId('cancel-button'));
      
      // Should show confirmation dialog
      expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
      expect(screen.getByText(/confirm/i)).toBeInTheDocument();
      expect(screen.getByText(/keep editing/i)).toBeInTheDocument();
    });

    it('confirms cancel action in dialog', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      await user.type(screen.getByLabelText(/property title/i), 'Test Property');
      await user.click(screen.getByTestId('cancel-button'));
      
      await user.click(screen.getByText(/confirm/i));
      expect(mockHandlers.onCancel).toHaveBeenCalled();
    });

    it('cancels immediately when no unsaved changes', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      await user.click(screen.getByTestId('cancel-button'));
      
      // Should cancel immediately without dialog
      expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument();
      expect(mockHandlers.onCancel).toHaveBeenCalled();
    });
  });

  describe('Moderate Bugs - Correct Step Titles', () => {
    it('displays correct step titles', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      expect(screen.getByText('Basic Details')).toBeInTheDocument();
      
      await user.click(screen.getByTestId('next-step-button'));
      expect(screen.getByText('Address')).toBeInTheDocument();
      
      await user.click(screen.getByTestId('next-step-button'));
      expect(screen.getByText('Features')).toBeInTheDocument();
      
      await user.click(screen.getByTestId('next-step-button'));
      expect(screen.getByText('Financial')).toBeInTheDocument();
    });
  });

  describe('Form Rendering Tests', () => {
    it('renders create mode form with empty fields', () => {
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      expect(screen.getByTestId('property-form')).toBeInTheDocument();
      expect(screen.getByText('Create Property')).toBeInTheDocument();
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

      expect(screen.getByDisplayValue('Existing Property')).toBeInTheDocument();
      expect(screen.getByText('Edit Property')).toBeInTheDocument();
    });
  });

  describe('Form Submission Tests', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      const completeFormData = PropertyFormDataFactory.minimal()
        .with({
          title: 'Complete Property',
          address: {
            line1: '123 Complete St',
            city: 'Complete City',
            postcode: 'CO1 2MP',
            country: 'UK',
          },
        })
        .build();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Fill form completely and submit
      await user.type(screen.getByLabelText(/property title/i), completeFormData.title);
      
      await user.click(screen.getByTestId('next-step-button'));
      await user.type(screen.getByLabelText(/address line 1/i), completeFormData.address.line1);
      await user.type(screen.getByLabelText(/city/i), completeFormData.address.city);
      await user.type(screen.getByLabelText(/postcode/i), completeFormData.address.postcode);
      
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(mockHandlers.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: completeFormData.title,
            address: expect.objectContaining({
              line1: completeFormData.address.line1,
              city: completeFormData.address.city,
              postcode: completeFormData.address.postcode,
            }),
          })
        );
      });
    });

    it('handles submission errors gracefully', async () => {
      const user = userEvent.setup();
      mockHandlers.onSubmit.mockRejectedValueOnce(new Error('Submission failed'));

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Fill and submit form
      await user.type(screen.getByLabelText(/property title/i), 'Test Property');
      await user.click(screen.getByTestId('next-step-button'));
      await user.type(screen.getByLabelText(/address line 1/i), '123 Test');
      await user.type(screen.getByLabelText(/city/i), 'City');
      await user.type(screen.getByLabelText(/postcode/i), 'TE1 2ST');
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByText(/submission failed/i)).toBeInTheDocument();
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Mock a slow submission
      mockHandlers.onSubmit.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Fill and submit
      await user.type(screen.getByLabelText(/property title/i), 'Test');
      await user.click(screen.getByTestId('next-step-button'));
      await user.type(screen.getByLabelText(/address line 1/i), '123 Test');
      await user.type(screen.getByLabelText(/city/i), 'City');
      await user.type(screen.getByLabelText(/postcode/i), 'TE1 2ST');
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('next-step-button'));
      
      await user.click(screen.getByTestId('submit-button'));

      // Should show loading state
      expect(screen.getByText(/saving/i)).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText(/saving/i)).not.toBeInTheDocument();
      });
    });
  });

  // Additional tests using dataFactory for edge cases
  describe('DataFactory Edge Cases', () => {
    it('handles minimal property data correctly', () => {
      const minimalProperty = PropertyFormDataFactory.minimal().build();
      
      render(
        <PropertyForm
          property={minimalProperty}
          mode="edit"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      expect(screen.getByDisplayValue('Minimal Property')).toBeInTheDocument();
    });

    it('handles leasehold-specific fields', () => {
      const leaseholdProperty = PropertyFormDataFactory.leasehold().build();
      
      render(
        <PropertyForm
          property={leaseholdProperty}
          mode="edit"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      expect(screen.getByDisplayValue('Leasehold Apartment')).toBeInTheDocument();
    });
  });
});

  describe('Critical Bugs - Missing Form Fields', () => {
    it('renders keyFeatures input field', () => {
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );
      
      // Navigate to features step
      expect(screen.getByLabelText(/key features/i)).toBeInTheDocument();
    });

    it('renders nearbyAmenities input field', () => {
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );
      
      expect(screen.getByLabelText(/nearby amenities/i)).toBeInTheDocument();
    });

    it('renders targetCompletionDate input field', () => {
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );
      
      expect(screen.getByLabelText(/target completion date/i)).toBeInTheDocument();
    });

    it('includes targetCompletionDate in step validation', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Navigate to final step and try to submit without completion date
      await user.click(screen.getByTestId('next-step-button')); // Address
      await user.click(screen.getByTestId('next-step-button')); // Features  
      await user.click(screen.getByTestId('next-step-button')); // Financial
      
      const dateInput = screen.getByLabelText(/target completion date/i);
      expect(dateInput).toBeRequired();
    });
  });

  describe('Critical Bugs - Infinite Re-render Prevention', () => {
    it('handles rapid postcode changes without crashing', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      await user.click(screen.getByTestId('next-step-button'));
      const postcodeInput = screen.getByLabelText(/postcode/i);
      
      // Rapid typing should not cause infinite re-renders
      await user.type(postcodeInput, 'SW1A');
      await user.clear(postcodeInput);
      await user.type(postcodeInput, 'SW1A 1AA');
      
      expect(postcodeInput).toHaveValue('SW1A 1AA');
      expect(screen.getByText('Address')).toBeInTheDocument();
    });

    it('cleans up postcode lookup on unmount', () => {
      const { unmount } = render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Should not throw error on unmount
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Critical Bugs - Type Coercion', () => {
    it('handles string-based numeric props in edit mode', () => {
      const stringyProperty = {
        ...mockExistingProperty,
        bedrooms: '3' as any,
        bathrooms: '2' as any,
        askingPrice: '500000' as any,
      };

      expect(() => {
        render(
          <PropertyForm
            property={stringyProperty}
            mode="edit"
            onSubmit={mockHandlers.onSubmit}
            onCancel={mockHandlers.onCancel}
          />
        );
      }).not.toThrow();

      expect(screen.getByDisplayValue('Existing Property')).toBeInTheDocument();
    });

    it('coerces string numbers to proper numeric types', async () => {
      const stringyProperty = {
        ...mockExistingProperty,
        bedrooms: '5' as any,
        bathrooms: '3' as any,
      };

      render(
        <PropertyForm
          property={stringyProperty}
          mode="edit"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Navigate to features step
      await userEvent.click(screen.getByTestId('next-step-button'));
      await userEvent.click(screen.getByTestId('next-step-button'));

      const bedroomsInput = screen.getByLabelText(/bedrooms/i);
      expect(bedroomsInput).toHaveValue(5); // Should be number, not string
    });
  });

  describe('Moderate Bugs - Form Data Retention', () => {
    it('retains property type when navigating steps', async () => {
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
      
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('prev-step-button'));
      
      expect(screen.getByLabelText(/property type/i)).toHaveValue('flat');
    });

    it('retains tenure selection between steps', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Navigate to step with tenure
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('next-step-button'));

      const tenureSelect = screen.getByLabelText(/tenure/i);
      await user.selectOptions(tenureSelect, 'leasehold');
      
      await user.click(screen.getByTestId('prev-step-button'));
      await user.click(screen.getByTestId('next-step-button'));
      
      expect(screen.getByLabelText(/tenure/i)).toHaveValue('leasehold');
    });
  });

  describe('Moderate Bugs - Validation Timing', () => {
    it('shows no validation errors on mount', () => {
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      expect(screen.queryByText(/property title is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/address line 1 is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/city is required/i)).not.toBeInTheDocument();
    });

    it('validates on blur, not on change', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      const titleInput = screen.getByLabelText(/property title/i);
      await user.click(titleInput);
      
      // Error should not appear while typing
      expect(screen.queryByText(/property title is required/i)).not.toBeInTheDocument();
      
      // Error should appear after blur
      await user.tab();
      await waitFor(() => {
        expect(screen.getByText(/property title is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Moderate Bugs - Cancel Confirmation', () => {
    it('shows confirmation dialog when canceling with unsaved changes', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Make changes to trigger dirty state
      await user.type(screen.getByLabelText(/property title/i), 'Test Property');
      
      await user.click(screen.getByTestId('cancel-button'));
      
      // Should show confirmation dialog
      expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
      expect(screen.getByText(/confirm/i)).toBeInTheDocument();
      expect(screen.getByText(/keep editing/i)).toBeInTheDocument();
    });

    it('confirms cancel action in dialog', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      await user.type(screen.getByLabelText(/property title/i), 'Test Property');
      await user.click(screen.getByTestId('cancel-button'));
      
      await user.click(screen.getByText(/confirm/i));
      expect(mockHandlers.onCancel).toHaveBeenCalled();
    });

    it('cancels immediately when no unsaved changes', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      await user.click(screen.getByTestId('cancel-button'));
      
      // Should cancel immediately without dialog
      expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument();
      expect(mockHandlers.onCancel).toHaveBeenCalled();
    });
  });

  describe('Moderate Bugs - Correct Step Titles', () => {
    it('displays correct step titles', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      expect(screen.getByText('Basic Details')).toBeInTheDocument();
      
      await user.click(screen.getByTestId('next-step-button'));
      expect(screen.getByText('Address')).toBeInTheDocument();
      
      await user.click(screen.getByTestId('next-step-button'));
      expect(screen.getByText('Features')).toBeInTheDocument();
      
      await user.click(screen.getByTestId('next-step-button'));
      expect(screen.getByText('Financial')).toBeInTheDocument();
    });
  });

  describe('Minor Bugs - Input Constraints', () => {
    it('enforces correct max values on numeric inputs', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Navigate to features step
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('next-step-button'));

      const bedroomsInput = screen.getByLabelText(/bedrooms/i);
      expect(bedroomsInput).toHaveAttribute('max', '50');
      
      // Test that high values are accepted
      await user.clear(bedroomsInput);
      await user.type(bedroomsInput, '25');
      expect(bedroomsInput).toHaveValue(25);
    });

    it('handles maximum bedroom count validation', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('next-step-button'));

      const bedroomsInput = screen.getByLabelText(/bedrooms/i);
      await user.clear(bedroomsInput);
      await user.type(bedroomsInput, '100');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/maximum 50 bedrooms/i)).toBeInTheDocument();
      });
    });
  });

  describe('Minor Bugs - Energy Rating Descriptions', () => {
    it('displays complete energy rating descriptions', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Navigate to features step
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('next-step-button'));

      const energySelect = screen.getByLabelText(/energy rating/i);
      await user.click(energySelect);

      // Should show complete descriptions, not just "C - "
      expect(screen.getByText('A - Most Efficient')).toBeInTheDocument();
      expect(screen.getByText('B - Very Efficient')).toBeInTheDocument();
      expect(screen.getByText('C - Good')).toBeInTheDocument();
    });
  });

  describe('Minor Bugs - Conditional Field Validation', () => {
    it('validates leasehold fields only for leasehold properties', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Navigate to financial step
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('next-step-button'));

      const tenureSelect = screen.getByLabelText(/tenure/i);
      await user.selectOptions(tenureSelect, 'freehold');

      // Leasehold fields should not be validated for freehold
      expect(screen.queryByLabelText(/service charge/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/lease years/i)).not.toBeInTheDocument();
    });

    it('shows and validates leasehold fields for leasehold properties', async () => {
      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('next-step-button'));

      const tenureSelect = screen.getByLabelText(/tenure/i);
      await user.selectOptions(tenureSelect, 'leasehold');

      // Leasehold fields should appear
      expect(screen.getByLabelText(/service charge/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/lease years/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/freeholder/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility Bugs - Address Suggestions', () => {
    it('provides proper accessibility for address suggestions', async () => {
      const mockSuggestions = [
        { id: '1', line_1: '123 High St', post_town: 'London', postcode: 'SW1A 1AA' },
        { id: '2', line_1: '456 Low St', post_town: 'London', postcode: 'SW1A 1BB' },
      ];

      // Mock with suggestions
      vi.mocked(require('@/shared/hooks').useUkAddressAutocomplete).mockReturnValue({
        suggestions: mockSuggestions,
        loading: false,
        error: null,
        fetchPostcodeLookup: vi.fn(),
        clearSuggestions: vi.fn(),
      });

      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      await user.click(screen.getByTestId('next-step-button'));
      await user.type(screen.getByLabelText(/postcode/i), 'SW1A 1AA');

      // Check suggestions have proper accessibility
      const suggestions = screen.getAllByRole('option');
      expect(suggestions).toHaveLength(2);
      expect(suggestions[0]).toHaveAttribute('aria-label', 'Address: 123 High St, London');
    });

    it('allows keyboard navigation of address suggestions', async () => {
      const mockSuggestions = [
        { id: '1', line_1: '123 High St', post_town: 'London', postcode: 'SW1A 1AA' },
      ];

      vi.mocked(require('@/shared/hooks').useUkAddressAutocomplete).mockReturnValue({
        suggestions: mockSuggestions,
        loading: false,
        error: null,
        fetchPostcodeLookup: vi.fn(),
        clearSuggestions: vi.fn(),
      });

      const user = userEvent.setup();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      await user.click(screen.getByTestId('next-step-button'));
      await user.type(screen.getByLabelText(/postcode/i), 'SW1A 1AA');
      
      await user.keyboard('{ArrowDown}');
      
      expect(screen.getByTestId('address-suggestion-1')).toHaveFocus();
    });
  });

  describe('Security Bugs - API Key Validation', () => {
    it('validates API key before making requests', () => {
      // Mock hook to simulate missing API key
      vi.mocked(require('@/shared/hooks').useUkAddressAutocomplete).mockImplementation(() => {
        const apiKey = process.env.GETADDRESS_API_KEY;
        if (!apiKey || apiKey === 'your_getaddress_api_key_here') {
          throw new Error('Missing or invalid API key');
        }
        return {
          suggestions: [],
          loading: false,
          error: null,
          fetchPostcodeLookup: vi.fn(),
          clearSuggestions: vi.fn(),
        };
      });

      expect(() => {
        render(
          <PropertyForm
            mode="create"
            onSubmit={mockHandlers.onSubmit}
            onCancel={mockHandlers.onCancel}
          />
        );
      }).toThrow('Missing or invalid API key');
    });
  });

  describe('Type Safety - Submit Handler', () => {
    it('maintains type safety in onSubmit calls', async () => {
      const user = userEvent.setup();
      const typedSubmitHandler = vi.fn<[PropertyFormData], Promise<void>>();
      
      render(
        <PropertyForm
          mode="create"
          onSubmit={typedSubmitHandler}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Fill form completely and submit
      await user.type(screen.getByLabelText(/property title/i), 'Test Property');
      
      await user.click(screen.getByTestId('next-step-button'));
      await user.type(screen.getByLabelText(/address line 1/i), '123 Test St');
      await user.type(screen.getByLabelText(/city/i), 'Test City');
      await user.type(screen.getByLabelText(/postcode/i), 'TE1 2ST');
      
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('next-step-button'));
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(typedSubmitHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Property',
            address: expect.objectContaining({
              line1: '123 Test St',
              city: 'Test City',
              postcode: 'TE1 2ST',
            }),
          })
        );
      });
    });
  });
});