// src/features/users/components/UserProfile.tsx (Migrated to shadcn/ui)
import React, { useState } from 'react';
import { useAuth } from '@/hooks/auth';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
} from '@/components/ui';
import { USER_ROLES } from '@/constants/roles';
import { ExternalLink, Edit } from 'lucide-react';
import type { User } from '@/types/auth';

interface UserProfileProps {
  user?: User;
  isEditable?: boolean;
  onEdit?: () => void;
  className?: string;
  testId?: string;
}

/**
 * User profile display component (Migrated to shadcn/ui)
 * Shows user information, role, organization, and basic stats
 */
export const UserProfile: React.FC<UserProfileProps> = ({
  user: propUser,
  isEditable = false,
  onEdit,
  className = '',
  testId = 'user-profile',
}) => {
  const { user: currentUser } = useAuth();
  const user = propUser || currentUser;
  const [imageError, setImageError] = useState(false);

  if (!user) {
    return (
      <Card className={className} data-testid={testId}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>No user information available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const roleInfo = USER_ROLES[user.role];
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

  const handleImageError = () => {
    setImageError(true);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <Card className={`overflow-hidden ${className}`} data-testid={testId}>
      {/* Header with gradient background */}
      <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary-foreground/20">
              <AvatarImage
                src={!imageError ? user.profile?.avatar : undefined}
                alt={fullName}
                onError={handleImageError}
              />
              <AvatarFallback className="text-lg font-semibold bg-primary-foreground/10">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold mb-1">{fullName}</h2>
              <p className="text-primary-foreground/80 mb-2">{user.email}</p>
              <Badge
                variant="secondary"
                className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
              >
                {roleInfo.label}
              </Badge>
            </div>
          </div>
          {isEditable && onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              data-testid="edit-profile-button"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Personal Information
            </h3>
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Full Name
                </dt>
                <dd className="text-sm text-foreground">{fullName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Email
                </dt>
                <dd className="text-sm text-foreground flex items-center gap-2">
                  {user.email}
                  {user.isEmailVerified ? (
                    <Badge
                      variant="default"
                      className="text-xs bg-green-100 text-green-800 hover:bg-green-100"
                    >
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                    >
                      Unverified
                    </Badge>
                  )}
                </dd>
              </div>
              {user.profile?.phone && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Phone
                  </dt>
                  <dd className="text-sm text-foreground">
                    {user.profile.phone}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Role
                </dt>
                <dd className="text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{roleInfo.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {roleInfo.description}
                  </p>
                </dd>
              </div>
            </div>
          </div>

          {/* Organization Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              {user.organization ? 'Organization' : 'Account Information'}
            </h3>
            <div className="space-y-3">
              {user.organization ? (
                <>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Organization
                    </dt>
                    <dd className="text-sm text-foreground">
                      {user.organization.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Type
                    </dt>
                    <dd className="text-sm text-foreground capitalize">
                      {user.organization.type?.replace('_', ' ')}
                    </dd>
                  </div>
                  {user.organization.address && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Address
                      </dt>
                      <dd className="text-sm text-foreground">
                        {user.organization.address}
                      </dd>
                    </div>
                  )}
                  {user.organization.website && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Website
                      </dt>
                      <dd className="text-sm text-foreground">
                        <a
                          href={user.organization.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                        >
                          {user.organization.website}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </dd>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Account Type
                    </dt>
                    <dd className="text-sm text-foreground">Individual</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Member Since
                    </dt>
                    <dd className="text-sm text-foreground">
                      {formatDate(user.createdAt)}
                    </dd>
                  </div>
                </>
              )}
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Last Login
                </dt>
                <dd className="text-sm text-foreground">
                  {formatDate(user.lastLoginAt)}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {user.profile?.bio && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              About
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {user.profile.bio}
            </p>
          </div>
        )}

        {/* Permissions Summary */}
        {user.permissions && user.permissions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Permissions
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.permissions.map((permission) => (
                <Badge
                  key={permission}
                  variant="outline"
                  className="text-xs font-mono"
                >
                  {permission}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
