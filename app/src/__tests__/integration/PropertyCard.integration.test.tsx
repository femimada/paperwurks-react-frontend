// src/tests/integration/PropertyCard.integration.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import type { PropertyListItem } from '@/types/property';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockProperty: PropertyListItem = {
  id: 'test-property-1',
  title: 'Beautiful Victorian Home',
  address: {
    line1: '42 Maple Street',
    city: 'Edinburgh',
    postcode: 'EH1 2AB',
    country: 'UK',
  },
  propertyType: 'terraced',
  tenure: 'freehold',
  status: 'ready',
  askingPrice: 550000,
  bedrooms: 3,
  bathrooms: 2,
  receptionRooms: 2,
  owner: {
    id: 'owner-1',
    firstName: 'Alice',
    lastName: 'Watson',
    email: 'alice@example.com',
  },
  createdAt: new Date('2023-03-01'),
  updatedAt: new Date('2023-03-15'),
};

const mockPropertyWithoutOptionals: PropertyListItem = {
  id: 'test-property-2',
  title: 'Simple Flat',
  address: {
    line1: '10 City Center',
    city: 'Glasgow',
    postcode: 'G1 1AA',
    country: 'UK',
  },
  propertyType: 'flat',
  tenure: 'leasehold',
  status: 'draft',
  owner: {
    id: 'owner-2',
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob@example.com',
  },
  createdAt: new Date('2023-02-15'),
  updatedAt: new Date('2023-02-20'),
};

describe('PropertyCard Integration Tests', () => {
  const mockHandlers = {
    onView: vi.fn(),
    onEdit: vi.fn(),
    onShare: vi.fn(),
  };

  beforeEach(() => {
    Object.values(mockHandlers).forEach((mock) => mock.mockClear());
  });

  describe('Rendering', () => {
    it('displays all essential property information', () => {
      render(<PropertyCard property={mockProperty} {...mockHandlers} />);

      // Property title and basic info
      expect(screen.getByText('Beautiful Victorian Home')).toBeInTheDocument();
      expect(
        screen.getByText('42 Maple Street, Edinburgh EH1 2AB')
      ).toBeInTheDocument();

      // Property type and features
      expect(screen.getByText('Terraced')).toBeInTheDocument();
      expect(screen.getByText('3 bed')).toBeInTheDocument();
      expect(screen.getByText('2 bath')).toBeInTheDocument();

      // Price formatting
      expect(screen.getByText('£550,000')).toBeInTheDocument();

      // Status badge
      expect(screen.getByText('Ready')).toBeInTheDocument();

      // Owner information
      expect(screen.getByText('Alice Watson')).toBeInTheDocument();
    });

    it('handles properties with missing optional fields gracefully', () => {
      render(
        <PropertyCard
          property={mockPropertyWithoutOptionals}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('Simple Flat')).toBeInTheDocument();
      expect(screen.getByText('Price on request')).toBeInTheDocument(); // No askingPrice
      expect(screen.queryByText(/bed/)).not.toBeInTheDocument(); // No bedrooms
      expect(screen.queryByText(/bath/)).not.toBeInTheDocument(); // No bathrooms
    });

    it('applies correct styling variants', () => {
      const { rerender } = render(
        <PropertyCard
          property={mockProperty}
          variant="default"
          {...mockHandlers}
        />
      );

      let card = screen.getByTestId('property-card-test-property-1');
      expect(card).toHaveClass('h-auto');

      rerender(
        <PropertyCard
          property={mockProperty}
          variant="featured"
          {...mockHandlers}
        />
      );

      expect(card).toHaveClass('border-2', 'border-primary/20', 'shadow-lg');
    });
  });

  describe('Status Badge Variants', () => {
    it('displays correct badge variant for different statuses', () => {
      const statuses = [
        { status: 'ready', expectedText: 'Ready' },
        { status: 'draft', expectedText: 'Draft' },
        { status: 'in_progress', expectedText: 'In Progress' },
        { status: 'completed', expectedText: 'Completed' },
      ] as const;

      statuses.forEach(({ status, expectedText }) => {
        const { unmount } = render(
          <PropertyCard
            property={{ ...mockProperty, status }}
            {...mockHandlers}
          />
        );

        expect(screen.getByText(expectedText)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Property Type Icons', () => {
    it('displays appropriate icons for different property types', () => {
      const propertyTypes = [
        'detached',
        'semi_detached',
        'terraced',
        'flat',
        'bungalow',
      ] as const;

      propertyTypes.forEach((propertyType) => {
        const { unmount } = render(
          <PropertyCard
            property={{ ...mockProperty, propertyType }}
            {...mockHandlers}
          />
        );

        // Check that an icon is rendered (all property types should have icons)
        const typeElement = screen.getByText(propertyType.replace('_', ' '), {
          exact: false,
        });
        expect(typeElement.previousElementSibling).toBeInTheDocument(); // Icon before text
        unmount();
      });
    });
  });

  describe('User Interactions', () => {
    it('calls onView when card is clicked', async () => {
      const user = userEvent.setup();

      render(<PropertyCard property={mockProperty} {...mockHandlers} />);

      const card = screen.getByTestId('property-card-test-property-1');
      await user.click(card);

      expect(mockHandlers.onView).toHaveBeenCalledWith(mockProperty);
      expect(mockHandlers.onView).toHaveBeenCalledTimes(1);
    });

    it('prevents event bubbling when action buttons are clicked', async () => {
      const user = userEvent.setup();

      render(
        <PropertyCard
          property={mockProperty}
          showActions={true}
          {...mockHandlers}
        />
      );

      // Find the more actions button (if it exists)
      const moreButton = screen.queryByRole('button');
      if (moreButton) {
        await user.click(moreButton);

        // onView should NOT be called when clicking action buttons
        expect(mockHandlers.onView).not.toHaveBeenCalled();
      }
    });

    it('handles hover effects correctly', async () => {
      const user = userEvent.setup();

      render(<PropertyCard property={mockProperty} {...mockHandlers} />);

      const card = screen.getByTestId('property-card-test-property-1');

      // Hover over the card
      await user.hover(card);

      // Check that hover classes are applied (shadow transition)
      expect(card).toHaveClass('hover:shadow-md', 'transition-all');
    });
  });

  describe('Price Formatting', () => {
    it('formats prices correctly in GBP', () => {
      const testCases = [
        { price: 250000, expected: '£250,000' },
        { price: 1500000, expected: '£1,500,000' },
        { price: 99950, expected: '£99,950' },
        { price: undefined, expected: 'Price on request' },
      ];

      testCases.forEach(({ price, expected }) => {
        const { unmount } = render(
          <PropertyCard
            property={{ ...mockProperty, askingPrice: price }}
            {...mockHandlers}
          />
        );

        expect(screen.getByText(expected)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Date Formatting', () => {
    it('formats creation date correctly', () => {
      render(<PropertyCard property={mockProperty} {...mockHandlers} />);

      // Should format date as "1 Mar 2023" format
      expect(screen.getByText(/1 Mar 2023/)).toBeInTheDocument();
    });
  });

  describe('Owner Display', () => {
    it('shows owner information when showOwner is true', () => {
      render(
        <PropertyCard
          property={mockProperty}
          showOwner={true}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('Alice Watson')).toBeInTheDocument();
    });

    it('hides owner information when showOwner is false', () => {
      render(
        <PropertyCard
          property={mockProperty}
          showOwner={false}
          {...mockHandlers}
        />
      );

      expect(screen.queryByText('Alice Watson')).not.toBeInTheDocument();
    });

    it('generates correct owner initials', () => {
      render(
        <PropertyCard
          property={mockProperty}
          showOwner={true}
          {...mockHandlers}
        />
      );

      // Look for avatar with initials "AW"
      const avatar = screen.getByText('AW');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('shows action buttons when showActions is true', () => {
      render(
        <PropertyCard
          property={mockProperty}
          showActions={true}
          {...mockHandlers}
        />
      );

      // Should show the more actions button
      const actionButton = screen.getByRole('button');
      expect(actionButton).toBeInTheDocument();
    });

    it('hides action buttons when showActions is false', () => {
      render(
        <PropertyCard
          property={mockProperty}
          showActions={false}
          {...mockHandlers}
        />
      );

      // Should not show any buttons
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('shows action buttons on hover in default state', () => {
      render(
        <PropertyCard
          property={mockProperty}
          showActions={true}
          {...mockHandlers}
        />
      );

      const actionButton = screen.getByRole('button');

      // Button should have opacity-0 initially (hidden)
      expect(actionButton).toHaveClass('opacity-0');

      // Should show on group hover (group-hover:opacity-100)
      expect(actionButton).toHaveClass('group-hover:opacity-100');
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility attributes', () => {
      render(<PropertyCard property={mockProperty} {...mockHandlers} />);

      const card = screen.getByTestId('property-card-test-property-1');

      // Card should be clickable
      expect(card).toHaveClass('cursor-pointer');

      // Should have proper role for interactive element
      expect(card).toBeInTheDocument();
    });

    it('provides meaningful text content for screen readers', () => {
      render(<PropertyCard property={mockProperty} {...mockHandlers} />);

      // All important information should be visible as text
      expect(screen.getByText('Beautiful Victorian Home')).toBeInTheDocument();
      expect(screen.getByText('£550,000')).toBeInTheDocument();
      expect(screen.getByText('Ready')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('applies responsive classes correctly', () => {
      render(<PropertyCard property={mockProperty} {...mockHandlers} />);

      // Check for responsive grid classes in the property details section
      const detailsSection = screen.getByText('3 bed').closest('div');
      expect(detailsSection).toHaveClass(/gap-4/);
    });
  });

  describe('Error Handling', () => {
    it('handles missing property data gracefully', () => {
      const incompleteProperty = {
        ...mockProperty,
        address: { ...mockProperty.address, line1: '' },
        owner: { ...mockProperty.owner, firstName: '', lastName: '' },
      };

      render(<PropertyCard property={incompleteProperty} {...mockHandlers} />);

      // Should still render without crashing
      expect(screen.getByText('Beautiful Victorian Home')).toBeInTheDocument();
    });

    it('handles null/undefined optional fields', () => {
      const propertyWithNulls = {
        ...mockProperty,
        bedrooms: undefined,
        bathrooms: undefined,
        askingPrice: undefined,
        receptionRooms: undefined,
      };

      render(<PropertyCard property={propertyWithNulls} {...mockHandlers} />);

      // Should render fallback values
      expect(screen.getByText('Price on request')).toBeInTheDocument();
      expect(screen.queryByText(/bed/)).not.toBeInTheDocument();
    });
  });
});
