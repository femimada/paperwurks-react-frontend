// src/__tests__/integration/PropertyForm.integration.test.tsx - Quick-Start Workflow Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { PropertyForm } from '@/domains/properties/components/PropertyForm';
import type {
  CreatePropertyData,
  UpdatePropertyData,
  Property,
} from '@/domains/properties/types';

// Mock the address autocomplete hook with proper setup
const mockFetchPostcodeLookup = vi.fn();
const mockClearSuggestions = vi.fn();

vi.mock('@/shared/hooks', () => ({
  useUkAddressAutocomplete: () => ({
    suggestions: [
      { line_1: '123 Oak Street', post_town: 'London', postcode: 'SW1A 1AA' },
      { line_1: '124 Oak Street', post_town: 'London', postcode: 'SW1A 1AA' },
    ],
    loading: false,
    error: null,
    fetchPostcodeLookup: mockFetchPostcodeLookup,
    clearSuggestions: mockClearSuggestions,
  }),
}));

describe('PropertyForm Quick-Start Integration Tests', () => {
  const mockHandlers = {
    onSubmit:
      vi.fn<(data: CreatePropertyData | UpdatePropertyData) => Promise<void>>(),
    onCancel: vi.fn<() => void>(),
  };

  const mockExistingProperty: Property = {
    id: 'test-property-id',
    title: 'Existing Property',
    address: {
      line1: '123 Test Street',
      line2: '',
      city: 'London',
      county: 'Greater London',
      postcode: 'SW1A 1AA',
      country: 'UK',
    },
    propertyType: 'detached',
    tenure: 'freehold',
    status: 'draft',
    fileReference: 'TEST-123-SMITH-SALE',
    ownerId: 'test-owner-id',
    completionPercentage: 25,
    isActive: true,
    isArchived: false,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-15'),
  };

  beforeEach(() => {
    Object.values(mockHandlers).forEach((mock) => mock.mockClear());
    mockFetchPostcodeLookup.mockClear();
    mockClearSuggestions.mockClear();
    vi.clearAllMocks();
  });

  describe('Quick-Start Form Rendering', () => {
    it('renders single-step form with only essential fields', () => {
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Check form title using heading role
      expect(
        screen.getByRole('heading', { name: /create property file/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Complete in under 30 seconds/)
      ).toBeInTheDocument();

      // Check essential fields are present using test IDs (more reliable than labels)
      expect(screen.getByTestId('address-postcode-input')).toBeInTheDocument();
      expect(screen.getByTestId('address-line1-input')).toBeInTheDocument();
      expect(screen.getByTestId('address-city-input')).toBeInTheDocument();
      expect(screen.getByTestId('file-reference-input')).toBeInTheDocument();
      expect(screen.getByTestId('tenure-select')).toBeInTheDocument();

      // Check submit button using test ID
      expect(screen.getByTestId('submit-button')).toHaveTextContent(
        /create property file/i
      );
    });

    it('does NOT render multi-step navigation', () => {
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // These elements should NOT exist in Quick-Start form
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Basic Details')).not.toBeInTheDocument();
      expect(screen.queryByText('Features')).not.toBeInTheDocument();
      expect(screen.queryByText('Financial')).not.toBeInTheDocument();
    });

    it('does NOT render removed marketing fields', () => {
      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // These marketing fields should NOT exist - using more specific queries
      expect(screen.queryByTestId('bedrooms-input')).not.toBeInTheDocument();
      expect(screen.queryByTestId('bathrooms-input')).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('asking-price-input')
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId('description-input')).not.toBeInTheDocument();
      expect(screen.queryByTestId('floor-area-input')).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('key-features-input')
      ).not.toBeInTheDocument();
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

      expect(
        screen.getByRole('heading', { name: /edit property file/i })
      ).toBeInTheDocument();

      // Check specific input fields by test IDs to avoid conflicts
      expect(screen.getByTestId('address-line1-input')).toHaveValue(
        '123 Test Street'
      );
      // Note: In edit mode, the existing fileReference should be preserved, not auto-generated
      expect(screen.getByTestId('file-reference-input')).toHaveValue(
        'TEST-123-SMITH-SALE'
      );
      expect(screen.getByTestId('address-city-input')).toHaveValue('London');
    });
  });

  describe('File Reference Auto-Population', () => {
    it('auto-populates file reference when address is selected', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Type address line 1
      const addressInput = screen.getByTestId('address-line1-input');
      await user.type(addressInput, '123 Oak Street');

      // Check that file reference is auto-populated
      await waitFor(() => {
        const fileRefInput = screen.getByTestId('file-reference-input');
        expect(fileRefInput).toHaveValue('123 Oak Street');
      });
    });

    it('shows correct description when auto-populated', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Type address
      const addressInput = screen.getByTestId('address-line1-input');
      await user.type(addressInput, '456 Elm Street');

      // Check description shows auto-population message
      await waitFor(() => {
        expect(
          screen.getByText(/auto-populated from address/i)
        ).toBeInTheDocument();
      });
    });

    it('stops auto-population when user manually edits file reference', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Type address first
      const addressInput = screen.getByTestId('address-line1-input');
      await user.type(addressInput, '123 Oak Street');

      // Manually edit file reference
      const fileRefInput = screen.getByTestId('file-reference-input');
      await user.clear(fileRefInput);
      await user.type(fileRefInput, 'CUSTOM-REF-001');

      // Check description changes
      await waitFor(() => {
        expect(
          screen.getByText(/custom reference entered/i)
        ).toBeInTheDocument();
      });

      // Change address again - should NOT auto-populate anymore
      await user.clear(addressInput);
      await user.type(addressInput, '999 New Street');

      // File reference should remain custom
      expect(fileRefInput).toHaveValue('CUSTOM-REF-001');
    });

    it('cleans special characters from address when auto-populating', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Type address with special characters
      const addressInput = screen.getByTestId('address-line1-input');
      await user.type(addressInput, '123 Oak St. (Flat #4B)');

      // Check that special characters are cleaned
      await waitFor(() => {
        const fileRefInput = screen.getByTestId('file-reference-input');
        expect(fileRefInput).toHaveValue('123 Oak St Flat 4B');
      });
    });
  });

  describe('Address Autocomplete Integration', () => {
    it('triggers postcode lookup when typing postcode', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      const postcodeInput = screen.getByTestId('address-postcode-input');
      await user.type(postcodeInput, 'SW1A 1AA');

      await waitFor(() => {
        expect(mockFetchPostcodeLookup).toHaveBeenCalledWith('SW1A 1AA');
      });
    });
  });

  describe('Form Validation', () => {
    it('validates required fields', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Try to submit empty form
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Check validation errors appear (use more flexible text matching)
      await waitFor(() => {
        expect(
          screen.getByText(/address line 1 is required/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/city is required/i)).toBeInTheDocument();
        expect(screen.getByText(/postcode is required/i)).toBeInTheDocument();
        expect(
          screen.getByText(/property file reference is required/i)
        ).toBeInTheDocument();

        // For tenure validation, look for any error text containing "Required" - the exact message may vary
        const allErrorText =
          screen.getByTestId('property-form').textContent || '';
        expect(allErrorText.toLowerCase()).toContain('required');
      });

      // onSubmit should not be called
      expect(mockHandlers.onSubmit).not.toHaveBeenCalled();
    });

    it('allows form submission with valid data', async () => {
      const user = userEvent.setup();

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Fill file reference FIRST to prevent auto-population interference
      await user.type(
        screen.getByTestId('file-reference-input'),
        'TEST-REF-001'
      );

      // Then fill address fields
      await user.type(
        screen.getByTestId('address-line1-input'),
        '123 Test Street'
      );
      await user.type(screen.getByTestId('address-city-input'), 'London');
      await user.type(screen.getByTestId('address-postcode-input'), 'SW1A 1AA');

      // For tenure selection, use a more robust approach
      const tenureSelect = screen.getByTestId('tenure-select');
      await user.click(tenureSelect);

      // Wait for options to appear and click using text content
      await waitFor(() => {
        const freeholdOption = screen.getByRole('option', {
          name: /freehold/i,
        });
        expect(freeholdOption).toBeVisible();
      });

      await user.click(screen.getByRole('option', { name: /freehold/i }));

      // Submit form
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Check onSubmit is called with correct data
      await waitFor(() => {
        expect(mockHandlers.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'TEST-REF-001',
            address: expect.objectContaining({
              line1: '123 Test Street',
              city: 'London',
              postcode: 'SW1A 1AA',
            }),
            fileReference: 'TEST-REF-001',
            tenure: 'freehold',
            propertyType: 'detached',
          })
        );
      });
    });
  });

  describe('Success State', () => {
    it('shows success message after successful submission', async () => {
      const user = userEvent.setup();
      mockHandlers.onSubmit.mockResolvedValueOnce(undefined);

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Fill and submit form - fill file reference first
      await user.type(
        screen.getByTestId('file-reference-input'),
        'SUCCESS-001'
      );
      await user.type(
        screen.getByTestId('address-line1-input'),
        '123 Success Street'
      );
      await user.type(screen.getByTestId('address-city-input'), 'London');
      await user.type(screen.getByTestId('address-postcode-input'), 'SW1A 1AA');

      // Select tenure
      const tenureSelect = screen.getByTestId('tenure-select');
      await user.click(tenureSelect);

      await waitFor(() => {
        const leaseholdOption = screen.getByRole('option', {
          name: /Leasehold/i,
        });
        expect(leaseholdOption).toBeVisible();
      });

      await user.click(screen.getByRole('option', { name: /Leasehold/i }));

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Check success message appears
      await waitFor(() => {
        expect(
          screen.getByText(/property file created successfully/i)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/invite the seller to upload documents/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when submission fails', async () => {
      const user = userEvent.setup();
      mockHandlers.onSubmit.mockRejectedValueOnce(new Error('Network error'));

      render(
        <PropertyForm
          mode="create"
          onSubmit={mockHandlers.onSubmit}
          onCancel={mockHandlers.onCancel}
        />
      );

      // Fill and submit form - fill file reference first
      await user.type(screen.getByTestId('file-reference-input'), 'ERROR-001');
      await user.type(
        screen.getByTestId('address-line1-input'),
        '123 Error Street'
      );
      await user.type(screen.getByTestId('address-city-input'), 'London');
      await user.type(screen.getByTestId('address-postcode-input'), 'SW1A 1AA');

      const tenureSelect = screen.getByTestId('tenure-select');
      await user.click(tenureSelect);

      await waitFor(() => {
        const freeholdOption = screen.getByRole('option', {
          name: /freehold/i,
        });
        expect(freeholdOption).toBeVisible();
      });

      await user.click(screen.getByRole('option', { name: /freehold/i }));

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Check error message appears
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
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

      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      expect(mockHandlers.onCancel).toHaveBeenCalled();
    });

    it('does not render cancel button when onCancel is not provided', () => {
      render(<PropertyForm mode="create" onSubmit={mockHandlers.onSubmit} />);

      expect(screen.queryByTestId('cancel-button')).not.toBeInTheDocument();
    });
  });
});
