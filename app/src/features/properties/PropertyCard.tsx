// src/features/properties/components/PropertyCard.tsx (Built with shadcn/ui)
import React from 'react';
import {
  Card,
  CardContent,
  Badge,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui';
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
import type { PropertyListItem } from '@/types/property';
import { PROPERTY_STATUSES } from '@/constants/status';

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
  onEdit,
  onShare,
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
    return `${owner.firstName.charAt(0)}${owner.lastName.charAt(0)}`;
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
                  {property.address.line1}, {property.address.city}{' '}
                  {property.address.postcode}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Badge variant={getStatusVariant(property.status)}>
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
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              {getPropertyTypeIcon(property.propertyType)}
              <span className="capitalize">
                {property.propertyType.replace('_', ' ')}
              </span>
            </div>
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{property.bedrooms} bed</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{property.bathrooms} bath</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mb-3">
            <span className="text-2xl font-bold text-foreground">
              {formatPrice(property.askingPrice)}
            </span>
            <span className="text-sm text-muted-foreground ml-2 capitalize">
              {property.tenure}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-medium text-foreground">
                {property.completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`
                  h-2 rounded-full transition-all duration-300
                  ${
                    property.completionPercentage >= 100
                      ? 'bg-green-500'
                      : property.completionPercentage >= 75
                        ? 'bg-blue-500'
                        : property.completionPercentage >= 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                  }
                `}
                style={{
                  width: `${Math.min(property.completionPercentage, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="px-4 pb-4 border-t bg-muted/30">
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-3">
              {/* Owner Info */}
              {showOwner && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src=""
                      alt={`${property.owner.firstName} ${property.owner.lastName}`}
                    />
                    <AvatarFallback className="text-xs">
                      {getOwnerInitials(property.owner)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {property.owner.firstName} {property.owner.lastName}
                  </span>
                </div>
              )}

              {/* Assigned Agent/Solicitor */}
              {property.assignedAgent && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>
                    {property.assignedAgent.firstName}{' '}
                    {property.assignedAgent.lastName}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {showActions && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs opacity-0 group-hover:opacity-100 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView?.(property);
                  }}
                  data-testid={`view-${property.id}`}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs opacity-0 group-hover:opacity-100 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(property);
                    }}
                    data-testid={`edit-${property.id}`}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}
                {onShare && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs opacity-0 group-hover:opacity-100 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare(property);
                    }}
                    data-testid={`share-${property.id}`}
                  >
                    <Share className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                )}
              </div>
            )}

            {/* Last Updated */}
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Updated {formatDate(property.updatedAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
