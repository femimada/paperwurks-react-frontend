// src/domains/properties/components/PropertySummary/PropertySummary.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@/shared/components/ui';
import { MapPin, Home, FileText, Calendar, User } from 'lucide-react';
import type { Property } from '@/domains/properties/types';
import { PROPERTY_STATUSES } from '@/shared/constants/status';

interface PropertySummaryProps {
  property: Property;
  className?: string;
  testId?: string;
}

/**
 * PropertySummary component - Clean, minimal property information display
 * Focuses on essential conveyancing details rather than marketing features
 */
export const PropertySummary: React.FC<PropertySummaryProps> = ({
  property,
  className = '',
  testId = 'property-summary',
}) => {
  const getStatusVariant = (status: string) => {
    const statusConfig =
      PROPERTY_STATUSES[status as keyof typeof PROPERTY_STATUSES];
    switch (statusConfig?.color) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      case 'info':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getFileReference = () => {
    // Try to get file reference from property, fallback to address-based reference
    return (
      (property as any)?.fileReference ||
      `${property.address.line1} - ${property.title || 'Property Sale'}`
    );
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <Card className={`${className}`} data-testid={testId}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Home className="h-5 w-5 text-blue-600" />
          Property File Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Essential Property Info */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Address
              </h3>
              <div className="text-sm space-y-1 pl-6">
                <p className="font-medium">{property.address.line1}</p>
                {property.address.line2 && (
                  <p className="text-muted-foreground">
                    {property.address.line2}
                  </p>
                )}
                <p className="text-muted-foreground">
                  {property.address.city}
                  {property.address.county && `, ${property.address.county}`}
                </p>
                <p className="font-medium">{property.address.postcode}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Case Details
              </h3>
              <div className="text-sm space-y-2 pl-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File Reference:</span>
                  <span className="font-medium">{getFileReference()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tenure:</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {property.tenure}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant={getStatusVariant(property.status)}
                    className="text-xs"
                  >
                    {PROPERTY_STATUSES[
                      property.status as keyof typeof PROPERTY_STATUSES
                    ]?.label || property.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Timeline & People */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Timeline
              </h3>
              <div className="text-sm space-y-2 pl-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(property.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{formatDate(property.updatedAt)}</span>
                </div>
                {property.targetCompletionDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Target Completion:
                    </span>
                    <span className="font-medium text-blue-600">
                      {formatDate(property.targetCompletionDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Key Contacts
              </h3>
              <div className="text-sm space-y-2 pl-6">
                {property.owner && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner:</span>
                    <span className="font-medium">
                      {property.owner.firstName} {property.owner.lastName}
                    </span>
                  </div>
                )}
                {property.assignedAgent && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Agent:</span>
                    <span className="font-medium">
                      {property.assignedAgent.firstName}{' '}
                      {property.assignedAgent.lastName}
                    </span>
                  </div>
                )}
                {property.assignedSolicitor && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Solicitor:</span>
                    <span className="font-medium">
                      {property.assignedSolicitor.firstName}{' '}
                      {property.assignedSolicitor.lastName}
                    </span>
                  </div>
                )}
                {!property.assignedAgent && !property.assignedSolicitor && (
                  <p className="text-muted-foreground italic">
                    No additional contacts assigned
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar (if completion percentage exists) */}
        {property.completionPercentage !== undefined && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">File Completion</span>
              <span className="font-medium">
                {property.completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${property.completionPercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
