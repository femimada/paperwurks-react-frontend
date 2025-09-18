// src/__tests__/utils/dataFactory.ts
import type {
  PropertyListItem,
  CreatePropertyData,
  UpdatePropertyData,
  PropertyFilters,
} from '@/domains/properties/types';
import type { User } from '@/domains/auth/types';
import type {
  PaginationParams,
  SortParams,
  PropertyType,
  PropertyStatus,
} from '@/shared/types/global.types';

/**
 * Test data factory for creating consistent test data across test files
 * Provides builders with sensible defaults and easy customization
 */

// Base factory class for common functionality
abstract class BaseFactory<T> {
  protected data: Partial<T> = {};

  abstract build(): T;

  with(overrides: Partial<T>): this {
    this.data = { ...this.data, ...overrides };
    return this;
  }

  reset(): this {
    this.data = {};
    return this;
  }
}

// Property List Item Factory
export class PropertyListItemFactory extends BaseFactory<PropertyListItem> {
  constructor() {
    super();
    this.data = {
      id: 'prop-1',
      title: 'Modern Family Home',
      propertyType: 'detached',
      tenure: 'freehold',
      status: 'ready',
      askingPrice: 750000,
      bedrooms: 4,
      bathrooms: 3,
      receptionRooms: 2,
      address: {
        line1: '123 Oak Street',
        city: 'London',
        postcode: 'SW1A 1AA',
        country: 'UK',
      },
      owner: {
        id: 'owner-1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
      },
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-20'),
      completionPercentage: 85,
    };
  }

  build(): PropertyListItem {
    return this.data as PropertyListItem;
  }

  // Preset configurations
  static terraced(): PropertyListItemFactory {
    return new PropertyListItemFactory().with({
      id: 'prop-terraced',
      title: 'Beautiful Victorian Home',
      propertyType: 'terraced',
      askingPrice: 550000,
      bedrooms: 3,
      bathrooms: 2,
      address: {
        line1: '42 Maple Street',
        line2: '',
        city: 'Edinburgh',
        county: 'Midlothian',
        postcode: 'EH1 2AB',
        country: 'UK',
      },
      owner: {
        id: 'owner-2',
        firstName: 'Alice',
        lastName: 'Watson',
        email: 'alice.watson@example.com',
      },
      createdAt: new Date('2023-03-01'),
      updatedAt: new Date('2023-03-15'),
    });
  }

  static flat(): PropertyListItemFactory {
    return new PropertyListItemFactory().with({
      id: 'prop-flat',
      title: 'City Centre Apartment',
      propertyType: 'flat',
      tenure: 'leasehold',
      status: 'in_progress',
      askingPrice: 300000,
      bedrooms: 2,
      bathrooms: 1,
      receptionRooms: 1,
      address: {
        line1: '456 High Street',
        line2: 'Flat 4B',
        city: 'Manchester',
        county: 'Greater Manchester',
        postcode: 'M1 1AA',
        country: 'UK',
      },
      owner: {
        id: 'owner-3',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com',
      },
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date('2023-02-05'),
      completionPercentage: 45,
    });
  }

  static withoutOptionalFields(): PropertyListItemFactory {
    return new PropertyListItemFactory().with({
      id: 'prop-minimal',
      title: 'Simple Property',
      askingPrice: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      receptionRooms: undefined,
      completionPercentage: 20,
    });
  }

  static draft(): PropertyListItemFactory {
    return new PropertyListItemFactory().with({
      id: 'prop-draft',
      title: 'Draft Property',
      status: 'draft',
      askingPrice: undefined,
      completionPercentage: 15,
    });
  }
}

// Property Form Data Factory (using CreatePropertyData)
export class PropertyFormDataFactory extends BaseFactory<CreatePropertyData> {
  constructor() {
    super();
    this.data = {
      title: 'Test Property',
      propertyType: 'detached',
      tenure: 'freehold',
      address: {
        line1: '123 Test Street',
        line2: '',
        city: 'Test City',
        county: 'Test County',
        postcode: 'TE1 2ST',
        country: 'UK',
      },
      bedrooms: 3,
      bathrooms: 2,
      receptionRooms: 1,
      askingPrice: 500000,
      description: 'A beautiful test property with modern amenities.',
      keyFeatures: ['garden', 'parking', 'modern kitchen'],
      nearbyAmenities: ['school', 'shops', 'transport'],
      targetCompletionDate: new Date('2024-06-01'),
      energyRating: 'C',
      councilTaxBand: 'D',
    };
  }

  build(): CreatePropertyData {
    return this.data as CreatePropertyData;
  }

  static leasehold(): PropertyFormDataFactory {
    return new PropertyFormDataFactory().with({
      title: 'Leasehold Apartment',
      propertyType: 'flat',
      tenure: 'leasehold',
      monthlyServiceCharge: 150,
      leaseYearsRemaining: 99,
      freeholder: 'ABC Estates Ltd',
      managementCompany: 'Property Management Co',
    });
  }

  static minimal(): PropertyFormDataFactory {
    return new PropertyFormDataFactory().with({
      title: 'Minimal Property',
      bedrooms: undefined,
      bathrooms: undefined,
      receptionRooms: undefined,
      askingPrice: undefined,
      description: '',
      keyFeatures: [],
      nearbyAmenities: [],
      targetCompletionDate: undefined,
      energyRating: undefined,
      councilTaxBand: undefined,
    });
  }

  static withStringNumbers(): PropertyFormDataFactory {
    return new PropertyFormDataFactory().with({
      bedrooms: '4' as any,
      bathrooms: '3' as any,
      askingPrice: '750000' as any,
    });
  }
}

// User Factory
export class UserFactory extends BaseFactory<User> {
  constructor() {
    super();
    this.data = {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'owner',
      permissions: ['property:read', 'property:create'],
      isEmailVerified: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    };
  }

  build(): User {
    return this.data as User;
  }

  static agent(): UserFactory {
    return new UserFactory().with({
      id: 'user-agent',
      email: 'agent@example.com',
      firstName: 'Estate',
      lastName: 'Agent',
      role: 'agent',
      permissions: ['property:read', 'property:create'],
    });
  }

  static buyer(): UserFactory {
    return new UserFactory().with({
      id: 'user-buyer',
      email: 'buyer@example.com',
      firstName: 'Property',
      lastName: 'Buyer',
      role: 'buyer',
      permissions: ['property:read'],
    });
  }

  static solicitor(): UserFactory {
    return new UserFactory().with({
      id: 'user-solicitor',
      email: 'solicitor@example.com',
      firstName: 'Legal',
      lastName: 'Solicitor',
      role: 'solicitor',
      permissions: ['property:read'],
    });
  }
}

// Login Form Data interface (since it doesn't exist in auth types)
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Login Form Data Factory
export class LoginFormDataFactory extends BaseFactory<LoginFormData> {
  constructor() {
    super();
    this.data = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false,
    };
  }

  build(): LoginFormData {
    return this.data as LoginFormData;
  }

  static withRememberMe(): LoginFormDataFactory {
    return new LoginFormDataFactory().with({
      rememberMe: true,
    });
  }

  static invalid(): LoginFormDataFactory {
    return new LoginFormDataFactory().with({
      email: 'invalid-email',
      password: 'short',
    });
  }
}

// Pagination Factory
export class PaginationFactory extends BaseFactory<PaginationParams> {
  constructor() {
    super();
    this.data = {
      page: 1,
      limit: 10,
    };
  }

  build(): PaginationParams {
    return this.data as PaginationParams;
  }

  static withLargeLimit(): PaginationFactory {
    return new PaginationFactory().with({
      limit: 50,
    });
  }

  static secondPage(): PaginationFactory {
    return new PaginationFactory().with({
      page: 2,
    });
  }
}

// Sort Parameters Factory
export class SortFactory extends BaseFactory<SortParams> {
  constructor() {
    super();
    this.data = {
      field: 'updatedAt',
      direction: 'desc',
    };
  }

  build(): SortParams {
    return this.data as SortParams;
  }

  static byPrice(): SortFactory {
    return new SortFactory().with({
      field: 'askingPrice',
      direction: 'asc',
    });
  }

  static byTitle(): SortFactory {
    return new SortFactory().with({
      field: 'title',
      direction: 'asc',
    });
  }
}

// Property Filters Factory
export class PropertyFiltersFactory extends BaseFactory<PropertyFilters> {
  constructor() {
    super();
    this.data = {};
  }

  build(): PropertyFilters {
    return this.data as PropertyFilters;
  }

  static byType(type: PropertyType): PropertyFiltersFactory {
    return new PropertyFiltersFactory().with({
      propertyType: type,
    });
  }

  static byPriceRange(min: number, max: number): PropertyFiltersFactory {
    return new PropertyFiltersFactory().with({
      minPrice: min,
      maxPrice: max,
    });
  }

  static byBedrooms(bedrooms: number): PropertyFiltersFactory {
    return new PropertyFiltersFactory().with({
      bedrooms,
    });
  }

  static byStatus(status: PropertyStatus): PropertyFiltersFactory {
    return new PropertyFiltersFactory().with({
      status,
    });
  }
}

// Utility functions for creating arrays of test data
export const TestDataUtils = {
  /**
   * Create multiple property list items with sequential IDs
   */
  createProperties(count: number): PropertyListItem[] {
    return Array.from({ length: count }, (_, index) =>
      new PropertyListItemFactory()
        .with({
          id: `prop-${index + 1}`,
          title: `Property ${index + 1}`,
          askingPrice: 500000 + index * 50000,
        })
        .build()
    );
  },

  /**
   * Create mixed property types for testing
   */
  createMixedProperties(): PropertyListItem[] {
    return [
      PropertyListItemFactory.terraced().build(),
      PropertyListItemFactory.flat().build(),
      new PropertyListItemFactory().build(), // detached (default)
      PropertyListItemFactory.draft().build(),
      PropertyListItemFactory.withoutOptionalFields().build(),
    ];
  },

  /**
   * Create pagination response structure
   */
  createPaginationResponse<T>(
    items: T[],
    page: number = 1,
    limit: number = 10,
    total?: number
  ) {
    const actualTotal = total ?? items.length;
    const totalPages = Math.ceil(actualTotal / limit);

    return {
      data: items,
      pagination: {
        page,
        limit,
        total: actualTotal,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },

  /**
   * Create mock API response structure
   */
  createApiResponse<T>(data: T, success: boolean = true) {
    return {
      success,
      data,
      message: success ? 'Success' : 'Error occurred',
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Create mock error response
   */
  createErrorResponse(message: string, code: number = 400) {
    return {
      success: false,
      error: {
        message,
        code,
        details: {},
      },
      timestamp: new Date().toISOString(),
    };
  },
};

// Export individual factory instances for convenience
export const propertyFactory = new PropertyListItemFactory();
export const propertyFormFactory = new PropertyFormDataFactory();
export const userFactory = new UserFactory();
export const loginFactory = new LoginFormDataFactory();
export const paginationFactory = new PaginationFactory();
export const sortFactory = new SortFactory();
export const filtersFactory = new PropertyFiltersFactory();

// Export common test data sets
export const TEST_DATA = {
  // Common properties for testing
  PROPERTIES: {
    TERRACED: PropertyListItemFactory.terraced().build(),
    FLAT: PropertyListItemFactory.flat().build(),
    DETACHED: new PropertyListItemFactory().build(),
    DRAFT: PropertyListItemFactory.draft().build(),
    MINIMAL: PropertyListItemFactory.withoutOptionalFields().build(),
  },

  // Common users for testing
  USERS: {
    OWNER: new UserFactory().build(),
    AGENT: UserFactory.agent().build(),
    BUYER: UserFactory.buyer().build(),
    SOLICITOR: UserFactory.solicitor().build(),
  },

  // Common form data
  FORMS: {
    VALID_LOGIN: new LoginFormDataFactory().build(),
    INVALID_LOGIN: LoginFormDataFactory.invalid().build(),
    COMPLETE_PROPERTY: new PropertyFormDataFactory().build(),
    LEASEHOLD_PROPERTY: PropertyFormDataFactory.leasehold().build(),
    MINIMAL_PROPERTY: PropertyFormDataFactory.minimal().build(),
  },

  // Common test scenarios
  SCENARIOS: {
    EMPTY_RESULTS: TestDataUtils.createPaginationResponse([]),
    SINGLE_PAGE: TestDataUtils.createPaginationResponse(
      TestDataUtils.createProperties(5)
    ),
    MULTI_PAGE: TestDataUtils.createPaginationResponse(
      TestDataUtils.createProperties(10),
      1,
      5,
      25
    ),
    MIXED_PROPERTIES: TestDataUtils.createMixedProperties(),
  },
};
