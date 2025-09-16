// src/pages/properties/PropertyDetailsPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { useProperty } from '@/hooks';
import { PropertyDetails } from '@/features/properties/PropertyDetails';
import { PageLayout } from '@/components/layout/PageLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
  Skeleton,
  Alert,
  AlertDescription,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui';
import {
  ArrowLeft,
  Edit,
  Share,
  FileText,
  Activity,
  Settings,
  Home,
  MapPin,
  Calendar,
  User,
  AlertTriangle,
} from 'lucide-react';
import { buildRoute } from '@/constants/routes';
import { PROPERTY_STATUSES } from '@/constants/status';
interface PropertyDetailsPageProps {
  className?: string;
  testId?: string;
}

/**
 * PropertyDetailsPage - Detailed view of a single property
 * Shows property information, documents, and activity
 */
export const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({
  className = '',
  testId = 'property-details-page',
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch property data
  const { data: property, isLoading, error, refetch } = useProperty(id!);

  // Loading state
  if (isLoading) {
    return (
      <PageLayout>
        <div
          className={`container mx-auto px-4 py-8 ${className}`}
          data-testid={testId}
        >
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (error || !property) {
    return (
      <PageLayout>
        <div
          className={`container mx-auto px-4 py-8 ${className}`}
          data-testid={testId}
        >
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-destructive">
                Property Not Found
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                {error && typeof error === 'object' && 'message' in error
                  ? (error as any).message
                  : "The property you're looking for doesn't exist or you don't have permission to view it."}
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => navigate('/properties')}
                  variant="outline"
                >
                  Back to Properties
                </Button>
                <Button onClick={() => refetch()} variant="default">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Permission checks
  const canEdit =
    property?.owner &&
    (user?.id === property.owner.id || user?.role === 'agent');
  const canShare = canEdit;

  const handleEdit = () => {
    if (property) {
      navigate(buildRoute.propertyEdit(property.id));
    }
  };

  const handleShare = () => {
    if (property) {
      navigate(buildRoute.shareProperty(property.id));
    }
  };

  const handleBackToList = () => {
    navigate('/properties');
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <PageLayout>
      <div
        className={`container mx-auto px-4 py-8 ${className}`}
        data-testid={testId}
      >
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/properties">Properties</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{property.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToList}
                className="flex items-center gap-2"
                data-testid="back-button"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Badge variant={getStatusVariant(property.status)}>
                {PROPERTY_STATUSES[
                  property.status as keyof typeof PROPERTY_STATUSES
                ]?.label || property.status}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-2 truncate">
              {property.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>
                  {property.address.line1}, {property.address.city}{' '}
                  {property.address.postcode}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(property.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>
                  {property.owner
                    ? `${property.owner.firstName} ${property.owner.lastName}`
                    : 'Owner information unavailable'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-4">
            {canShare && (
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center gap-2"
                data-testid="share-button"
              >
                <Share className="h-4 w-4" />
                Share
              </Button>
            )}
            {canEdit && (
              <Button
                onClick={handleEdit}
                className="flex items-center gap-2"
                data-testid="edit-button"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Warning for incomplete properties */}
        {property.status === 'draft' && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This property is in draft status. Complete the property
              information and upload required documents to make it ready for
              sharing.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content - Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-2"
              disabled={!canEdit}
            >
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <PropertyDetails
              property={property}
              onEdit={canEdit ? (_prop) => handleEdit() : undefined}
              onShare={canShare ? (_prop) => handleShare() : undefined}
              testId="property-details-overview"
            />
          </TabsContent>

          {/* Documents Tab - Placeholder for Stage 4 */}
          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Property Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    Document Management Coming Soon
                  </p>
                  <p>
                    Upload and manage property documents in the next release.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab - Placeholder for Stage 5 */}
          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Property Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    Activity Timeline Coming Soon
                  </p>
                  <p>
                    Track property changes and user interactions in the next
                    release.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Property Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    Advanced Settings Coming Soon
                  </p>
                  <p>
                    Configure sharing permissions and advanced property settings
                    in the next release.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};
