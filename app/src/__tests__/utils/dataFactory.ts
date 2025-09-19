// src/__tests__/utils/dataFactory.ts - Updated for Quick-Start workflow
import type { CreatePropertyData, Property } from '@/domains/properties/types';

/**
 * Builder pattern for creating test property data
 */
export class PropertyFormDataFactory {
  private data: Partial<CreatePropertyData> = {};

  constructor(initialData: Partial<CreatePropertyData> = {}) {
    this.data = {
      // Quick-Start essential fields
      title: 'Test Property',
      address: {
        line1: '123 Test Street',
        line2: '',
        city: 'London',
        county: 'Greater London',
        postcode: 'SW1A 1AA',
        country: 'UK',
      },
      tenure: 'freehold',
      fileReference: '123 Test Street - Test Sale', // NEW: Required field
      propertyType: 'detached',

      // Optional fields (removed from Quick-Start but available for testing)
      description: 'A beautiful test property',
      bedrooms: 3,
      bathrooms: 2,
      askingPrice: 500000,
      ...initialData,
    };
  }

  /**
   * Create minimal Quick-Start property data
   */
  static minimal(): PropertyFormDataFactory {
    return new PropertyFormDataFactory({
      title: 'Minimal Property',
      address: {
        line1: '1 Minimal Street',
        line2: '',
        city: 'London',
        county: '',
        postcode: 'M1N 1ML',
        country: 'UK',
      },
      tenure: 'freehold',
      fileReference: '1 Minimal Street',
      propertyType: 'flat',
      // No optional fields
    });
  }

  /**
   * Create leasehold property data (with leasehold-specific fields)
   */
  static leasehold(): PropertyFormDataFactory {
    return new PropertyFormDataFactory({
      title: 'Leasehold Apartment',
      address: {
        line1: '45 Leasehold Gardens',
        line2: 'Flat 2B',
        city: 'Manchester',
        county: 'Greater Manchester',
        postcode: 'M1 2LH',
        country: 'UK',
      },
      tenure: 'leasehold',
      fileReference: '45 Leasehold Gardens Flat 2B - Wilson Purchase',
      propertyType: 'flat',
      monthlyServiceCharge: 150,
      groundRent: 50,
      leaseYearsRemaining: 95,
      freeholder: 'Leasehold Management Ltd',
      managementCompany: 'Property Plus Management',
    });
  }

  /**
   * Create freehold house data
   */
  static freehold(): PropertyFormDataFactory {
    return new PropertyFormDataFactory({
      title: 'Freehold Family Home',
      address: {
        line1: '78 Freehold Avenue',
        line2: '',
        city: 'Birmingham',
        county: 'West Midlands',
        postcode: 'B1 2FH',
        country: 'UK',
      },
      tenure: 'freehold',
      fileReference: '78 Freehold Avenue - Johnson Sale',
      propertyType: 'detached',
      bedrooms: 4,
      bathrooms: 3,
      receptionRooms: 2,
      floorArea: 1800,
      plotSize: 5000,
    });
  }

  /**
   * Create property with auto-populated file reference
   */
  static withAutoReference(address: string): PropertyFormDataFactory {
    return new PropertyFormDataFactory({
      title: address,
      address: {
        line1: address,
        line2: '',
        city: 'Auto City',
        county: 'Auto County',
        postcode: 'AU1 2TO',
        country: 'UK',
      },
      tenure: 'freehold',
      fileReference: address, // Auto-populated from address
      propertyType: 'terraced',
    });
  }

  /**
   * Set custom data
   */
  with(customData: Partial<CreatePropertyData>): PropertyFormDataFactory {
    this.data = { ...this.data, ...customData };
    return this;
  }

  /**
   * Set address and auto-populate file reference
   */
  withAddress(
    line1: string,
    city: string = 'London',
    postcode: string = 'SW1A 1AA'
  ): PropertyFormDataFactory {
    const address = {
      line1,
      line2: '',
      city,
      county: '',
      postcode,
      country: 'UK',
    };

    return this.with({
      address,
      fileReference: line1, // Auto-populate from address
      title: line1, // Use address as title
    });
  }

  /**
   * Set custom file reference
   */
  withFileReference(fileReference: string): PropertyFormDataFactory {
    return this.with({ fileReference });
  }

  /**
   * Set tenure
   */
  withTenure(tenure: 'freehold' | 'leasehold'): PropertyFormDataFactory {
    return this.with({ tenure });
  }

  /**
   * Add leasehold-specific data
   */
  withLeaseholdDetails(details: {
    monthlyServiceCharge?: number;
    groundRent?: number;
    leaseYearsRemaining?: number;
    freeholder?: string;
    managementCompany?: string;
  }): PropertyFormDataFactory {
    return this.with({
      tenure: 'leasehold',
      ...details,
    });
  }

  /**
   * Build the final data object
   */
  build(): CreatePropertyData {
    return this.data as CreatePropertyData;
  }

  /**
   * Build as full Property object (for testing components that expect Property interface)
   */
  buildAsProperty(): Property {
    const baseData = this.build();
    return {
      ...baseData,
      id: 'test-property-id',
      status: 'draft' as const,
      ownerId: 'test-owner-id',
      completionPercentage: 25,
      isActive: true,
      isArchived: false,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-15'),
    };
  }
}

/**
 * Quick factory methods for common test scenarios
 */
export const TestPropertyData = {
  /**
   * Quick-Start minimal property (address + file reference + tenure only)
   */
  quickStart: () => PropertyFormDataFactory.minimal().build(),

  /**
   * Property with auto-populated file reference
   */
  withAutoReference: (address: string) =>
    PropertyFormDataFactory.withAutoReference(address).build(),

  /**
   * Leasehold property with all required fields
   */
  leasehold: () => PropertyFormDataFactory.leasehold().build(),

  /**
   * Freehold property with all required fields
   */
  freehold: () => PropertyFormDataFactory.freehold().build(),

  /**
   * Property for testing form validation errors
   */
  invalid: () =>
    ({
      title: '', // Empty title should cause validation error
      address: {
        line1: '', // Empty address should cause validation error
        line2: '',
        city: '',
        county: '',
        postcode: '',
        country: 'UK',
      },
      fileReference: '', // Empty file reference should cause validation error
      // Missing tenure should cause validation error
    }) as Partial<CreatePropertyData>,
};
