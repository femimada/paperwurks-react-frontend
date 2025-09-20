// src/domains/properties/components/PropertyGrid/PropertyGrid.tsx - Fixed Component
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Skeleton,
} from '@/shared/components/ui';
import { PropertyCard } from '../PropertyCard/PropertyCard';
import { Search, Grid3x3, List, Plus, Filter } from 'lucide-react';
import type {
  PropertyListItem,
  PropertyFilters,
  PropertyStats,
} from '@/domains/properties/types';
import type { PaginationParams, SortParams } from '@/shared/types/global.types';

interface PropertyGridProps {
  properties: PropertyListItem[];
  totalCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats?: PropertyStats;
  filters?: PropertyFilters;
  sort?: SortParams;
  isLoading?: boolean;
  searchQuery?: string;
  viewMode?: 'grid' | 'list';

  // Event handlers
  onPropertyView?: (property: PropertyListItem) => void;
  onPropertyEdit?: (property: PropertyListItem) => void;
  onPropertyShare?: (property: PropertyListItem) => void;
  onCreateProperty?: () => void;
  onFiltersChange?: (filters: PropertyFilters) => void;
  onSortChange?: (sort: SortParams) => void;
  onPaginationChange?: (pagination: Partial<PaginationParams>) => void;
  onSearchChange?: (query: string) => void;
  onViewModeChange?: (mode: 'grid' | 'list') => void;

  // Configuration
  showFilters?: boolean;
  showStats?: boolean;
  showCreateButton?: boolean;
  className?: string;
  testId?: string;
}

/**
 * PropertyGrid component - Built with shadcn/ui
 * Responsive grid layout for property listings with filters and pagination
 */
export const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  totalCount,
  pagination,
  stats,
  filters = {},
  sort = { field: 'updatedAt', direction: 'desc' },
  isLoading = false,
  searchQuery = '',
  viewMode = 'grid',
  onPropertyView,
  onPropertyEdit,
  onPropertyShare,
  onCreateProperty,
  onSortChange,
  onPaginationChange,
  onSearchChange,
  onViewModeChange,
  showFilters = true,
  showStats = true,
  showCreateButton = true,
  className = '',
  testId = 'property-grid',
}) => {
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange?.(localSearchQuery);
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-');
    onSortChange?.({
      field,
      direction: direction as 'asc' | 'desc',
    });
  };

  const handlePageChange = (page: number) => {
    onPaginationChange?.({ page });
  };

  const renderSkeleton = () => (
    <div
      className={`grid gap-6 ${
        viewMode === 'grid'
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1'
      }`}
    >
      {Array.from({ length: 6 }, (_, index) => (
        <Card key={index} data-testid={`skeleton-card-${index}`}>
          <CardContent className="p-4">
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-3 w-1/2 mb-3" />
            <Skeleton className="h-6 w-1/3 mb-3" />
            <Skeleton className="h-2 w-full mb-2" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`} data-testid={testId}>
      {/* Header with Search, Filters, and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties by title, location, or owner..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
            </form>

            {/* Sort and View Controls */}
            <div className="flex items-center gap-2">
              {/* Filters Toggle */}
              {showFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  data-testid="filter-toggle"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              )}

              {/* Sort */}
              <Select
                value={`${sort.field}-${sort.direction}`}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-48" data-testid="sort-select">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updatedAt-desc">
                    Recently Updated
                  </SelectItem>
                  <SelectItem value="createdAt-desc">
                    Recently Created
                  </SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                  <SelectItem value="askingPrice-desc">
                    Price High to Low
                  </SelectItem>
                  <SelectItem value="askingPrice-asc">
                    Price Low to High
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange?.('grid')}
                  className="rounded-r-none border-r"
                  data-testid="grid-view-button"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange?.('list')}
                  className="rounded-l-none"
                  data-testid="list-view-button"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Create Property */}
              {showCreateButton && onCreateProperty && (
                <Button
                  onClick={onCreateProperty}
                  data-testid="create-property-button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Bar */}
      {showStats && stats && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {stats.total}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Properties
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.byStatus.ready || 0}
                </div>
                <div className="text-sm text-muted-foreground">Ready</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.byStatus.in_progress || 0}
                </div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.byStatus.draft || 0}
                </div>
                <div className="text-sm text-muted-foreground">Drafts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.byStatus.completed || 0}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {/* BUG FIX: Handle cases where averageValue might be 0 or undefined */}
                  {stats.averageValue
                    ? new Intl.NumberFormat('en-GB', {
                        style: 'currency',
                        currency: 'GBP',
                        notation: 'compact',
                        maximumFractionDigits: 1,
                      }).format(stats.averageValue)
                    : '£0'}
                </div>
                <div className="text-sm text-muted-foreground">Avg. Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {/* BUG FIX: Handle edge cases where pagination might be 0 */}
          Showing{' '}
          {totalCount > 0
            ? (pagination.page - 1) * pagination.limit + 1
            : 0} to {Math.min(pagination.page * pagination.limit, totalCount)}{' '}
          of {totalCount} properties
        </div>

        {/* Pagination Info */}
        <div className="text-sm text-muted-foreground">
          {/* BUG FIX: Handle case where totalPages might be 0 */}
          Page {pagination.totalPages > 0 ? pagination.page : 0} of{' '}
          {pagination.totalPages}
        </div>
      </div>

      {/* Property Grid */}
      {isLoading ? (
        renderSkeleton()
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <Grid3x3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Properties Found
              </h3>
              <p className="text-sm max-w-md mx-auto mb-4">
                {searchQuery
                  ? `No properties match your search for "${searchQuery}". Try adjusting your search terms or filters.`
                  : 'No properties have been created yet. Add your first property to get started.'}
              </p>
              {showCreateButton && onCreateProperty && !searchQuery && (
                <Button
                  onClick={onCreateProperty}
                  data-testid="create-property-button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Property
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}
          data-testid="properties-grid"
        >
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onView={onPropertyView}
              onEdit={onPropertyEdit}
              onShare={onPropertyShare}
              variant={viewMode === 'list' ? 'compact' : 'default'}
              testId="property-card"
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                data-testid="prev-page-button"
              >
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const pageNum = Math.max(1, pagination.page - 2) + i;
                    if (pageNum > pagination.totalPages) return null;

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          pageNum === pagination.page ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        data-testid={`page-${pageNum}-button`}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                data-testid="next-page-button"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
