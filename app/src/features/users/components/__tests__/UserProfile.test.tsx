// src/features/users/components/__tests__/UserProfile.test.tsx
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type MockedFunction,
} from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from '../UserProfile';
import { useAuth } from '@/hooks/auth';
import type { User } from '@/types/auth';

// Mock the useAuth hook
vi.mock('@/hooks/auth', () => ({
  useAuth: vi.fn(),
}));

// Mock the UI components
vi.mock('@/components/ui', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
  Avatar: ({ src, fallback, className, onError, ...props }: any) => (
    <div
      className={className}
      data-testid="avatar"
      onError={onError}
      {...props}
    >
      {src ? <img src={src} alt="" onError={onError} /> : fallback}
    </div>
  ),
  Badge: ({ children, variant, className }: any) => (
    <span className={`badge badge--${variant} ${className}`}>{children}</span>
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
      description: 'Estate agent who coordinates between parties',
    },
    solicitor: {
      label: 'Solicitor',
      description: 'Legal professional who reviews documents',
    },
    buyer: {
      label: 'Prospective Buyer',
      description: 'Potential buyer with limited access',
    },
  },
}));

describe('UserProfile', () => {
  const mockUser: User = {
    id: '1',
    email: 'john.owner@test.com',
    firstName: 'John',
    lastName: 'Owner',
    role: 'owner',
    permissions: ['property:create', 'property:read', 'document:upload'],
    profile: {
      phone: '+44 7700 900123',
      bio: 'Property owner looking to streamline due diligence',
      avatar: 'https://example.com/avatar.jpg',
    },
    organization: {
      id: '1',
      name: 'Test Organization',
      type: 'property_company',
      address: '123 Test Street, London',
      website: 'https://test.com',
    },
    isEmailVerified: true,
    lastLoginAt: new Date('2024-01-15T10:00:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };

  const mockUseAuth = useAuth as MockedFunction<typeof useAuth>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    } as any);
  });

  describe('Rendering', () => {
    it('renders user profile information correctly', () => {
      render(<UserProfile />);

      expect(screen.getByText('John Owner')).toBeInTheDocument();
      expect(screen.getByText('john.owner@test.com')).toBeInTheDocument();
      expect(screen.getByText('Property Owner')).toBeInTheDocument();
      expect(screen.getByText('+44 7700 900123')).toBeInTheDocument();
      expect(
        screen.getByText('Property owner looking to streamline due diligence')
      ).toBeInTheDocument();
    });

    it('renders organization information when available', () => {
      render(<UserProfile />);

      expect(screen.getByText('Test Organization')).toBeInTheDocument();
      expect(screen.getByText('Property company')).toBeInTheDocument();
      expect(screen.getByText('123 Test Street, London')).toBeInTheDocument();
      expect(screen.getByText('https://test.com')).toBeInTheDocument();
    });

    it('renders permissions list', () => {
      render(<UserProfile />);

      expect(screen.getByText('Permissions')).toBeInTheDocument();
      expect(screen.getByText('property:create')).toBeInTheDocument();
      expect(screen.getByText('property:read')).toBeInTheDocument();
      expect(screen.getByText('document:upload')).toBeInTheDocument();
    });

    it('renders email verification status', () => {
      render(<UserProfile />);

      expect(screen.getByText('Verified')).toBeInTheDocument();
    });

    it('renders unverified status for unverified email', () => {
      const unverifiedUser = { ...mockUser, isEmailVerified: false };
      mockUseAuth.mockReturnValue({
        user: unverifiedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      } as any);

      render(<UserProfile />);

      expect(screen.getByText('Unverified')).toBeInTheDocument();
    });
  });

  describe('User without organization', () => {
    it('renders individual account information when no organization', () => {
      const userWithoutOrg = { ...mockUser, organization: undefined };
      mockUseAuth.mockReturnValue({
        user: userWithoutOrg,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      } as any);

      render(<UserProfile />);

      expect(screen.getByText('Account Information')).toBeInTheDocument();
      expect(screen.getByText('Individual')).toBeInTheDocument();
      expect(screen.getByText('Member Since')).toBeInTheDocument();
    });
  });

  describe('Props handling', () => {
    it('uses provided user prop instead of auth context', () => {
      const propUser: User = {
        ...mockUser,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@test.com',
      };

      render(<UserProfile user={propUser} />);

      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('jane.doe@test.com')).toBeInTheDocument();
    });

    it('renders edit button when editable is true', () => {
      const mockOnEdit = vi.fn();

      render(<UserProfile isEditable={true} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      expect(editButton).toBeInTheDocument();

      fireEvent.click(editButton);
      expect(mockOnEdit).toHaveBeenCalledOnce();
    });

    it('does not render edit button when editable is false', () => {
      render(<UserProfile isEditable={false} />);

      expect(
        screen.queryByRole('button', { name: /edit profile/i })
      ).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<UserProfile className="custom-class" testId="custom-profile" />);

      const profile = screen.getByTestId('custom-profile');
      expect(profile).toHaveClass('custom-class');
    });
  });

  describe('Avatar handling', () => {
    it('renders avatar with image when available', () => {
      render(<UserProfile />);

      const avatar = screen.getByTestId('avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar.querySelector('img')).toHaveAttribute(
        'src',
        'https://example.com/avatar.jpg'
      );
    });

    it('renders fallback initials when no avatar', () => {
      const userWithoutAvatar = {
        ...mockUser,
        profile: { ...mockUser.profile, avatar: undefined },
      };
      mockUseAuth.mockReturnValue({
        user: userWithoutAvatar,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      } as any);

      render(<UserProfile />);

      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveTextContent('JO');
    });

    it('handles image error and shows fallback', () => {
      render(<UserProfile />);

      const avatar = screen.getByTestId('avatar');
      const img = avatar.querySelector('img');

      if (img) {
        fireEvent.error(img);
      }

      // After error, should show fallback initials
      expect(avatar).toHaveTextContent('JO');
    });
  });

  describe('No user state', () => {
    it('renders no user message when user is null', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      } as any);

      render(<UserProfile />);

      expect(
        screen.getByText('No user information available')
      ).toBeInTheDocument();
    });
  });

  describe('Date formatting', () => {
    it('formats dates correctly', () => {
      render(<UserProfile />);

      // Check if the formatted date appears (the exact format depends on locale)
      expect(screen.getByText(/15 Jan 2024/)).toBeInTheDocument();
    });

    it('handles missing dates', () => {
      const userWithoutLastLogin = { ...mockUser, lastLoginAt: undefined };
      mockUseAuth.mockReturnValue({
        user: userWithoutLastLogin,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      } as any);

      render(<UserProfile />);

      expect(screen.getByText('Never')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper test ids', () => {
      render(<UserProfile testId="user-profile-test" />);

      expect(screen.getByTestId('user-profile-test')).toBeInTheDocument();
    });

    it('has accessible button for editing', () => {
      const mockOnEdit = vi.fn();

      render(<UserProfile isEditable={true} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      expect(editButton).toBeInTheDocument();
      expect(editButton).toHaveAttribute('data-testid', 'edit-profile-button');
    });

    it('has proper semantic structure', () => {
      render(<UserProfile />);

      // Check for headings
      expect(
        screen.getByRole('heading', { level: 2, name: 'John Owner' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 3, name: 'Personal Information' })
      ).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles user with minimal data', () => {
      const minimalUser: User = {
        id: '1',
        email: 'minimal@test.com',
        firstName: 'Min',
        lastName: 'User',
        role: 'buyer',
        permissions: [],
        profile: {},
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUseAuth.mockReturnValue({
        user: minimalUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      } as any);

      render(<UserProfile />);

      expect(screen.getByText('Min User')).toBeInTheDocument();
      expect(screen.getByText('minimal@test.com')).toBeInTheDocument();
      expect(screen.getByText('Prospective Buyer')).toBeInTheDocument();
    });

    it('handles empty permissions array', () => {
      const userWithoutPermissions = { ...mockUser, permissions: [] };
      mockUseAuth.mockReturnValue({
        user: userWithoutPermissions,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      } as any);

      render(<UserProfile />);

      // Permissions section should not be rendered
      expect(screen.queryByText('Permissions')).not.toBeInTheDocument();
    });
  });
});
