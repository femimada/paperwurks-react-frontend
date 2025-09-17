// src/services/properties/__tests__/propertyService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PropertyService } from '../propertyService';
import { apiClient } from '@/services/api';
import type {
  Property,
  CreatePropertyData,
  UpdatePropertyData,
  PropertyFilters,
} from '@/domains/properties/types';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api/common.types';

// Mock the API client
vi.mock('@/services/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock API endpoints
vi.mock('@/shared/constants/api', () => ({
  API_ENDPOINTS: {
    PROPERTIES: {
      LIST: '/properties',
      CREATE: '/properties',
      DETAIL: (id: string) => `/properties/${id}`,
      UPDATE: (id: string) => `/properties/${id}`,
      DELETE: (id: string) => `/properties/${id}`,
      TIMELINE: (id: string) => `/properties/${id}/timeline`,
    },
  },
}));

describe('PropertyService', () => {
  let propertyService: PropertyService;
  const mockApiClient = apiClient as any;

  const mockProperty: Property = {
    id: '1',
    title: 'Test Property',
    description: 'A test property',
    address: {
      line1: '123 Test Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      country: 'UK',
    },
    propertyType: 'detached',
    tenure: 'freehold',
    status: 'draft',
    bedrooms: 3,
    bathrooms: 2,
    askingPrice: 500000,
    ownerId: 'owner-1',
    completionPercentage: 0,
    isActive: true,
    isArchived: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockCreatePropertyData: CreatePropertyData = {
    title: 'New Property',
    address: {
      line1: '456 New Street',
      city: 'Manchester',
      postcode: 'M1 1AA',
      country: 'UK',
    },
    propertyType: 'flat',
    tenure: 'leasehold',
    bedrooms: 2,
    bathrooms: 1,
    askingPrice: 300000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    propertyService = new PropertyService();
  });

  describe('getProperties', () => {
    it('fetches properties successfully', async () => {
      const mockResponse: PaginatedResponse<any> = {
        success: true,
        data: [mockProperty],
        meta: {
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
          timestamp: '2024-01-01T00:00:00Z',
          version: '1.0.0',
        },
      };

      mockApiClient.get.mockResolvedValue({ data: mockResponse });

      const result = await propertyService.getProperties();

      expect(result).toEqual(mockResponse);
      expect(mockApiClient.get).toHaveBeenCalledWith('/properties?');
    });

    it('applies filters correctly', async () => {
      const filters: PropertyFilters = {
        status: ['draft', 'in_progress'],
        propertyType: ['detached'],
        minPrice: 100000,
        maxPrice: 600000,
        search: 'test',
        isActive: true,
      };

      const mockResponse: PaginatedResponse<any> = {
        success: true,
        data: [],
        meta: {
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          timestamp: '2024-01-01T00:00:00Z',
          version: '1.0.0',
        },
      };

      mockApiClient.get.mockResolvedValue({ data: mockResponse });

      await propertyService.getProperties(filters);

      const expectedUrl = expect.stringContaining('/properties?');
      expect(mockApiClient.get).toHaveBeenCalledWith(expectedUrl);

      // Check that the URL contains the filter parameters
      const calledUrl = mockApiClient.get.mock.calls[0][0];
      expect(calledUrl).toContain('status[]=draft');
      expect(calledUrl).toContain('status[]=in_progress');
      expect(calledUrl).toContain('propertyType[]=detached');
      expect(calledUrl).toContain('minPrice=100000');
      expect(calledUrl).toContain('maxPrice=600000');
      expect(calledUrl).toContain('search=test');
      expect(calledUrl).toContain('isActive=true');
    });

    it('applies pagination correctly', async () => {
      const pagination = { page: 2, limit: 10 };
      const mockResponse: PaginatedResponse<any> = {
        success: true,
        data: [],
        meta: {
          pagination: {
            page: 2,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          timestamp: '2024-01-01T00:00:00Z',
          version: '1.0.0',
        },
      };

      mockApiClient.get.mockResolvedValue({ data: mockResponse });

      await propertyService.getProperties({}, pagination);

      const calledUrl = mockApiClient.get.mock.calls[0][0];
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('limit=10');
    });

    it('applies sorting correctly', async () => {
      const sort = { field: 'title', direction: 'asc' as const };
      const mockResponse: PaginatedResponse<any> = {
        success: true,
        data: [],
        meta: {
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          timestamp: '2024-01-01T00:00:00Z',
          version: '1.0.0',
        },
      };

      mockApiClient.get.mockResolvedValue({ data: mockResponse });

      await propertyService.getProperties({}, undefined, sort);

      const calledUrl = mockApiClient.get.mock.calls[0][0];
      expect(calledUrl).toContain('sortBy=title');
      expect(calledUrl).toContain('sortOrder=asc');
    });

    it('throws error when API call fails', async () => {
      const mockResponse = {
        success: false,
        message: 'Failed to fetch properties',
      };

      mockApiClient.get.mockResolvedValue({ data: mockResponse });

      await expect(propertyService.getProperties()).rejects.toThrow(
        'Failed to fetch properties'
      );
    });
  });

  describe('getProperty', () => {
    it('fetches single property successfully', async () => {
      const mockResponse: ApiResponse<Property> = {
        success: true,
        data: mockProperty,
      };

      mockApiClient.get.mockResolvedValue({ data: mockResponse });

      const result = await propertyService.getProperty('1');

      expect(result).toEqual(mockProperty);
      expect(mockApiClient.get).toHaveBeenCalledWith('/properties/1');
    });

    it('throws error when property not found', async () => {
      const mockResponse = {
        success: false,
        message: 'Property not found',
      };

      mockApiClient.get.mockResolvedValue({ data: mockResponse });

      await expect(propertyService.getProperty('999')).rejects.toThrow(
        'Property not found'
      );
    });
  });

  describe('createProperty', () => {
    it('creates property successfully', async () => {
      const mockResponse: ApiResponse<Property> = {
        success: true,
        data: { ...mockProperty, ...mockCreatePropertyData },
      };

      mockApiClient.post.mockResolvedValue({ data: mockResponse });

      const result = await propertyService.createProperty(
        mockCreatePropertyData
      );

      expect(result).toEqual({ ...mockProperty, ...mockCreatePropertyData });
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/properties',
        mockCreatePropertyData
      );
    });

    it('throws error when creation fails', async () => {
      const mockResponse = {
        success: false,
        message: 'Failed to create property',
      };

      mockApiClient.post.mockResolvedValue({ data: mockResponse });

      await expect(
        propertyService.createProperty(mockCreatePropertyData)
      ).rejects.toThrow('Failed to create property');
    });
  });

  describe('updateProperty', () => {
    it('updates property successfully', async () => {
      const updateData: UpdatePropertyData = {
        title: 'Updated Property',
        status: 'in_progress',
      };

      const updatedProperty = { ...mockProperty, ...updateData };
      const mockResponse: ApiResponse<Property> = {
        success: true,
        data: updatedProperty,
      };

      mockApiClient.put.mockResolvedValue({ data: mockResponse });

      const result = await propertyService.updateProperty('1', updateData);

      expect(result).toEqual(updatedProperty);
      expect(mockApiClient.put).toHaveBeenCalledWith(
        '/properties/1',
        updateData
      );
    });

    it('throws error when update fails', async () => {
      const mockResponse = {
        success: false,
        message: 'Failed to update property',
      };

      mockApiClient.put.mockResolvedValue({ data: mockResponse });

      await expect(propertyService.updateProperty('1', {})).rejects.toThrow(
        'Failed to update property'
      );
    });
  });

  describe('deleteProperty', () => {
    it('deletes property successfully', async () => {
      const mockResponse: ApiResponse<null> = {
        success: true,
        data: null,
      };

      mockApiClient.delete.mockResolvedValue({ data: mockResponse });

      await propertyService.deleteProperty('1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/properties/1');
    });

    it('throws error when deletion fails', async () => {
      const mockResponse = {
        success: false,
        message: 'Failed to delete property',
      };

      mockApiClient.delete.mockResolvedValue({ data: mockResponse });

      await expect(propertyService.deleteProperty('1')).rejects.toThrow(
        'Failed to delete property'
      );
    });
  });

  describe('searchProperties', () => {
    it('searches properties successfully', async () => {
      const mockResponse: PaginatedResponse<any> = {
        success: true,
        data: [mockProperty],
        meta: {
          pagination: {
            page: 1,
            limit: 50,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
          timestamp: '2024-01-01T00:00:00Z',
          version: '1.0.0',
        },
      };

      mockApiClient.get.mockResolvedValue({ data: mockResponse });

      const result = await propertyService.searchProperties('test query');

      expect(result).toEqual(mockResponse);

      const calledUrl = mockApiClient.get.mock.calls[0][0];
      expect(calledUrl).toContain('/properties/search?');
      expect(calledUrl).toContain('q=test%20query');
    });

    it('includes filters in search', async () => {
      const filters: PropertyFilters = { status: ['draft'] };
      const mockResponse: PaginatedResponse<any> = {
        success: true,
        data: [],
        meta: {
          pagination: {
            page: 1,
            limit: 50,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          timestamp: '2024-01-01T00:00:00Z',
          version: '1.0.0',
        },
      };

      mockApiClient.get.mockResolvedValue({ data: mockResponse });

      await propertyService.searchProperties('test', filters);

      const calledUrl = mockApiClient.get.mock.calls[0][0];
      expect(calledUrl).toContain('status[]=draft');
    });
  });

  describe('assignAgent', () => {
    it('assigns agent successfully', async () => {
      const mockResponse: ApiResponse<Property> = {
        success: true,
        data: { ...mockProperty, assignedAgentId: 'agent-1' },
      };

      mockApiClient.put.mockResolvedValue({ data: mockResponse });

      const result = await propertyService.assignAgent('1', 'agent-1');

      expect(result).toEqual({ ...mockProperty, assignedAgentId: 'agent-1' });
      expect(mockApiClient.put).toHaveBeenCalledWith(
        '/properties/1/assign-agent',
        { agentId: 'agent-1' }
      );
    });
  });

  describe('assignSolicitor', () => {
    it('assigns solicitor successfully', async () => {
      const mockResponse: ApiResponse<Property> = {
        success: true,
        data: { ...mockProperty, assignedSolicitorId: 'solicitor-1' },
      };

      mockApiClient.put.mockResolvedValue({ data: mockResponse });

      const result = await propertyService.assignSolicitor('1', 'solicitor-1');

      expect(result).toEqual({
        ...mockProperty,
        assignedSolicitorId: 'solicitor-1',
      });
      expect(mockApiClient.put).toHaveBeenCalledWith(
        '/properties/1/assign-solicitor',
        { solicitorId: 'solicitor-1' }
      );
    });
  });

  describe('updatePropertyStatus', () => {
    it('updates status successfully', async () => {
      const mockResponse: ApiResponse<Property> = {
        success: true,
        data: { ...mockProperty, status: 'in_progress' },
      };

      mockApiClient.put.mockResolvedValue({ data: mockResponse });

      const result = await propertyService.updatePropertyStatus(
        '1',
        'in_progress',
        'Status updated'
      );

      expect(result).toEqual({ ...mockProperty, status: 'in_progress' });
      expect(mockApiClient.put).toHaveBeenCalledWith('/properties/1/status', {
        status: 'in_progress',
        comment: 'Status updated',
      });
    });
  });

  describe('archiveProperty', () => {
    it('archives property successfully', async () => {
      const mockResponse: ApiResponse<Property> = {
        success: true,
        data: { ...mockProperty, isArchived: true },
      };

      mockApiClient.put.mockResolvedValue({ data: mockResponse });

      const result = await propertyService.archiveProperty('1');

      expect(result).toEqual({ ...mockProperty, isArchived: true });
      expect(mockApiClient.put).toHaveBeenCalledWith('/properties/1/archive');
    });
  });

  describe('restoreProperty', () => {
    it('restores property successfully', async () => {
      const mockResponse: ApiResponse<Property> = {
        success: true,
        data: { ...mockProperty, isArchived: false },
      };

      mockApiClient.put.mockResolvedValue({ data: mockResponse });

      const result = await propertyService.restoreProperty('1');

      expect(result).toEqual({ ...mockProperty, isArchived: false });
      expect(mockApiClient.put).toHaveBeenCalledWith('/properties/1/restore');
    });
  });

  describe('duplicateProperty', () => {
    it('duplicates property successfully', async () => {
      const duplicatedProperty = {
        ...mockProperty,
        id: '2',
        title: 'Duplicated Property',
      };
      const mockResponse: ApiResponse<Property> = {
        success: true,
        data: duplicatedProperty,
      };

      mockApiClient.post.mockResolvedValue({ data: mockResponse });

      const result = await propertyService.duplicateProperty(
        '1',
        'Duplicated Property'
      );

      expect(result).toEqual(duplicatedProperty);
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/properties/1/duplicate',
        {
          title: 'Duplicated Property',
        }
      );
    });
  });

  describe('exportProperties', () => {
    it('exports properties successfully', async () => {
      const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });
      mockApiClient.get.mockResolvedValue({ data: mockBlob });

      const result = await propertyService.exportProperties('csv');

      expect(result).toEqual(mockBlob);

      const calledUrl = mockApiClient.get.mock.calls[0][0];
      expect(calledUrl).toContain('/properties/export?');
      expect(calledUrl).toContain('format=csv');

      const options = mockApiClient.get.mock.calls[0][1];
      expect(options.responseType).toBe('blob');
    });

    it('includes filters in export', async () => {
      const filters: PropertyFilters = { status: ['draft'] };
      const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });
      mockApiClient.get.mockResolvedValue({ data: mockBlob });

      await propertyService.exportProperties('xlsx', filters);

      const calledUrl = mockApiClient.get.mock.calls[0][0];
      expect(calledUrl).toContain('format=xlsx');
      expect(calledUrl).toContain('status[]=draft');
    });
  });

  describe('getMyProperties', () => {
    it('fetches user properties successfully', async () => {
      const mockResponse: PaginatedResponse<any> = {
        success: true,
        data: [mockProperty],
        meta: {
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
          timestamp: '2024-01-01T00:00:00Z',
          version: '1.0.0',
        },
      };

      mockApiClient.get.mockResolvedValue({ data: mockResponse });

      const result = await propertyService.getMyProperties();

      expect(result).toEqual(mockResponse);
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/properties/my-properties?'
      );
    });
  });

  describe('getRecentProperties', () => {
    it('fetches recent properties successfully', async () => {
      const mockResponse: ApiResponse<any[]> = {
        success: true,
        data: [mockProperty],
      };

      mockApiClient.get.mockResolvedValue({ data: mockResponse });

      const result = await propertyService.getRecentProperties(5);

      expect(result).toEqual([mockProperty]);
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/properties/recent?limit=5'
      );
    });
  });

  describe('Error handling', () => {
    it('handles network errors', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(propertyService.getProperties()).rejects.toThrow(
        'Network error'
      );
    });

    it('handles API response errors', async () => {
      const mockResponse = {
        success: false,
        message: 'Server error',
      };

      mockApiClient.get.mockResolvedValue({ data: mockResponse });

      await expect(propertyService.getProperties()).rejects.toThrow(
        'Server error'
      );
    });

    it('handles missing error message', async () => {
      const mockResponse = {
        success: false,
      };

      mockApiClient.get.mockResolvedValue({ data: mockResponse });

      await expect(propertyService.getProperties()).rejects.toThrow(
        'Failed to fetch properties'
      );
    });
  });

  describe('URL parameter encoding', () => {
    it('properly encodes special characters in parameters', async () => {
      const filters: PropertyFilters = {
        search: 'test & special characters',
      };

      const mockResponse: PaginatedResponse<any> = {
        success: true,
        data: [],
        meta: {
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          timestamp: '2024-01-01T00:00:00Z',
          version: '1.0.0',
        },
      };

      mockApiClient.get.mockResolvedValue({ data: mockResponse });

      await propertyService.getProperties(filters);

      const calledUrl = mockApiClient.get.mock.calls[0][0];
      expect(calledUrl).toContain('search=test%20%26%20special%20characters');
    });

    it('handles date parameters correctly', async () => {
      const filters: PropertyFilters = {
        createdAfter: new Date('2024-01-01T00:00:00Z'),
        createdBefore: new Date('2024-12-31T23:59:59Z'),
      };

      const mockResponse: PaginatedResponse<any> = {
        success: true,
        data: [],
        meta: {
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          timestamp: '2024-01-01T00:00:00Z',
          version: '1.0.0',
        },
      };

      mockApiClient.get.mockResolvedValue({ data: mockResponse });

      await propertyService.getProperties(filters);

      const calledUrl = mockApiClient.get.mock.calls[0][0];
      expect(calledUrl).toContain('createdAfter=2024-01-01T00%3A00%3A00.000Z');
      expect(calledUrl).toContain('createdBefore=2024-12-31T23%3A59%3A59.000Z');
    });
  });
});
