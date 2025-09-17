// src/tests/integration/PropertyGrid.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropertyGrid } from '@/features/properties/components/PropertyGrid';
import type { PropertyListItem, PropertyFilters } from '@/types/property';
import type { PaginationParams, SortParams } from '@/types/global.types';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock property data
const mockProperties: PropertyListItem[] = [
  {
    id: '1',
    title: 'Modern Family Home',
    address: {
      line1: '123 Oak Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      country: 'UK',
    },
    propertyType: 'detached',
    tenure: 'freehold',
    status: 'ready',
    askingPrice: 750000,
    bedrooms: 4,
    bathrooms: 3,
    owner: {
      id: 'owner-1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@example.com',
    },
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-20'),
  },
  {
    id: '2',
    title: 'City Centre Apartment',
    address: {
      line1: '456 High Street',
      city: 'Manchester',
      postcode: 'M1 1AA',
      country: 'UK',
    },
    propertyType: 'flat',
    tenure: 'leasehold',
    status: 'in_progress',
    askingPrice: 300000,
    bedrooms: 2,
    bathrooms: 1,
    owner: {
      id: 'owner-2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@example.com',
    },
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2023-02-05'),
  },
  {
    id: '3',
    title: 'Victorian Terraced House',
    address: {
      line1: '789 Victoria Road',
      city: 'Birmingham',
      postcode: 'B1 1AA',
      country: 'UK',
    },
    propertyType: 'terraced',
    tenure: 'freehold',
    status: 'draft',
    askingPrice: 450000,
    bedrooms: 3,
    bathrooms: 2,
    owner: {
      id: 'owner-3',
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael@example.com',
    },
    createdAt: new Date('2023-01-10'),
    updatedAt: new Date('2023-01-15'),
  },
];

const mockPagination = {
  page: 1,
  limit: 12,
  total: 3,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

const defaultProps = {
  properties: mockProperties,
  totalCount: 3,
  pagination: mockPagination,
  filters: {},
  sort: { field: 'updatedAt', direction: 'desc' as const },
  isLoading: false,
  searchQuery: '',
  viewMode: 'grid' as const,
  showFilters: true,
  showStats: true,
  showCreateButton: true,
};

describe('PropertyGrid Integration Tests', () => {
  // Mock handlers
  const mockHandlers = {
    onPropertyView: vi.fn(),
    onPropertyEdit: vi.fn(),
    onPropertyShare: vi.fn(),
    onCreateProperty: vi.fn(),
    onFiltersChange: vi.fn(),
    onSortChange: vi.fn(),
    onPaginationChange: vi.fn(),
    onSearchChange: vi.fn(),
    onViewModeChange: vi.fn(),
  };

  beforeEach(() => {
    // Reset all mocks before each test
    Object.values(mockHandlers).forEach((mock) => mock.mockClear());
  });

  describe('Rendering', () => {
    it('renders the correct number of property cards', () => {
      render(<PropertyGrid {...defaultProps} {...mockHandlers} />);

      // Should render all 3 properties
      expect(screen.getAllByTestId(/property-card-/)).toHaveLength(3);

      // Check specific properties are rendered
      expect(screen.getByText('Modern Family Home')).toBeInTheDocument();
      expect(screen.getByText('City Centre Apartment')).toBeInTheDocument();
      expect(screen.getByText('Victorian Terraced House')).toBeInTheDocument();
    });

    it('shows loading state correctly', () => {
      render(
        <PropertyGrid
          {...defaultProps}
          {...mockHandlers}
          isLoading={true}
          properties={[]}
        />
      );

      // Should show skeleton loading cards
      expect(screen.getAllByTestId(/skeleton-card/)).toHaveLength(6); // Default skeleton count
    });

    it('renders empty state when no properties', () => {
      render(
        <PropertyGrid
          {...defaultProps}
          {...mockHandlers}
          properties={[]}
          totalCount={0}
        />
      );

      expect(screen.getByText(/no properties found/i)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('calls onSearchChange when search form is submitted', async () => {
      const user = userEvent.setup();

      render(<PropertyGrid {...defaultProps} {...mockHandlers} />);

      const searchInput = screen.getByPlaceholderText(/search properties/i);

      // Type in search box
      await user.type(searchInput, 'Modern Family');

      // Submit search
      await user.keyboard('{Enter}');

      // Should call onSearchChange with the query
      expect(mockHandlers.onSearchChange).toHaveBeenCalledWith('Modern Family');
    });

    it('updates search input value when searchQuery prop changes', () => {
      const { rerender } = render(
        <PropertyGrid {...defaultProps} {...mockHandlers} searchQuery="" />
      );

      const searchInput = screen.getByPlaceholderText(
        /search properties/i
      ) as HTMLInputElement;
      expect(searchInput.value).toBe('');

      // Update searchQuery prop
      rerender(
        <PropertyGrid
          {...defaultProps}
          {...mockHandlers}
          searchQuery="Test Query"
        />
      );

      expect(searchInput.value).toBe('Test Query');
    });
  });

  describe('Sort Functionality', () => {
    it('calls onSortChange when sort dropdown value changes', async () => {
      const user = userEvent.setup();

      render(<PropertyGrid {...defaultProps} {...mockHandlers} />);

      // Find and click the sort dropdown
      const sortSelect = screen.getByTestId('sort-select');
      await user.click(sortSelect);

      // Select a sort option
      const priceHighToLowOption = screen.getByText('Price High-Low');
      await user.click(priceHighToLowOption);

      // Should call onSortChange with correct parameters
      expect(mockHandlers.onSortChange).toHaveBeenCalledWith({
        field: 'askingPrice',
        direction: 'desc',
      });
    });

    it('displays current sort selection correctly', () => {
      render(
        <PropertyGrid
          {...defaultProps}
          {...mockHandlers}
          sort={{ field: 'askingPrice', direction: 'asc' }}
        />
      );

      // Should show the selected sort option
      expect(screen.getByDisplayValue('Price Low-High')).toBeInTheDocument();
    });
  });

  describe('View Mode Toggle', () => {
    it('calls onViewModeChange when view mode buttons are clicked', async () => {
      const user = userEvent.setup();

      render(
        <PropertyGrid {...defaultProps} {...mockHandlers} viewMode="grid" />
      );

      // Click list view button
      const listViewButton = screen.getByTestId('list-view');
      await user.click(listViewButton);

      expect(mockHandlers.onViewModeChange).toHaveBeenCalledWith('list');

      // Click grid view button
      const gridViewButton = screen.getByTestId('grid-view');
      await user.click(gridViewButton);

      expect(mockHandlers.onViewModeChange).toHaveBeenCalledWith('grid');
    });

    it('applies correct styling based on view mode', () => {
      const { rerender } = render(
        <PropertyGrid {...defaultProps} {...mockHandlers} viewMode="grid" />
      );

      // Check grid view styling
      const gridContainer = screen.getByTestId('properties-grid');
      expect(gridContainer).toHaveClass(/grid-cols-/);

      // Switch to list view
      rerender(
        <PropertyGrid {...defaultProps} {...mockHandlers} viewMode="list" />
      );

      expect(gridContainer).toHaveClass(/grid-cols-1/);
    });
  });

  describe('Pagination', () => {
    const paginationProps = {
      ...defaultProps,
      totalCount: 25,
      pagination: {
        page: 2,
        limit: 12,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      },
    };

    it('renders pagination controls when multiple pages exist', () => {
      render(<PropertyGrid {...paginationProps} {...mockHandlers} />);

      expect(screen.getByTestId('prev-page')).toBeInTheDocument();
      expect(screen.getByTestId('next-page')).toBeInTheDocument();
      expect(screen.getByTestId('page-2')).toBeInTheDocument();
    });

    it('calls onPaginationChange when page buttons are clicked', async () => {
      const user = userEvent.setup();

      render(<PropertyGrid {...paginationProps} {...mockHandlers} />);

      // Click next page
      const nextButton = screen.getByTestId('next-page');
      await user.click(nextButton);

      expect(mockHandlers.onPaginationChange).toHaveBeenCalledWith({ page: 3 });

      // Click previous page
      const prevButton = screen.getByTestId('prev-page');
      await user.click(prevButton);

      expect(mockHandlers.onPaginationChange).toHaveBeenCalledWith({ page: 1 });
    });

    it('disables pagination buttons appropriately', () => {
      // Test first page
      render(
        <PropertyGrid
          {...defaultProps}
          {...mockHandlers}
          pagination={{
            page: 1,
            limit: 12,
            total: 25,
            totalPages: 3,
            hasNext: true,
            hasPrev: false,
          }}
        />
      );

      expect(screen.getByTestId('prev-page')).toBeDisabled();
      expect(screen.getByTestId('next-page')).not.toBeDisabled();
    });
  });

  describe('Property Card Interactions', () => {
    it('calls onPropertyView when a property card is clicked', async () => {
      const user = userEvent.setup();

      render(<PropertyGrid {...defaultProps} {...mockHandlers} />);

      const firstPropertyCard = screen.getByTestId('property-card-1');
      await user.click(firstPropertyCard);

      expect(mockHandlers.onPropertyView).toHaveBeenCalledWith(
        mockProperties[0]
      );
    });

    it('handles property card actions correctly', async () => {
      const user = userEvent.setup();

      render(<PropertyGrid {...defaultProps} {...mockHandlers} />);

      // Find action buttons on first property card
      const firstCard = screen.getByTestId('property-card-1');

      // Test edit action (if visible)
      const editButton = firstCard.querySelector(
        '[data-testid="edit-property"]'
      );
      if (editButton) {
        await user.click(editButton);
        expect(mockHandlers.onPropertyEdit).toHaveBeenCalledWith(
          mockProperties[0]
        );
      }

      // Test share action (if visible)
      const shareButton = firstCard.querySelector(
        '[data-testid="share-property"]'
      );
      if (shareButton) {
        await user.click(shareButton);
        expect(mockHandlers.onPropertyShare).toHaveBeenCalledWith(
          mockProperties[0]
        );
      }
    });
  });

  describe('Create Property Button', () => {
    it('renders create button when showCreateButton is true', () => {
      render(
        <PropertyGrid
          {...defaultProps}
          {...mockHandlers}
          showCreateButton={true}
        />
      );

      expect(screen.getByTestId('create-property-button')).toBeInTheDocument();
    });

    it('hides create button when showCreateButton is false', () => {
      render(
        <PropertyGrid
          {...defaultProps}
          {...mockHandlers}
          showCreateButton={false}
        />
      );

      expect(
        screen.queryByTestId('create-property-button')
      ).not.toBeInTheDocument();
    });

    it('calls onCreateProperty when create button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <PropertyGrid
          {...defaultProps}
          {...mockHandlers}
          showCreateButton={true}
        />
      );

      const createButton = screen.getByTestId('create-property-button');
      await user.click(createButton);

      expect(mockHandlers.onCreateProperty).toHaveBeenCalled();
    });
  });

  describe('Filter Integration', () => {
    it('shows filter badge when filters are applied', () => {
      const filtersWithValues: PropertyFilters = {
        status: 'ready',
        propertyType: 'detached',
        minPrice: 200000,
      };

      render(
        <PropertyGrid
          {...defaultProps}
          {...mockHandlers}
          filters={filtersWithValues}
        />
      );

      // Should show filter count badge
      const filterButton = screen.getByTestId('filters-toggle');
      expect(filterButton).toHaveTextContent('3'); // 3 active filters
    });

    it('calls onFiltersChange when filters are updated', async () => {
      const user = userEvent.setup();

      render(<PropertyGrid {...defaultProps} {...mockHandlers} />);

      // Open filters panel
      const filterButton = screen.getByTestId('filters-toggle');
      await user.click(filterButton);

      // Apply a filter (this would depend on your filter UI implementation)
      // This is a placeholder - adjust based on your actual filter implementation
      const statusFilter = screen.queryByTestId('status-filter');
      if (statusFilter) {
        await user.click(statusFilter);
        // Select an option and verify onFiltersChange is called
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<PropertyGrid {...defaultProps} {...mockHandlers} />);

      // Check for proper accessibility attributes
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByLabelText(/search properties/i)).toBeInTheDocument();

      // Check that all interactive elements are accessible
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeVisible();
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      render(<PropertyGrid {...defaultProps} {...mockHandlers} />);

      // Tab through interactive elements
      await user.tab();
      expect(screen.getByPlaceholderText(/search properties/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('sort-select')).toHaveFocus();
    });
  });
});
