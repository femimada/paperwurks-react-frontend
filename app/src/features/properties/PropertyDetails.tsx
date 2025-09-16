// src/features/properties/components/PropertyDetails.tsx (Built with shadcn/ui)
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import {
  MapPin,
  Bed,
  Bath,
  Home,
  Calendar,
  User,
  Edit,
  Share2,
  MoreHorizontal,
  TrendingUp,
  Activity,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Info,
} from 'lucide-react';
import type { Property, PropertyActivity } from '@/types/property';
import { PROPERTY_STATUSES } from '@/constants/status';

interface PropertyDetailsProps {
  property: Property;
  activities?: PropertyActivity[];
  onEdit?: (property: Property) => void;
  onShare?: (property: Property) => void;
  onArchive?: (property: Property) => void;
  onStatusChange?: (property: Property, status: string) => void;
  isLoading?: boolean;
  className?: string;
  testId?: string;
}

/**
 * PropertyDetails component - Built with shadcn/ui
 * Comprehensive property view with tabs for different sections
 */
export const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  property,
  activities = [],
  onEdit,
  onShare,
  className = '',
  testId = 'property-details',
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on request';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Not set';
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'draft':
        return <Edit className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getOwnerInitials = () => {
    if (!property.owner) return 'UN';
    return `${property.owner.firstName?.charAt(0) || ''}${property.owner.lastName?.charAt(0) || ''}`;
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Property Information */}
      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Address
                </dt>
                <dd className="text-sm text-foreground">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <div>{property.address.line1}</div>
                      {property.address.line2 && (
                        <div>{property.address.line2}</div>
                      )}
                      <div>
                        {property.address.city}, {property.address.county}
                      </div>
                      <div>{property.address.postcode}</div>
                      <div>{property.address.country}</div>
                    </div>
                  </div>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Property Type
                </dt>
                <dd className="text-sm text-foreground capitalize">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    {property.propertyType.replace('_', ' ')}
                  </div>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Tenure
                </dt>
                <dd className="text-sm text-foreground capitalize">
                  {property.tenure}
                </dd>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Asking Price
                </dt>
                <dd className="text-lg font-semibold text-foreground">
                  {formatPrice(property.askingPrice)}
                </dd>
              </div>

              {property.bedrooms && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Bedrooms
                  </dt>
                  <dd className="text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4" />
                      {property.bedrooms}
                    </div>
                  </dd>
                </div>
              )}

              {property.bathrooms && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Bathrooms
                  </dt>
                  <dd className="text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <Bath className="h-4 w-4" />
                      {property.bathrooms}
                    </div>
                  </dd>
                </div>
              )}
            </div>
          </div>

          {property.description && (
            <div className="pt-4 border-t">
              <dt className="text-sm font-medium text-muted-foreground mb-2">
                Description
              </dt>
              <dd className="text-sm text-foreground leading-relaxed">
                {property.description}
              </dd>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Overall Progress
              </span>
              <span className="text-2xl font-bold text-foreground">
                {property.completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className={`
                  h-3 rounded-full transition-all duration-300
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
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Complete</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Pending</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Dates */}
      {(property.targetCompletionDate || property.createdAt) && (
        <Card>
          <CardHeader>
            <CardTitle>Key Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Created
              </dt>
              <dd className="text-sm text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(property.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Last Updated
              </dt>
              <dd className="text-sm text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {formatDate(property.updatedAt)}
              </dd>
            </div>
            {property.targetCompletionDate && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Target Completion
                </dt>
                <dd className="text-sm text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {formatDate(property.targetCompletionDate)}
                </dd>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPeopleTab = () => (
    <div className="space-y-6">
      {/* Owner */}
      {property.owner && (
        <Card>
          <CardHeader>
            <CardTitle>Property Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src=""
                  alt={`${property.owner.firstName} ${property.owner.lastName}`}
                />
                <AvatarFallback>{getOwnerInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">
                  {property.owner.firstName} {property.owner.lastName}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {property.owner.email}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assigned Agent */}
      {property.assignedAgent && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src=""
                  alt={`${property.assignedAgent.firstName} ${property.assignedAgent.lastName}`}
                />
                <AvatarFallback>
                  {property.assignedAgent.firstName?.charAt(0)}
                  {property.assignedAgent.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">
                  {property.assignedAgent.firstName}{' '}
                  {property.assignedAgent.lastName}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Estate Agent
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assigned Solicitor */}
      {property.assignedSolicitor && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Solicitor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src=""
                  alt={`${property.assignedSolicitor.firstName} ${property.assignedSolicitor.lastName}`}
                />
                <AvatarFallback>
                  {property.assignedSolicitor.firstName?.charAt(0)}
                  {property.assignedSolicitor.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">
                  {property.assignedSolicitor.firstName}{' '}
                  {property.assignedSolicitor.lastName}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">Solicitor</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Activity Yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Activity will appear here as you work with this property.
            </p>
          </CardContent>
        </Card>
      ) : (
        activities.map((activity) => (
          <Card key={activity.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-foreground">
                      {activity.description}
                    </h4>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                  {activity.user && (
                    <p className="text-sm text-muted-foreground">
                      by {activity.user.firstName} {activity.user.lastName}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`} data-testid={testId}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-2">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {property.title}
              </h1>
              <div className="flex items-center text-muted-foreground mb-3">
                <MapPin className="h-4 w-4 mr-2" />
                <span>
                  {property.address.line1}, {property.address.city}{' '}
                  {property.address.postcode}
                </span>
              </div>
            </div>
            <Badge
              variant={getStatusVariant(property.status)}
              className="flex items-center gap-1"
            >
              {getStatusIcon(property.status)}
              {PROPERTY_STATUSES[
                property.status as keyof typeof PROPERTY_STATUSES
              ]?.label || property.status}
            </Badge>
          </div>

          <div className="text-3xl font-bold text-foreground mb-2">
            {formatPrice(property.askingPrice)}
          </div>
        </div>

        <div className="flex gap-2">
          {onEdit && (
            <Button
              onClick={() => onEdit(property)}
              data-testid="edit-property"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {onShare && (
            <Button
              variant="outline"
              onClick={() => onShare(property)}
              data-testid="share-property"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" data-testid="overview-tab">
            <Home className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="people" data-testid="people-tab">
            <User className="h-4 w-4 mr-2" />
            People
          </TabsTrigger>
          <TabsTrigger value="activity" data-testid="activity-tab">
            <Activity className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="people" className="mt-6">
          {renderPeopleTab()}
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          {renderActivityTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};
