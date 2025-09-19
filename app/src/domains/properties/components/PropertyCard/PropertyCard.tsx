// src/domains/properties/components/PropertyCard/PropertyCard.tsx - Fixed Component
import React from 'react';
import {
  Card,
  CardContent,
  Badge,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/shared/components/ui';
import {
  MapPin,
  Bed,
  Bath,
  Home,
  Calendar,
  User,
  TrendingUp,
  MoreHorizontal,
  Eye,
  Edit,
  Share,
} from 'lucide-react';
import type { PropertyListItem } from '@/domains/properties/types';
import { PROPERTY_STATUSES } from '@/shared/constants/status';

interface PropertyCardProps {
  property: PropertyListItem;
  onView?: (property: PropertyListItem) => void;
  onEdit?: (property: PropertyListItem) => void;
  onShare?: (property: PropertyListItem) => void;
  showOwner?: boolean;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
  testId?: string;
}

/**
 * PropertyCard component - Built with shadcn/ui from the ground up
 * Displays property information in a card layout with actions
 */
export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onView,
  showOwner = true,
  showActions = true,
  variant = 'default',
  className = '',
  testId = 'property-card',
}) => {
  const formatPrice = (price?: number) => {
    if (!price) return 'Price on request';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(date));
  };

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
  const capitalizeFirstLetter = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'detached':
      case 'semi_detached':
      case 'terraced':
        return <Home className="h-4 w-4" />;
      case 'flat':
        return <TrendingUp className="h-4 w-4" />;
      case 'bungalow':
        return <Home className="h-4 w-4" />;
      default:
        return <Home className="h-4 w-4" />;
    }
  };

  const getOwnerInitials = (owner: PropertyListItem['owner']) => {
    // BUG FIX: Handle empty names gracefully
    const firstName = owner.firstName?.trim() || '';
    const lastName = owner.lastName?.trim() || '';

    if (!firstName && !lastName) return 'UN'; // Unknown

    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const cardVariants = {
    default: 'h-auto',
    compact: 'h-48',
    featured: 'h-auto border-2 border-primary/20 shadow-lg',
  };

  return (
    <Card
      className={`
        ${cardVariants[variant]} 
        hover:shadow-md transition-all duration-200 
        group cursor-pointer
        ${className}
      `}
      onClick={() => onView?.(property)}
      data-testid={`${testId}-${property.id}`}
    >
      <CardContent className="p-0">
        {/* Header Section */}
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                {property.title}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="line-clamp-1">
                  {/* BUG FIX: Handle empty address line1 gracefully */}
                  {property.address.line1 || 'Address not provided'},{' '}
                  {property.address.city} {property.address.postcode}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Badge variant={getStatusVariant(property.status)}>
                {/* BUG FIX: Fallback to raw status if not in PROPERTY_STATUSES */}
                {PROPERTY_STATUSES[
                  property.status as keyof typeof PROPERTY_STATUSES
                ]?.label || property.status}
              </Badge>
              {showActions && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Could open dropdown menu here
                  }}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Property Details */}
          <div
            className="flex items-center gap-4 text-sm text-muted-foreground mb-3"
            data-testid="property-details"
          >
            <div className="flex items-center gap-1">
              {getPropertyTypeIcon(property.propertyType)}
              <span className="capitalize">
                {capitalizeFirstLetter(property.propertyType.replace('_', ' '))}
              </span>
            </div>
            {/* BUG FIX: Only show bedrooms if defined and > 0 */}
            {property.bedrooms && property.bedrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{property.bedrooms} bed</span>
              </div>
            )}
            {/* BUG FIX: Only show bathrooms if defined and > 0 */}
            {property.bathrooms && property.bathrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{property.bathrooms} bath</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mb-3">
            <div className="text-2xl font-bold text-foreground">
              {formatPrice(property.askingPrice)}
            </div>
          </div>
        </div>

        {/* Footer Section */}
        {showOwner && (
          <div className="px-4 py-3 border-t bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="text-xs">
                    {getOwnerInitials(property.owner)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">
                    {/* BUG FIX: Handle empty names gracefully */}
                    {property.owner.firstName?.trim() ||
                    property.owner.lastName?.trim()
                      ? `${property.owner.firstName} ${property.owner.lastName}`.trim()
                      : 'Unknown Owner'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Property Owner
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-muted-foreground">Created</div>
                <div className="text-xs font-medium">
                  {formatDate(property.createdAt)}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
