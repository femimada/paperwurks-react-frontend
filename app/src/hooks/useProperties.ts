// src/features/properties/hooks/useProperties.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  UpdatePropertyData,
  CreatePropertyData,
  Property,
} from '@/types/property';
import { propertyService } from '@/services/properties/propertyService';
import { logger } from '@/utils/logger';
import type {
  PropertyListItem,
  PropertyFilters,
  PropertyStats,
  PropertySearchResult,
} from '@/types/property';
import type { PaginationParams, SortParams } from '@/types/global.types';

interface UsePropertiesOptions {
  filters?: PropertyFilters;
  pagination?: PaginationParams;
  sort?: SortParams;
  autoFetch?: boolean;
}

interface UsePropertiesReturn {
  // Data
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

  // State
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  fetchProperties: () => Promise<void>;
  refreshProperties: () => Promise<void>;
  setFilters: (filters: PropertyFilters) => void;
  setPagination: (pagination: Partial<PaginationParams>) => void;
  setSort: (sort: SortParams) => void;
  clearFilters: () => void;
  clearError: () => void;

  // Search
  searchProperties: (query: string) => Promise<PropertySearchResult[]>;
  isSearching: boolean;
  searchResults: PropertySearchResult[];
  clearSearch: () => void;
}

/**
 * Hook for managing properties list state and operations
 */
export const useProperties = (
  options: UsePropertiesOptions = {}
): UsePropertiesReturn => {
  const {
    filters: initialFilters = {},
    pagination: initialPagination = { page: 1, limit: 20 },
    sort: initialSort = { field: 'updatedAt', direction: 'desc' },
    autoFetch = true,
  } = options;

  // State
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFiltersState] = useState<PropertyFilters>(initialFilters);
  const [pagination, setPaginationState] =
    useState<PaginationParams>(initialPagination);
  const [sort, setSortState] = useState<SortParams>(initialSort);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PropertySearchResult[]>(
    []
  );
  const [lastSearchQuery, setLastSearchQuery] = useState<string>('');

  // Derived pagination info
  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(totalCount / pagination.limit);
    return {
      page: pagination.page,
      limit: pagination.limit,
      total: totalCount,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    };
  }, [totalCount, pagination]);

  // Fetch properties function
  const fetchProperties = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        logger.debug('Fetching properties', { filters, pagination, sort });

        const response = await propertyService.getProperties(
          filters,
          pagination,
          sort
        );

        setProperties(response.data);
        setTotalCount(response.meta.pagination?.total || 0);

        logger.info('Properties fetched successfully', {
          count: response.data.length,
          total: response.meta.pagination?.total,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch properties';
        setError(errorMessage);
        logger.error('Failed to fetch properties', {
          error: errorMessage,
          filters,
          pagination,
          sort,
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [filters, pagination, sort]
  );

  // Refresh properties
  const refreshProperties = useCallback(async () => {
    await fetchProperties(true);
  }, [fetchProperties]);

  // Search properties
  const searchProperties = useCallback(
    async (query: string): Promise<PropertySearchResult[]> => {
      if (!query.trim()) {
        setSearchResults([]);
        setLastSearchQuery('');
        return [];
      }

      if (query === lastSearchQuery && searchResults.length > 0) {
        return searchResults;
      }

      setIsSearching(true);
      setError(null);

      try {
        logger.debug('Searching properties', { query, filters });

        const response = await propertyService.searchProperties(
          query,
          filters,
          { page: 1, limit: 50 } // Limit search results
        );

        const results = response.data;
        setSearchResults(results);
        setLastSearchQuery(query);

        logger.info('Property search completed', {
          query,
          resultCount: results.length,
        });

        return results;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Search failed';
        setError(errorMessage);
        logger.error('Property search failed', { error: errorMessage, query });
        return [];
      } finally {
        setIsSearching(false);
      }
    },
    [filters, lastSearchQuery, searchResults]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setLastSearchQuery('');
  }, []);

  // Update filters
  const setFilters = useCallback((newFilters: PropertyFilters) => {
    setFiltersState(newFilters);
    setPaginationState((prev) => ({ ...prev, page: 1 })); // Reset to first page
    clearSearch();
  }, []);

  // Update pagination
  const setPagination = useCallback(
    (newPagination: Partial<PaginationParams>) => {
      setPaginationState((prev) => ({ ...prev, ...newPagination }));
    },
    []
  );

  // Update sort
  const setSort = useCallback((newSort: SortParams) => {
    setSortState(newSort);
    setPaginationState((prev) => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFiltersState({});
    setPaginationState({ page: 1, limit: pagination.limit });
    clearSearch();
  }, [pagination.limit]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch on dependency changes
  useEffect(() => {
    if (autoFetch) {
      fetchProperties();
    }
  }, [fetchProperties, autoFetch]);

  return {
    // Data
    properties,
    totalCount,
    pagination: paginationInfo,

    // State
    isLoading,
    isRefreshing,
    error,

    // Actions
    fetchProperties: () => fetchProperties(false),
    refreshProperties,
    setFilters,
    setPagination,
    setSort,
    clearFilters,
    clearError,

    // Search
    searchProperties,
    isSearching,
    searchResults,
    clearSearch,
  };
};

/**
 * Hook for getting properties statistics
 */
export const usePropertyStats = (filters?: PropertyFilters) => {
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const statsData = await propertyService.getPropertyStats(filters);
      setStats(statsData);
      logger.info('Property stats fetched successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(errorMessage);
      logger.error('Failed to fetch property stats', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
};

/**
 * Hook for getting recent properties
 */
export const useRecentProperties = (limit: number = 5) => {
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const recentProperties = await propertyService.getRecentProperties(limit);
      setProperties(recentProperties);
      logger.info('Recent properties fetched successfully', {
        count: recentProperties.length,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch recent properties';
      setError(errorMessage);
      logger.error('Failed to fetch recent properties', {
        error: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchRecentProperties();
  }, [fetchRecentProperties]);

  return {
    properties,
    isLoading,
    error,
    refetch: fetchRecentProperties,
  };
};

/**
 * Hook for getting user's properties
 */
export const useMyProperties = (
  pagination: PaginationParams = { page: 1, limit: 20 },
  sort: SortParams = { field: 'updatedAt', direction: 'desc' }
) => {
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await propertyService.getMyProperties(pagination, sort);
      setProperties(response.data);
      setTotalCount(response.meta.pagination?.total || 0);
      logger.info('My properties fetched successfully', {
        count: response.data.length,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch my properties';
      setError(errorMessage);
      logger.error('Failed to fetch my properties', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [pagination, sort]);

  useEffect(() => {
    fetchMyProperties();
  }, [fetchMyProperties]);

  return {
    properties,
    totalCount,
    isLoading,
    error,
    refetch: fetchMyProperties,
  };
};

/**
 * Hook for creating a new property
 */
export const usePropertyCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePropertyData): Promise<Property> => {
      return propertyService.createProperty(data);
    },
    onSuccess: (newProperty: any) => {
      // Invalidate and refetch properties list
      queryClient.invalidateQueries({ queryKey: ['properties'] });

      // Add the new property to the cache
      queryClient.setQueryData(['property', newProperty.id], newProperty);

      // Update properties list cache if it exists
      queryClient.setQueryData(['properties'], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          data: [newProperty, ...oldData.data],
          meta: {
            ...oldData.meta,
            total: oldData.meta.total + 1,
          },
        };
      });
    },
    onError: (error: any) => {
      console.error('Failed to create property:', error);
    },
  });
};

interface UsePropertyUpdateParams {
  id: string;
}

/**
 * Hook for updating an existing property
 */
export const usePropertyUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      params: UsePropertyUpdateParams & UpdatePropertyData
    ): Promise<Property> => {
      const { id, ...data } = params;
      return propertyService.updateProperty(id, data);
    },
    onSuccess: (updatedProperty) => {
      // Update the specific property in cache
      queryClient.setQueryData(
        ['property', updatedProperty.id],
        updatedProperty
      );

      // Update properties list cache
      queryClient.setQueryData(['properties'], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          data: oldData.data.map((property: Property) =>
            property.id === updatedProperty.id ? updatedProperty : property
          ),
        };
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: (error) => {
      console.error('Failed to update property:', error);
    },
  });
};

/**
 * Hook for fetching a single property by ID
 */
export const useProperty = (id: string) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProperty = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      logger.debug('Fetching property', { id });

      const propertyData = await propertyService.getProperty(id);
      setProperty(propertyData);

      logger.info('Property fetched successfully', { id });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch property';
      setError(errorMessage);
      logger.error('Failed to fetch property', { error: errorMessage, id });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const refetch = useCallback(() => {
    return fetchProperty();
  }, [fetchProperty]);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [fetchProperty]);

  return {
    data: property,
    isLoading,
    error,
    refetch,
  };
};
