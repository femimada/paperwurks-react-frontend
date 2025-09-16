// src/features/users/components/__tests__/UserRoleSelector.test.tsx
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type MockedFunction,
} from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserRoleSelector } from '../UserRoleSelector';
import { usePermissions } from '@/hooks/auth';
import type { UserRole } from '@/types/global.types';

// Mock the usePermissions hook
vi.mock('@/hooks/auth', () => ({
  usePermissions: vi.fn(),
}));

// Mock the UI components
vi.mock('@/components/ui', () => ({
  Card: ({ children, className, onClick, ...props }: any) => (
    <div className={className} onClick={onClick} {...props}>
      {children}
    </div>
  ),
  Button: ({ children, onClick, testId }: any) => (
    <button onClick={onClick} data-testid={testId}>
      {children}
    </button>
  ),
  Badge: ({ children, variant, size }: any) => (
    <span className={`badge badge--${variant} badge--${size}`}>{children}</span>
  ),
}));

// Mock constants
vi.mock('@/constants/roles', () => ({
  USER_ROLES: {
    owner: {
      label: 'Property Owner',
      description: 'Property owner who creates and manages property packs',
    },
    agent: {
      label: 'Estate Agent',
      description:
        'Estate agent who coordinates between parties and manages client properties',
    },
    solicitor: {
      label: 'Solicitor',
      description:
        'Legal professional who reviews documents and provides risk assessments',
    },
    buyer: {
      label: 'Prospective Buyer',
      description:
        'Potential buyer with limited access to shared property packs',
    },
  },
  ROLE_PERMISSIONS: {
    owner: [
      'property:create',
      'property:read',
      'property:update',
      'property:delete',
      'document:upload',
      'document:read',
      'document:annotate',
    ],
    agent: [
      'property:create',
      'property:read',
      'property:update',
      'document:upload',
      'document:read',
      'document:annotate',
      'pack:share',
      'user:manage',
    ],
    solicitor: [
      'property:read',
      'document:read',
      'document:annotate',
      'pack:review',
    ],
    buyer: ['property:read', 'document:read'],
  },
}));

describe('UserRoleSelector', () => {
  const mockOnRoleSelect = vi.fn();
  const mockCanAccessResource = vi.fn();
  const mockUsePermissions = usePermissions as MockedFunction<
    typeof usePermissions
  >;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCanAccessResource.mockReturnValue(true);
    mockUsePermissions.mockReturnValue({
      canAccessResource: mockCanAccessResource,
    } as any);
  });

  describe('Rendering', () => {
    it('renders all available roles by default', () => {
      render(<UserRoleSelector onRoleSelect={mockOnRoleSelect} />);

      expect(screen.getByText('Property Owner')).toBeInTheDocument();
      expect(screen.getByText('Estate Agent')).toBeInTheDocument();
      expect(screen.getByText('Solicitor')).toBeInTheDocument();
      expect(screen.getByText('Prospective Buyer')).toBeInTheDocument();
    });

    it('renders role descriptions', () => {
      render(<UserRoleSelector onRoleSelect={mockOnRoleSelect} />);

      expect(
        screen.getByText(
          'Property owner who creates and manages property packs'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Estate agent who coordinates between parties and manages client properties'
        )
      ).toBeInTheDocument();
    });

    it('shows permission count for each role', () => {
      render(<UserRoleSelector onRoleSelect={mockOnRoleSelect} />);

      expect(screen.getByText('7 permissions')).toBeInTheDocument(); // owner permissions
      expect(screen.getByText('8 permissions')).toBeInTheDocument(); // agent permissions
      expect(screen.getByText('4 permissions')).toBeInTheDocument(); // solicitor permissions
      expect(screen.getByText('2 permissions')).toBeInTheDocument(); // buyer permissions
    });

    it('renders only allowed roles when allowedRoles prop is provided', () => {
      render(
        <UserRoleSelector
          onRoleSelect={mockOnRoleSelect}
          allowedRoles={['owner', 'agent']}
        />
      );

      expect(screen.getByText('Property Owner')).toBeInTheDocument();
      expect(screen.getByText('Estate Agent')).toBeInTheDocument();
      expect(screen.queryByText('Solicitor')).not.toBeInTheDocument();
      expect(screen.queryByText('Prospective Buyer')).not.toBeInTheDocument();
    });
  });

  describe('Role selection', () => {
    it('calls onRoleSelect when a role is clicked', async () => {
      const user = userEvent.setup();
      render(<UserRoleSelector onRoleSelect={mockOnRoleSelect} />);

      const ownerOption = screen.getByTestId('role-option-owner');
      await user.click(ownerOption);

      expect(mockOnRoleSelect).toHaveBeenCalledWith('owner');
    });

    it('calls onRoleSelect when radio button is clicked', async () => {
      const user = userEvent.setup();
      render(<UserRoleSelector onRoleSelect={mockOnRoleSelect} />);

      const ownerRadio = screen.getByTestId('role-radio-owner');
      await user.click(ownerRadio);

      expect(mockOnRoleSelect).toHaveBeenCalledWith('owner');
    });

    it('shows selected state for the selected role', () => {
      render(
        <UserRoleSelector
          onRoleSelect={mockOnRoleSelect}
          selectedRole="agent"
        />
      );

      const agentRadio = screen.getByTestId('role-radio-agent');
      expect(agentRadio).toBeChecked();
      expect(screen.getByText('Selected')).toBeInTheDocument();
    });

    it('does not call onRoleSelect when disabled', async () => {
      const user = userEvent.setup();
      render(
        <UserRoleSelector onRoleSelect={mockOnRoleSelect} disabled={true} />
      );

      const ownerOption = screen.getByTestId('role-option-owner');
      await user.click(ownerOption);

      expect(mockOnRoleSelect).not.toHaveBeenCalled();
    });
  });

  describe('Permissions display', () => {
    it('shows view permissions button by default', () => {
      render(<UserRoleSelector onRoleSelect={mockOnRoleSelect} />);

      expect(screen.getByTestId('view-permissions-owner')).toBeInTheDocument();
      expect(screen.getByText('View permissions')).toBeInTheDocument();
    });

    it('hides view permissions button when showPermissions is false', () => {
      render(
        <UserRoleSelector
          onRoleSelect={mockOnRoleSelect}
          showPermissions={false}
        />
      );

      expect(
        screen.queryByTestId('view-permissions-owner')
      ).not.toBeInTheDocument();
    });

    it('expands permissions when view permissions is clicked', async () => {
      const user = userEvent.setup();
      render(<UserRoleSelector onRoleSelect={mockOnRoleSelect} />);

      const viewPermissionsButton = screen.getByTestId(
        'view-permissions-owner'
      );
      await user.click(viewPermissionsButton);

      expect(screen.getByTestId('permissions-list-owner')).toBeInTheDocument();
      expect(
        screen.getByText('Permissions included with this role:')
      ).toBeInTheDocument();
      expect(screen.getByText('Property - Create')).toBeInTheDocument();
      expect(screen.getByText('Document - Upload')).toBeInTheDocument();
    });

    it('collapses permissions when hide permissions is clicked', async () => {
      const user = userEvent.setup();
      render(<UserRoleSelector onRoleSelect={mockOnRoleSelect} />);

      const viewPermissionsButton = screen.getByTestId(
        'view-permissions-owner'
      );

      // Expand permissions
      await user.click(viewPermissionsButton);
      expect(screen.getByTestId('permissions-list-owner')).toBeInTheDocument();

      // Collapse permissions
      const hidePermissionsButton = screen.getByText('Hide permissions');
      await user.click(hidePermissionsButton);
      expect(
        screen.queryByTestId('permissions-list-owner')
      ).not.toBeInTheDocument();
    });

    it('prevents event propagation when clicking permissions button', async () => {
      const user = userEvent.setup();
      render(<UserRoleSelector onRoleSelect={mockOnRoleSelect} />);

      const viewPermissionsButton = screen.getByTestId(
        'view-permissions-owner'
      );
      await user.click(viewPermissionsButton);

      // onRoleSelect should not be called when clicking the permissions button
      expect(mockOnRoleSelect).not.toHaveBeenCalled();
    });
  });

  describe('Permission filtering', () => {
    it('filters roles based on canAccessResource permission', () => {
      mockCanAccessResource.mockImplementation((role: UserRole) => {
        return role === 'owner' || role === 'buyer';
      });

      render(<UserRoleSelector onRoleSelect={mockOnRoleSelect} />);

      expect(screen.getByText('Property Owner')).toBeInTheDocument();
      expect(screen.getByText('Prospective Buyer')).toBeInTheDocument();
      expect(screen.queryByText('Estate Agent')).not.toBeInTheDocument();
      expect(screen.queryByText('Solicitor')).not.toBeInTheDocument();
    });

    it('shows no roles available message when no roles can be selected', () => {
      mockCanAccessResource.mockReturnValue(false);

      render(<UserRoleSelector onRoleSelect={mockOnRoleSelect} />);

      expect(screen.getByText('No Roles Available')).toBeInTheDocument();
      expect(
        screen.getByText(
          "You don't have permission to assign any roles, or no roles are available for selection."
        )
      ).toBeInTheDocument();
    });
  });

  describe('Selected role summary', () => {
    it('shows selected role summary when a role is selected and showPermissions is true', () => {
      render(
        <UserRoleSelector
          onRoleSelect={mockOnRoleSelect}
          selectedRole="owner"
          showPermissions={true}
        />
      );

      expect(screen.getByText('Selected Role Summary')).toBeInTheDocument();
      expect(screen.getByText('Property Owner')).toBeInTheDocument();
      expect(screen.getByText('7 permissions')).toBeInTheDocument();
    });

    it('does not show summary when no role is selected', () => {
      render(
        <UserRoleSelector
          onRoleSelect={mockOnRoleSelect}
          showPermissions={true}
        />
      );

      expect(
        screen.queryByText('Selected Role Summary')
      ).not.toBeInTheDocument();
    });

    it('does not show summary when showPermissions is false', () => {
      render(
        <UserRoleSelector
          onRoleSelect={mockOnRoleSelect}
          selectedRole="owner"
          showPermissions={false}
        />
      );

      expect(
        screen.queryByText('Selected Role Summary')
      ).not.toBeInTheDocument();
    });
  });

  describe('Styling and states', () => {
    it('applies selected styling to selected role', () => {
      render(
        <UserRoleSelector
          onRoleSelect={mockOnRoleSelect}
          selectedRole="owner"
        />
      );

      const ownerOption = screen.getByTestId('role-option-owner');
      expect(ownerOption).toHaveClass(
        'ring-2',
        'ring-blue-500',
        'border-blue-200',
        'bg-blue-50'
      );
    });

    it('applies disabled styling when disabled', () => {
      render(
        <UserRoleSelector onRoleSelect={mockOnRoleSelect} disabled={true} />
      );

      const ownerOption = screen.getByTestId('role-option-owner');
      expect(ownerOption).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('applies hover styling for non-disabled, non-selected roles', () => {
      render(<UserRoleSelector onRoleSelect={mockOnRoleSelect} />);

      const ownerOption = screen.getByTestId('role-option-owner');
      expect(ownerOption).toHaveClass(
        'hover:border-blue-300',
        'hover:shadow-md'
      );
    });
  });

  describe('Accessibility', () => {
    it('has proper radio button structure', () => {
      render(<UserRoleSelector onRoleSelect={mockOnRoleSelect} />);

      const ownerRadio = screen.getByTestId('role-radio-owner');
      expect(ownerRadio).toHaveAttribute('type', 'radio');
      expect(ownerRadio).toHaveAttribute('name', 'role');
      expect(ownerRadio).toHaveAttribute('value', 'owner');
    });

    it('disables radio buttons when component is disabled', () => {
      render(
        <UserRoleSelector onRoleSelect={mockOnRoleSelect} disabled={true} />
      );

      const ownerRadio = screen.getByTestId('role-radio-owner');
      expect(ownerRadio).toBeDisabled();
    });

    it('has proper testIds for all elements', () => {
      render(
        <UserRoleSelector
          onRoleSelect={mockOnRoleSelect}
          testId="role-selector"
        />
      );

      expect(screen.getByTestId('role-selector')).toBeInTheDocument();
      expect(screen.getByTestId('role-option-owner')).toBeInTheDocument();
      expect(screen.getByTestId('role-radio-owner')).toBeInTheDocument();
      expect(screen.getByTestId('view-permissions-owner')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles empty allowedRoles array', () => {
      render(
        <UserRoleSelector onRoleSelect={mockOnRoleSelect} allowedRoles={[]} />
      );

      expect(screen.getByText('No Roles Available')).toBeInTheDocument();
    });

    it('handles role with no permissions', () => {
      // Mock a role with no permissions
      vi.doMock('@/constants/roles', () => ({
        USER_ROLES: {
          test: {
            label: 'Test Role',
            description: 'Test role with no permissions',
          },
        },
        ROLE_PERMISSIONS: {
          test: [],
        },
      }));

      render(
        <UserRoleSelector
          onRoleSelect={mockOnRoleSelect}
          allowedRoles={['test' as UserRole]}
        />
      );

      expect(screen.getByText('0 permissions')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <UserRoleSelector
          onRoleSelect={mockOnRoleSelect}
          className="custom-class"
          testId="role-selector"
        />
      );

      const selector = screen.getByTestId('role-selector');
      expect(selector).toHaveClass('custom-class');
    });
  });

  describe('Permission formatting', () => {
    it('formats permission names correctly', async () => {
      const user = userEvent.setup();
      render(<UserRoleSelector onRoleSelect={mockOnRoleSelect} />);

      const viewPermissionsButton = screen.getByTestId(
        'view-permissions-owner'
      );
      await user.click(viewPermissionsButton);

      expect(screen.getByText('Property - Create')).toBeInTheDocument();
      expect(screen.getByText('Property - Read')).toBeInTheDocument();
      expect(screen.getByText('Document - Upload')).toBeInTheDocument();
    });
  });
});
