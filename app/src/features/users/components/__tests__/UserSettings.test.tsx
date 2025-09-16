// src/features/users/components/__tests__/UserSettings.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserSettings } from '../UserSettings';
import { useAuth } from '@/hooks/auth';
import type { User } from '@/types/auth';

// Mock the useAuth hook
vi.mock('@/hooks/auth', () => ({
  useAuth: vi.fn(),
}));

// Mock react-hook-form
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useForm: vi.fn(() => ({
      register: vi.fn((name) => ({
        name,
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn(),
      })),
      handleSubmit: vi.fn((fn) => (e: any) => {
        e.preventDefault();
        fn({
          firstName: 'John',
          lastName: 'Updated',
          phone: '+44 7700 900999',
          bio: 'Updated bio',
          preferences: {
            theme: 'dark',
            language: 'en',
            notifications: {
              email: true,
              push: false,
              inApp: true,
              documentUploads: true,
              packUpdates: false,
              systemAlerts: true,
            },
          },
        });
      }),
      formState: {
        errors: {},
        isDirty: true,
      },
      reset: vi.fn(),
      watch: vi.fn(),
    })),
  };
});

// Mock the UI components
vi.mock('@/components/ui', () => ({
  Card: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  Button: ({ children, onClick, disabled, loading, testId, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      data-testid={testId}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  ),
  Input: ({ label, error, testId, ...props }: any) => (
    <div>
      {label && <label>{label}</label>}
      <input data-testid={testId} {...props} />
      {error && <span className="error">{error}</span>}
    </div>
  ),
}));

describe('UserSettings', () => {
  const mockUser: User = {
    id: '1',
    email: 'john.owner@test.com',
    firstName: 'John',
    lastName: 'Owner',
    role: 'owner',
    permissions: ['property:create'],
    profile: {
      phone: '+44 7700 900123',
      bio: 'Property owner',
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          inApp: true,
          documentUploads: true,
          packUpdates: true,
          systemAlerts: true,
        },
      },
    },
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUpdateProfile = vi.fn();
  const mockUseAuth = useAuth as vi.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      updateProfile: mockUpdateProfile,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    } as any);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Rendering', () => {
    it('renders all form sections', () => {
      render(<UserSettings />);

      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
      expect(screen.getByText('Display Preferences')).toBeInTheDocument();
    });

    it('renders form fields with correct labels', () => {
      render(<UserSettings />);

      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
      expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    });

    it('renders notification checkboxes', () => {
      render(<UserSettings />);

      expect(screen.getByLabelText('Email Notifications')).toBeInTheDocument();
      expect(screen.getByLabelText('In-App Notifications')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Document Upload Notifications')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Pack Update Notifications')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('System Alerts')).toBeInTheDocument();
    });

    it('renders display preference selects', () => {
      render(<UserSettings />);

      expect(screen.getByLabelText('Theme')).toBeInTheDocument();
      expect(screen.getByLabelText('Language')).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      render(<UserSettings />);

      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /save changes/i })
      ).toBeInTheDocument();
    });
  });

  describe('Form submission', () => {
    it('calls updateProfile on form submission', async () => {
      mockUpdateProfile.mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(<UserSettings />);

      const saveButton = screen.getByTestId('save-button');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Updated',
          phone: '+44 7700 900999',
          bio: 'Updated bio',
          preferences: {
            theme: 'dark',
            language: 'en',
            notifications: {
              email: true,
              push: false,
              inApp: true,
              documentUploads: true,
              packUpdates: false,
              systemAlerts: true,
            },
          },
        });
      });
    });

    it('shows success message after successful save', async () => {
      mockUpdateProfile.mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(<UserSettings />);

      const saveButton = screen.getByTestId('save-button');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
        expect(
          screen.getByText('Settings saved successfully!')
        ).toBeInTheDocument();
      });
    });

    it('shows error message when save fails', async () => {
      mockUpdateProfile.mockRejectedValue(new Error('Update failed'));
      const user = userEvent.setup();

      render(<UserSettings />);

      const saveButton = screen.getByTestId('save-button');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });
    });

    it('calls onSave callback after successful save', async () => {
      mockUpdateProfile.mockResolvedValue(undefined);
      const mockOnSave = vi.fn();
      const user = userEvent.setup();

      render(<UserSettings onSave={mockOnSave} />);

      const saveButton = screen.getByTestId('save-button');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledOnce();
      });
    });

    it('disables save button during submission', async () => {
      mockUpdateProfile.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      const user = userEvent.setup();

      render(<UserSettings />);

      const saveButton = screen.getByTestId('save-button');
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  describe('Form reset and cancel', () => {
    it('calls onCancel callback when cancel button is clicked', async () => {
      const mockOnCancel = vi.fn();
      const user = userEvent.setup();

      render(<UserSettings onCancel={mockOnCancel} />);

      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledOnce();
    });

    it('resets form when cancel is clicked', async () => {
      const mockReset = vi.fn();

      // Mock useForm for this specific test
      const mockUseForm = await vi.importMock('react-hook-form');
      mockUseForm.useForm.mockReturnValue({
        register: vi.fn(),
        handleSubmit: vi.fn(),
        formState: { errors: {}, isDirty: false },
        reset: mockReset,
        watch: vi.fn(),
      });

      const user = userEvent.setup();
      render(<UserSettings />);

      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe('No user state', () => {
    it('renders login message when user is null', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        updateProfile: mockUpdateProfile,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      } as any);

      render(<UserSettings />);

      expect(
        screen.getByText('Please log in to access settings')
      ).toBeInTheDocument();
    });
  });

  describe('Success message auto-dismiss', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('automatically dismisses success message after 3 seconds', async () => {
      mockUpdateProfile.mockResolvedValue(undefined);
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<UserSettings />);

      const saveButton = screen.getByTestId('save-button');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
      });

      // Advance time by 3 seconds
      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByTestId('success-message')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form validation', () => {
    it('disables save button when form is not dirty', async () => {
      // Mock useForm for this specific test
      const mockUseForm = await vi.importMock('react-hook-form');
      mockUseForm.useForm.mockReturnValue({
        register: vi.fn(),
        handleSubmit: vi.fn(),
        formState: { errors: {}, isDirty: false },
        reset: vi.fn(),
        watch: vi.fn(),
      });

      render(<UserSettings />);

      const saveButton = screen.getByTestId('save-button');
      expect(saveButton).toBeDisabled();
    });

    it('enables save button when form is dirty', () => {
      render(<UserSettings />);

      const saveButton = screen.getByTestId('save-button');
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe('Props handling', () => {
    it('applies custom className', () => {
      render(
        <UserSettings className="custom-class" testId="custom-settings" />
      );

      const settings = screen.getByTestId('custom-settings');
      expect(settings).toHaveClass('custom-class');
    });

    it('applies custom testId', () => {
      render(<UserSettings testId="custom-test-id" />);

      expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      render(<UserSettings />);

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
    });

    it('has proper labels for all inputs', () => {
      render(<UserSettings />);

      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
      expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    });

    it('has proper ARIA attributes for alerts', async () => {
      mockUpdateProfile.mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(<UserSettings />);

      const saveButton = screen.getByTestId('save-button');
      await user.click(saveButton);

      await waitFor(() => {
        const successAlert = screen.getByTestId('success-message');
        expect(successAlert).toHaveAttribute('role', 'alert');
        expect(successAlert).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('has proper ARIA attributes for error alerts', async () => {
      mockUpdateProfile.mockRejectedValue(new Error('Update failed'));
      const user = userEvent.setup();

      render(<UserSettings />);

      const saveButton = screen.getByTestId('save-button');
      await user.click(saveButton);

      await waitFor(() => {
        const errorAlert = screen.getByTestId('error-message');
        expect(errorAlert).toHaveAttribute('role', 'alert');
        expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
      });
    });
  });
});
