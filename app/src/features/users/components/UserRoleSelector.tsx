// src/features/users/components/UserRoleSelector.tsx (Migrated to shadcn/ui)
import React, { useState } from 'react';
import { Card, CardContent, Button, Badge, Label } from '@/components/ui';
import { USER_ROLES, ROLE_PERMISSIONS } from '@/constants/roles';
import { usePermissions } from '@/hooks/auth';
import { ChevronDown, ChevronUp, Check, Users } from 'lucide-react';
import type { UserRole } from '@/types/global.types';

interface UserRoleSelectorProps {
  selectedRole?: UserRole;
  onRoleSelect: (role: UserRole) => void;
  disabled?: boolean;
  showPermissions?: boolean;
  allowedRoles?: UserRole[];
  className?: string;
  testId?: string;
}

/**
 * User role selector component (Migrated to shadcn/ui)
 * Allows selection of user roles with permission preview
 */
export const UserRoleSelector: React.FC<UserRoleSelectorProps> = ({
  selectedRole,
  onRoleSelect,
  disabled = false,
  showPermissions = true,
  allowedRoles,
  className = '',
  testId = 'user-role-selector',
}) => {
  const { canAccessResource } = usePermissions();
  const [expandedRole, setExpandedRole] = useState<UserRole | null>(null);

  // Determine which roles can be selected
  const availableRoles =
    allowedRoles || (Object.keys(USER_ROLES) as UserRole[]);

  // Filter roles based on current user's permissions
  const selectableRoles = availableRoles.filter((role) => {
    // Users can always select their own role or lower
    return canAccessResource(role, ['user:manage']);
  });

  const handleRoleSelect = (role: UserRole) => {
    if (disabled) return;
    onRoleSelect(role);
  };

  const toggleRoleExpansion = (role: UserRole) => {
    setExpandedRole(expandedRole === role ? null : role);
  };

  const formatPermissionName = (permission: string) => {
    return permission
      .split(':')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' - ');
  };

  return (
    <div className={`space-y-4 ${className}`} data-testid={testId}>
      <div className="grid gap-4">
        {selectableRoles.map((role) => {
          const roleInfo = USER_ROLES[role];
          const permissions = ROLE_PERMISSIONS[role] || [];
          const isSelected = selectedRole === role;
          const isExpanded = expandedRole === role;

          return (
            <Card
              key={role}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'ring-2 ring-primary border-primary/50 bg-primary/5'
                  : disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-primary/30 hover:shadow-md'
              }`}
              onClick={() => handleRoleSelect(role)}
              data-testid={`role-option-${role}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Radio Button */}
                    <div className="mt-1">
                      <div
                        className={`
                        w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${
                          isSelected
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground bg-background'
                        }
                        ${disabled ? 'opacity-50' : ''}
                      `}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={isSelected}
                        onChange={() => handleRoleSelect(role)}
                        disabled={disabled}
                        className="sr-only"
                        data-testid={`role-radio-${role}`}
                      />
                    </div>

                    {/* Role Information */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-lg font-semibold cursor-pointer">
                          {roleInfo.label}
                        </Label>
                        {isSelected && (
                          <Badge variant="default" className="text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Selected
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {roleInfo.description}
                      </p>

                      {/* Permission Count */}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {permissions.length} permission
                          {permissions.length !== 1 ? 's' : ''}
                        </span>
                        {showPermissions && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRoleExpansion(role);
                            }}
                            className="h-auto p-0 text-primary hover:text-primary/80 font-medium"
                            data-testid={`view-permissions-${role}`}
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-4 h-4 mr-1" />
                                Hide permissions
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 mr-1" />
                                View permissions
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="mt-1">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded Permissions */}
                {isExpanded && showPermissions && (
                  <div
                    className="mt-4 pt-4 border-t border-border"
                    data-testid={`permissions-list-${role}`}
                  >
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      Permissions included with this role:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {permissions.map((permission) => (
                        <div
                          key={permission}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-foreground">
                            {formatPermissionName(permission)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {permissions.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">
                        No specific permissions assigned to this role.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectableRoles.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Roles Available
              </h3>
              <p className="text-sm text-muted-foreground">
                You don't have permission to assign any roles, or no roles are
                available for selection.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Comparison */}
      {selectedRole && showPermissions && (
        <Card className="bg-muted/50 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-foreground mb-1">
                  Selected Role Summary
                </h3>
                <h4 className="font-medium text-foreground">
                  {USER_ROLES[selectedRole].label}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {USER_ROLES[selectedRole].description}
                </p>
              </div>
              <Badge variant="outline" className="mt-1">
                {ROLE_PERMISSIONS[selectedRole]?.length || 0} permissions
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
