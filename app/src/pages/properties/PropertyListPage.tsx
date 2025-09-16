// src/pages/properties/PropertyListPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { useProperties } from '@/hooks';
import { PropertyGrid } from '@/features/properties/PropertyGrid';
import { PageLayout } from '@/components/layout/PageLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '@/components/ui';
import { Plus, Home } from 'lucide-react';
import { buildRoute } from '@/constants/routes';
import type { PropertyListItem, PropertyFilters } from '@/types/property';
import type {
  PaginationParams,
  PropertyStatus,
  PropertyType,
  SortParams,
} from '@/types/global.types';

interface PropertyListPageProps {
  className?: string;
  testId?: string;
}

/**
 * PropertyListPage - Main property listing page
 * Integrates PropertyGrid with data fetching and navigation
 */
export const PropertyListPage: React.FC<PropertyListPageProps> = ({
  className = '',
  testId = 'property-list-page',
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // URL state management
  const [pagination, setPagination] = useState<PaginationParams>({
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: parseInt(searchParams.get('limit') || '12', 10),
  });

  const [sort, setSort] = useState<SortParams>({
    field: searchParams.get('sortField') || 'updatedAt',
    direction: (searchParams.get('sortDirection') as 'asc' | 'desc') || 'desc',
  });

  const [filters, setFilters] = useState<PropertyFilters>({
    status: (searchParams.get('status') as PropertyStatus) || undefined,
    propertyType:
      (searchParams.get('propertyType') as PropertyType) || undefined,
    minPrice: searchParams.get('minPrice')
      ? parseInt(searchParams.get('minPrice')!, 10)
      : undefined,
    maxPrice: searchParams.get('maxPrice')
      ? parseInt(searchParams.get('maxPrice')!, 10)
      : undefined,
    bedrooms: searchParams.get('bedrooms')
      ? parseInt(searchParams.get('bedrooms')!, 10)
      : undefined,
    city: searchParams.get('city') || undefined,
  });

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    (searchParams.get('view') as 'grid' | 'list') || 'grid'
  );

  // Fetch properties using the hook
  const {
    properties,
    totalCount,
    pagination: paginationInfo,
    isLoading,
    error,
    refreshProperties,
  } = useProperties({
    pagination,
    sort,
    filters: {
      ...filters,
      ...(searchQuery && { search: searchQuery }),
    },
  });

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();

    if (pagination.page > 1) params.set('page', pagination.page.toString());
    if (pagination.limit !== 12)
      params.set('limit', pagination.limit.toString());
    if (sort.field !== 'updatedAt') params.set('sortField', sort.field);
    if (sort.direction !== 'desc') params.set('sortDirection', sort.direction);
    if (filters.status)
      params.set(
        'status',
        Array.isArray(filters.status)
          ? filters.status.join(',')
          : filters.status
      );
    if (filters.propertyType)
      params.set(
        'propertyType',
        Array.isArray(filters.propertyType)
          ? filters.propertyType.join(',')
          : filters.propertyType
      );
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms.toString());
    if (filters.city) params.set('city', filters.city);
    if (searchQuery) params.set('search', searchQuery);
    if (viewMode !== 'grid') params.set('view', viewMode);

    setSearchParams(params, { replace: true });
  }, [pagination, sort, filters, searchQuery, viewMode, setSearchParams]);

  // Event handlers
  const handlePropertyView = (property: PropertyListItem) => {
    navigate(buildRoute.propertyDetail(property.id));
  };

  const handlePropertyEdit = (property: PropertyListItem) => {
    navigate(buildRoute.propertyEdit(property.id));
  };

  const handlePropertyShare = (property: PropertyListItem) => {
    navigate(buildRoute.shareProperty(property.id));
  };

  const handleCreateProperty = () => {
    navigate('/properties/create');
  };

  const handleFiltersChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleSortChange = (newSort: SortParams) => {
    setSort(newSort);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePaginationChange = (newPagination: Partial<PaginationParams>) => {
    setPagination((prev) => ({ ...prev, ...newPagination }));
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  // Error state
  if (error) {
    return (
      <PageLayout>
        <div
          className={`container mx-auto px-4 py-8 ${className}`}
          data-testid={testId}
        >
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-destructive">
                Error Loading Properties
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                {error && typeof error === 'object' && 'message' in error
                  ? (error as any).message
                  : 'An unexpected error occurred'}
              </p>
              <Button onClick={() => refreshProperties()} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Calculate page title and stats
  const pageTitle =
    user?.role === 'agent'
      ? 'Managed Properties'
      : user?.role === 'owner'
        ? 'My Properties'
        : 'Properties';

  const canCreateProperty = user?.role === 'owner' || user?.role === 'agent';

  return (
    <PageLayout>
      <div
        className={`container mx-auto px-4 py-8 ${className}`}
        data-testid={testId}
      >
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Home className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {pageTitle}
              </h1>
              <p className="text-muted-foreground">
                {isLoading ? 'Loading...' : `${totalCount || 0} properties`}
              </p>
            </div>
          </div>

          {canCreateProperty && (
            <Button
              onClick={handleCreateProperty}
              className="flex items-center gap-2"
              data-testid="create-property-button"
            >
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
          )}
        </div>

        {/* Stats Cards (if available) */}
        {/* Note: Stats would need to be fetched separately using usePropertyStats */}

        {/* Property Grid */}
        <PropertyGrid
          properties={properties || []}
          totalCount={totalCount || 0}
          pagination={
            paginationInfo || {
              page: 1,
              limit: 12,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            }
          }
          filters={filters}
          sort={sort}
          isLoading={isLoading}
          searchQuery={searchQuery}
          viewMode={viewMode}
          onPropertyView={handlePropertyView}
          onPropertyEdit={handlePropertyEdit}
          onPropertyShare={handlePropertyShare}
          onCreateProperty={handleCreateProperty}
          onFiltersChange={handleFiltersChange}
          onSortChange={handleSortChange}
          onPaginationChange={handlePaginationChange}
          onSearchChange={handleSearchChange}
          onViewModeChange={handleViewModeChange}
          showCreateButton={canCreateProperty}
          testId="properties-grid"
        />
      </div>
    </PageLayout>
  );
};
