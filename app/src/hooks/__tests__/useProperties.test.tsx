// src/features/properties/hooks/__tests__/useProperties.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useProperties,
  usePropertyStats,
  useRecentProperties,
  useMyProperties,
} from '../useProperties';
import { propertyService } from '@/services/properties/propertyService';
import type { PropertyListItem, PropertyFilters } from '@/types/property';
import type { PaginatedResponse } from '@/types/api/common.types';

// Mock the property service
vi.mock('@/services/properties/propertyService', () => ({
  propertyService: {
    getProperties: vi.fn(),
    searchProperties: vi.fn(),
    getPropertyStats: vi.fn(),
    getRecentProperties: vi.fn(),
    getMyProperties: vi.fn(),
  },
}));

// Mock the logger
vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useProperties', () => {
  const mockProperties: PropertyListItem[] = [
    {
      id: '1',
      title: 'Test Property 1',
      address: {
        line1: '123 Test Street',
        city: 'London',
        postcode: 'SW1A 1AA',
      },
      propertyType: 'detached',
      tenure: 'freehold',
      status: 'draft',
      askingPrice: 500000,
      bedrooms: 3,
      bathrooms: 2,
      completionPercentage: 75,
      owner: {
        id: '1',
        firstName: 'John',
        lastName: 'Owner',
        email: 'john@test.com',
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Test Property 2',
      address: {
        line1: '456 Another Street',
        city: 'Manchester',
        postcode: 'M1 1AA',
      },
      propertyType: 'flat',
      tenure: 'leasehold',
      status: 'in_progress',
      askingPrice: 300000,
      bedrooms: 2,
      bathrooms: 1,
      completionPercentage: 50,
      owner: {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@test.com',
      },
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-10'),
    },
  ];

  const mockPaginatedResponse: PaginatedResponse<PropertyListItem> = {
    success: true,
    data: mockProperties,
    message: 'Properties fetched successfully',
    meta: {
      pagination: {
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (propertyService.getProperties as any).mockResolvedValue(
      mockPaginatedResponse
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useProperties hook', () => {
    describe('Initial state', () => {
      it('initializes with correct default values', () => {
        const { result } = renderHook(() =>
          useProperties({ autoFetch: false })
        );

        expect(result.current.properties).toEqual([]);
        expect(result.current.totalCount).toBe(0);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isRefreshing).toBe(false);
        expect(result.current.error).toBe(null);
        expect(result.current.pagination).toEqual({
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        });
      });

      it('auto-fetches properties by default', async () => {
        renderHook(() => useProperties());

        await waitFor(() => {
          expect(propertyService.getProperties).toHaveBeenCalledWith(
            {},
            { page: 1, limit: 20 },
            { field: 'updatedAt', direction: 'desc' }
          );
        });
      });

      it('does not auto-fetch when autoFetch is false', () => {
        renderHook(() => useProperties({ autoFetch: false }));

        expect(propertyService.getProperties).not.toHaveBeenCalled();
      });
    });

    describe('Fetching properties', () => {
      it('fetches properties successfully', async () => {
        const { result } = renderHook(() =>
          useProperties({ autoFetch: false })
        );

        await act(async () => {
          await result.current.fetchProperties();
        });

        expect(result.current.properties).toEqual(mockProperties);
        expect(result.current.totalCount).toBe(2);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe(null);
      });

      it('sets loading state during fetch', async () => {
        const { result } = renderHook(() =>
          useProperties({ autoFetch: false })
        );

        let resolvePromise: (value: any) => void;
        (propertyService.getProperties as any).mockReturnValue(
          new Promise((resolve) => {
            resolvePromise = resolve;
          })
        );

        act(() => {
          result.current.fetchProperties();
        });

        expect(result.current.isLoading).toBe(true);

        await act(async () => {
          resolvePromise!(mockPaginatedResponse);
        });

        expect(result.current.isLoading).toBe(false);
      });

      it('handles fetch errors', async () => {
        const errorMessage = 'Failed to fetch properties';
        (propertyService.getProperties as any).mockRejectedValue(
          new Error(errorMessage)
        );

        const { result } = renderHook(() =>
          useProperties({ autoFetch: false })
        );

        await act(async () => {
          await result.current.fetchProperties();
        });

        expect(result.current.error).toBe(errorMessage);
        expect(result.current.properties).toEqual([]);
        expect(result.current.isLoading).toBe(false);
      });
    });

    describe('Refreshing properties', () => {
      it('refreshes properties with refresh flag', async () => {
        const { result } = renderHook(() =>
          useProperties({ autoFetch: false })
        );

        await act(async () => {
          await result.current.refreshProperties();
        });

        expect(result.current.properties).toEqual(mockProperties);
        expect(result.current.isRefreshing).toBe(false);
      });

      it('sets refreshing state during refresh', async () => {
        const { result } = renderHook(() =>
          useProperties({ autoFetch: false })
        );

        let resolvePromise: (value: any) => void;
        (propertyService.getProperties as any).mockReturnValue(
          new Promise((resolve) => {
            resolvePromise = resolve;
          })
        );

        act(() => {
          result.current.refreshProperties();
        });

        expect(result.current.isRefreshing).toBe(true);

        await act(async () => {
          resolvePromise!(mockPaginatedResponse);
        });

        expect(result.current.isRefreshing).toBe(false);
      });
    });

    describe('Filters', () => {
      it('updates filters and resets pagination', () => {
        const { result } = renderHook(() =>
          useProperties({ autoFetch: false })
        );

        const newFilters: PropertyFilters = { status: ['draft'] };

        act(() => {
          result.current.setFilters(newFilters);
        });

        expect(result.current.pagination.page).toBe(1);
      });

      it('clears filters and resets pagination', () => {
        const { result } = renderHook(() =>
          useProperties({
            filters: { status: ['draft'] },
            pagination: { page: 3, limit: 20 },
            autoFetch: false,
          })
        );

        act(() => {
          result.current.clearFilters();
        });

        expect(result.current.pagination.page).toBe(1);
      });
    });

    describe('Pagination', () => {
      it('updates pagination', () => {
        const { result } = renderHook(() =>
          useProperties({ autoFetch: false })
        );

        act(() => {
          result.current.setPagination({ page: 2, limit: 10 });
        });

        expect(result.current.pagination.page).toBe(2);
        expect(result.current.pagination.limit).toBe(10);
      });

      it('calculates pagination info correctly', async () => {
        const responseWithPagination = {
          ...mockPaginatedResponse,
          meta: {
            ...mockPaginatedResponse.meta,
            pagination: {
              page: 2,
              limit: 10,
              total: 25,
              totalPages: 3,
              hasNext: true,
              hasPrev: true,
            },
          },
        };

        (propertyService.getProperties as any).mockResolvedValue(
          responseWithPagination
        );

        const { result } = renderHook(() =>
          useProperties({ pagination: { page: 2, limit: 10 } })
        );

        await waitFor(() => {
          expect(result.current.pagination).toEqual({
            page: 2,
            limit: 10,
            total: 25,
            totalPages: 3,
            hasNext: true,
            hasPrev: true,
          });
        });
      });
    });

    describe('Sorting', () => {
      it('updates sort and resets pagination', () => {
        const { result } = renderHook(() =>
          useProperties({ autoFetch: false })
        );

        act(() => {
          result.current.setSort({ field: 'title', direction: 'asc' });
        });

        expect(result.current.pagination.page).toBe(1);
      });
    });

    describe('Search', () => {
      const mockSearchResults = [
        {
          ...mockProperties[0],
          score: 0.9,
          highlights: [
            {
              field: 'title',
              matches: ['Test Property'],
            },
          ],
        },
      ];

      beforeEach(() => {
        (propertyService.searchProperties as any).mockResolvedValue({
          success: true,
          data: mockSearchResults,
          meta: { pagination: { total: 1 } },
        });
      });

      it('searches properties successfully', async () => {
        const { result } = renderHook(() =>
          useProperties({ autoFetch: false })
        );

        let searchResult;
        await act(async () => {
          searchResult = await result.current.searchProperties('test query');
        });

        expect(searchResult).toEqual(mockSearchResults);
        expect(result.current.searchResults).toEqual(mockSearchResults);
        expect(result.current.isSearching).toBe(false);
      });

      it('sets searching state during search', async () => {
        const { result } = renderHook(() =>
          useProperties({ autoFetch: false })
        );

        let resolvePromise: (value: any) => void;
        (propertyService.searchProperties as any).mockReturnValue(
          new Promise((resolve) => {
            resolvePromise = resolve;
          })
        );

        act(() => {
          result.current.searchProperties('test query');
        });

        expect(result.current.isSearching).toBe(true);

        await act(async () => {
          resolvePromise!({
            success: true,
            data: mockSearchResults,
            meta: { pagination: { total: 1 } },
          });
        });

        expect(result.current.isSearching).toBe(false);
      });

      it('clears search results for empty query', async () => {
        const { result } = renderHook(() =>
          useProperties({ autoFetch: false })
        );

        let searchResult;
        await act(async () => {
          searchResult = await result.current.searchProperties('');
        });

        expect(searchResult).toEqual([]);
        expect(result.current.searchResults).toEqual([]);
      });

      it('clears search results', () => {
        const { result } = renderHook(() =>
          useProperties({ autoFetch: false })
        );

        act(() => {
          result.current.clearSearch();
        });

        expect(result.current.searchResults).toEqual([]);
      });

      it('handles search errors', async () => {
        const errorMessage = 'Search failed';
        (propertyService.searchProperties as any).mockRejectedValue(
          new Error(errorMessage)
        );

        const { result } = renderHook(() =>
          useProperties({ autoFetch: false })
        );

        let searchResult;
        await act(async () => {
          searchResult = await result.current.searchProperties('test query');
        });

        expect(searchResult).toEqual([]);
        expect(result.current.error).toBe(errorMessage);
      });
    });

    describe('Error handling', () => {
      it('clears error', () => {
        const { result } = renderHook(() =>
          useProperties({ autoFetch: false })
        );

        // Simulate error state
        act(() => {
          (result.current as any).setError('Test error');
        });

        act(() => {
          result.current.clearError();
        });

        expect(result.current.error).toBe(null);
      });
    });
  });

  describe('usePropertyStats hook', () => {
    const mockStats = {
      total: 10,
      byStatus: {
        draft: 3,
        in_progress: 4,
        ready: 2,
        shared: 1,
        completed: 0,
      },
      byType: {
        detached: 4,
        semi_detached: 3,
        terraced: 2,
        flat: 1,
        bungalow: 0,
      },
      byTenure: {
        freehold: 7,
        leasehold: 3,
        commonhold: 0,
      },
      averageCompletionTime: 30,
      completionRate: 0.8,
      totalValue: 5000000,
      averageValue: 500000,
    };

    beforeEach(() => {
      (propertyService.getPropertyStats as any).mockResolvedValue(mockStats);
    });

    it('fetches stats successfully', async () => {
      const { result } = renderHook(() => usePropertyStats());

      await waitFor(() => {
        expect(result.current.stats).toEqual(mockStats);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe(null);
      });
    });

    it('handles stats fetch errors', async () => {
      const errorMessage = 'Failed to fetch stats';
      (propertyService.getPropertyStats as any).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => usePropertyStats());

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.stats).toBe(null);
      });
    });

    it('refetches stats', async () => {
      const { result } = renderHook(() => usePropertyStats());

      await waitFor(() => {
        expect(result.current.stats).toEqual(mockStats);
      });

      await act(async () => {
        await result.current.refetch();
      });

      expect(propertyService.getPropertyStats).toHaveBeenCalledTimes(2);
    });
  });

  describe('useRecentProperties hook', () => {
    beforeEach(() => {
      (propertyService.getRecentProperties as any).mockResolvedValue(
        mockProperties
      );
    });

    it('fetches recent properties successfully', async () => {
      const { result } = renderHook(() => useRecentProperties(5));

      await waitFor(() => {
        expect(result.current.properties).toEqual(mockProperties);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe(null);
      });

      expect(propertyService.getRecentProperties).toHaveBeenCalledWith(5);
    });

    it('handles fetch errors', async () => {
      const errorMessage = 'Failed to fetch recent properties';
      (propertyService.getRecentProperties as any).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useRecentProperties());

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.properties).toEqual([]);
      });
    });
  });

  describe('useMyProperties hook', () => {
    beforeEach(() => {
      (propertyService.getMyProperties as any).mockResolvedValue(
        mockPaginatedResponse
      );
    });

    it('fetches my properties successfully', async () => {
      const { result } = renderHook(() => useMyProperties());

      await waitFor(() => {
        expect(result.current.properties).toEqual(mockProperties);
        expect(result.current.totalCount).toBe(2);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe(null);
      });

      expect(propertyService.getMyProperties).toHaveBeenCalledWith(
        { page: 1, limit: 20 },
        { field: 'updatedAt', direction: 'desc' }
      );
    });

    it('handles custom pagination and sort', async () => {
      const pagination = { page: 2, limit: 10 };
      const sort = { field: 'title', direction: 'asc' as const };

      renderHook(() => useMyProperties(pagination, sort));

      await waitFor(() => {
        expect(propertyService.getMyProperties).toHaveBeenCalledWith(
          pagination,
          sort
        );
      });
    });

    it('handles fetch errors', async () => {
      const errorMessage = 'Failed to fetch my properties';
      (propertyService.getMyProperties as any).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useMyProperties());

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.properties).toEqual([]);
        expect(result.current.totalCount).toBe(0);
      });
    });

    it('refetches properties', async () => {
      const { result } = renderHook(() => useMyProperties());

      await waitFor(() => {
        expect(result.current.properties).toEqual(mockProperties);
      });

      await act(async () => {
        await result.current.refetch();
      });

      expect(propertyService.getMyProperties).toHaveBeenCalledTimes(2);
    });
  });

  describe('Integration tests', () => {
    it('handles multiple hook operations correctly', async () => {
      const { result } = renderHook(() => useProperties({ autoFetch: false }));

      // Initial fetch
      await act(async () => {
        await result.current.fetchProperties();
      });

      expect(result.current.properties).toEqual(mockProperties);

      // Update filters
      act(() => {
        result.current.setFilters({ status: ['draft'] });
      });

      expect(result.current.pagination.page).toBe(1);

      // Search
      await act(async () => {
        await result.current.searchProperties('test');
      });

      expect(propertyService.searchProperties).toHaveBeenCalledWith(
        'test',
        { status: ['draft'] },
        { page: 1, limit: 50 }
      );
    });

    it('handles concurrent operations correctly', async () => {
      const { result } = renderHook(() => useProperties({ autoFetch: false }));

      // Start multiple operations
      const promises = [
        result.current.fetchProperties(),
        result.current.searchProperties('test'),
      ];

      await act(async () => {
        await Promise.all(promises);
      });

      expect(propertyService.getProperties).toHaveBeenCalled();
      expect(propertyService.searchProperties).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('handles empty response data', async () => {
      const emptyResponse = {
        ...mockPaginatedResponse,
        data: [],
        meta: {
          ...mockPaginatedResponse.meta,
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      };

      (propertyService.getProperties as any).mockResolvedValue(emptyResponse);

      const { result } = renderHook(() => useProperties({ autoFetch: false }));

      await act(async () => {
        await result.current.fetchProperties();
      });

      expect(result.current.properties).toEqual([]);
      expect(result.current.totalCount).toBe(0);
    });

    it('handles missing pagination metadata', async () => {
      const responseWithoutPagination = {
        success: true,
        data: mockProperties,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      };

      (propertyService.getProperties as any).mockResolvedValue(
        responseWithoutPagination
      );

      const { result } = renderHook(() => useProperties({ autoFetch: false }));

      await act(async () => {
        await result.current.fetchProperties();
      });

      expect(result.current.totalCount).toBe(0);
      expect(result.current.pagination.total).toBe(0);
    });

    it('handles network errors gracefully', async () => {
      const networkError = new Error('Network error');
      networkError.name = 'NetworkError';

      (propertyService.getProperties as any).mockRejectedValue(networkError);

      const { result } = renderHook(() => useProperties({ autoFetch: false }));

      await act(async () => {
        await result.current.fetchProperties();
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.isLoading).toBe(false);
    });

    it('handles rapid filter changes', async () => {
      const { result } = renderHook(() => useProperties({ autoFetch: false }));

      // Rapidly change filters
      act(() => {
        result.current.setFilters({ status: ['draft'] });
        result.current.setFilters({ status: ['in_progress'] });
        result.current.setFilters({ status: ['ready'] });
      });

      // Should end up with the last filter
      expect(result.current.pagination.page).toBe(1);
    });
  });
});
