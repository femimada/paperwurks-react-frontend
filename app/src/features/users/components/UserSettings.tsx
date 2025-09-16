// src/features/users/components/UserSettings.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/auth';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Label,
  Textarea,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { ProfileUpdateFormData } from '@/types/auth';

// Validation schema for user settings
const UserSettingsSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val),
      'Please enter a valid phone number'
    ),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    language: z.enum(['en', 'fr', 'de', 'es']),
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      inApp: z.boolean(),
      documentUploads: z.boolean(),
      packUpdates: z.boolean(),
      systemAlerts: z.boolean(),
    }),
    timezone: z.string().optional(),
  }),
});

type UserSettingsFormData = z.infer<typeof UserSettingsSchema>;

interface UserSettingsProps {
  className?: string;
  testId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

/**
 * Allows users to update their profile information and preferences
 */
export const UserSettings: React.FC<UserSettingsProps> = ({
  className = '',
  testId = 'user-settings',
  onSave,
  onCancel,
}) => {
  const { user, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const form = useForm<UserSettingsFormData>({
    resolver: zodResolver(UserSettingsSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.profile?.phone || '',
      bio: user?.profile?.bio || '',
      preferences: {
        theme: ['light', 'dark'].includes(
          user?.profile?.preferences?.theme ?? ''
        )
          ? (user?.profile?.preferences?.theme as 'light' | 'dark')
          : 'light',
        language: ['en', 'fr', 'de', 'es'].includes(
          user?.profile?.preferences?.language ?? ''
        )
          ? (user?.profile?.preferences?.language as 'en' | 'fr' | 'de' | 'es')
          : 'en',
        notifications: {
          email: user?.profile?.preferences?.notifications?.email ?? true,
          push: user?.profile?.preferences?.notifications?.push ?? true,
          inApp: user?.profile?.preferences?.notifications?.inApp ?? true,
          documentUploads:
            user?.profile?.preferences?.notifications?.documentUploads ?? true,
          packUpdates:
            user?.profile?.preferences?.notifications?.packUpdates ?? true,
          systemAlerts:
            user?.profile?.preferences?.notifications?.systemAlerts ?? true,
        },
        timezone: user?.profile?.preferences?.timezone || '',
      },
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = form;

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.profile?.phone || '',
        bio: user.profile?.bio || '',
        preferences: {
          theme: ['light', 'dark'].includes(
            user?.profile?.preferences?.theme ?? ''
          )
            ? (user?.profile?.preferences?.theme as 'light' | 'dark')
            : 'light',
          language: ['en', 'fr', 'de', 'es'].includes(
            user?.profile?.preferences?.language ?? ''
          )
            ? (user?.profile?.preferences?.language as
                | 'en'
                | 'fr'
                | 'de'
                | 'es')
            : 'en',
          notifications: {
            email: user.profile?.preferences?.notifications?.email ?? true,
            push: user.profile?.preferences?.notifications?.push ?? true,
            inApp: user.profile?.preferences?.notifications?.inApp ?? true,
            documentUploads:
              user.profile?.preferences?.notifications?.documentUploads ?? true,
            packUpdates:
              user.profile?.preferences?.notifications?.packUpdates ?? true,
            systemAlerts:
              user.profile?.preferences?.notifications?.systemAlerts ?? true,
          },
          timezone: user.profile?.preferences?.timezone || '',
        },
      });
    }
  }, [user, reset]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const onSubmit = async (data: UserSettingsFormData) => {
    setIsSubmitting(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateProfile(data as ProfileUpdateFormData);
      setSaveSuccess(true);
      onSave?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save settings';
      setSaveError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    setSaveError(null);
    setSaveSuccess(false);
    onCancel?.();
  };

  if (!user) {
    return (
      <Card className={className} data-testid={testId}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Please log in to access settings</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className} data-testid={testId}>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Success Message */}
          {saveSuccess && (
            <Alert
              className="border-green-200 bg-green-50"
              data-testid="success-message"
            >
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Settings saved successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {saveError && (
            <Alert variant="destructive" data-testid="error-message">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}

          {/* Personal Information Section */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your basic profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your first name"
                          {...field}
                          data-testid="firstName-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your last name"
                          {...field}
                          data-testid="lastName-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your phone number"
                        {...field}
                        data-testid="phone-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a bit about yourself..."
                        rows={4}
                        {...field}
                        data-testid="bio-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Notification Preferences Section */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="preferences.notifications.email"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="email-notifications-checkbox"
                      />
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferences.notifications.push"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">
                          Push Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via push
                        </p>
                      </div>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="push-notifications-checkbox"
                      />
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferences.notifications.inApp"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">
                          In-App Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Show notifications in the application
                        </p>
                      </div>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="in-app-notifications-checkbox"
                      />
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferences.notifications.documentUploads"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">
                          Document Upload Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when documents are uploaded
                        </p>
                      </div>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="document-notifications-checkbox"
                      />
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferences.notifications.packUpdates"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">
                          Pack Update Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about property pack changes
                        </p>
                      </div>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="pack-notifications-checkbox"
                      />
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferences.notifications.systemAlerts"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">
                          System Alerts
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Important system announcements and updates
                        </p>
                      </div>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="system-notifications-checkbox"
                      />
                    </div>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Display Preferences Section */}
          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
              <CardDescription>Customize your app experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="preferences.theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="theme-select">
                            <SelectValue placeholder="Select a theme" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferences.language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="language-select">
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isDirty || isSubmitting}
              data-testid="save-button"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
