// src/services/properties/propertyService.ts
import { apiClient } from '@/services/api';
import { API_ENDPOINTS } from '@/constants/api';
import type { ApiResponse, PaginatedResponse } from '@/types/api/common.types';
import type {
  Property,
  CreatePropertyData,
  UpdatePropertyData,
  PropertyFilters,
  PropertyListItem,
  PropertyStats,
  PropertyActivity,
  PropertySearchResult,
} from '@/types/property';
import type { PaginationParams, SortParams } from '@/types/global.types';

/**
 * Property service for handling property-related API calls
 */
export class PropertyService {
  /**
   * Get paginated list of properties
   */
  async getProperties(
    filters?: PropertyFilters,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<PaginatedResponse<PropertyListItem>> {
    const params = new URLSearchParams();

    // Add filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(`${key}[]`, v.toString()));
          } else if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    // Add pagination
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
    }

    // Add sorting
    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortOrder', sort.direction);
    }

    const response = await apiClient.get<PaginatedResponse<PropertyListItem>>(
      `${API_ENDPOINTS.PROPERTIES.LIST}?${params.toString()}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch properties');
    }

    return response.data;
  }

  /**
   * Get property by ID
   */
  async getProperty(id: string): Promise<Property> {
    const response = await apiClient.get<ApiResponse<Property>>(
      API_ENDPOINTS.PROPERTIES.DETAIL(id)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch property');
    }

    return response.data.data;
  }

  /**
   * Create new property
   */
  async createProperty(data: CreatePropertyData): Promise<Property> {
    const response = await apiClient.post<ApiResponse<Property>>(
      API_ENDPOINTS.PROPERTIES.CREATE,
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create property');
    }

    return response.data.data;
  }

  /**
   * Update existing property
   */
  async updateProperty(
    id: string,
    data: UpdatePropertyData
  ): Promise<Property> {
    const response = await apiClient.put<ApiResponse<Property>>(
      API_ENDPOINTS.PROPERTIES.UPDATE(id),
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update property');
    }

    return response.data.data;
  }

  /**
   * Delete property
   */
  async deleteProperty(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.PROPERTIES.DELETE(id)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete property');
    }
  }

  /**
   * Search properties
   */
  async searchProperties(
    query: string,
    filters?: PropertyFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<PropertySearchResult>> {
    const params = new URLSearchParams();
    params.append('q', query);

    // Add filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(`${key}[]`, v.toString()));
          } else if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    // Add pagination
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
    }

    const response = await apiClient.get<
      PaginatedResponse<PropertySearchResult>
    >(`${API_ENDPOINTS.PROPERTIES.LIST}/search?${params.toString()}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to search properties');
    }

    return response.data;
  }

  /**
   * Get property activity timeline
   */
  async getPropertyActivity(
    id: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<PropertyActivity>> {
    const params = new URLSearchParams();

    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
    }

    const response = await apiClient.get<PaginatedResponse<PropertyActivity>>(
      `${API_ENDPOINTS.PROPERTIES.TIMELINE(id)}?${params.toString()}`
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || 'Failed to fetch property activity'
      );
    }

    return response.data;
  }

  /**
   * Get property statistics
   */
  async getPropertyStats(filters?: PropertyFilters): Promise<PropertyStats> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(`${key}[]`, v.toString()));
          } else if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await apiClient.get<ApiResponse<PropertyStats>>(
      `${API_ENDPOINTS.PROPERTIES.LIST}/stats?${params.toString()}`
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || 'Failed to fetch property statistics'
      );
    }

    return response.data.data;
  }

  /**
   * Assign agent to property
   */
  async assignAgent(propertyId: string, agentId: string): Promise<Property> {
    const response = await apiClient.put<ApiResponse<Property>>(
      `${API_ENDPOINTS.PROPERTIES.DETAIL(propertyId)}/assign-agent`,
      { agentId }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to assign agent');
    }

    return response.data.data;
  }

  /**
   * Assign solicitor to property
   */
  async assignSolicitor(
    propertyId: string,
    solicitorId: string
  ): Promise<Property> {
    const response = await apiClient.put<ApiResponse<Property>>(
      `${API_ENDPOINTS.PROPERTIES.DETAIL(propertyId)}/assign-solicitor`,
      { solicitorId }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to assign solicitor');
    }

    return response.data.data;
  }

  /**
   * Update property status
   */
  async updatePropertyStatus(
    propertyId: string,
    status: string,
    comment?: string
  ): Promise<Property> {
    const response = await apiClient.put<ApiResponse<Property>>(
      `${API_ENDPOINTS.PROPERTIES.DETAIL(propertyId)}/status`,
      { status, comment }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || 'Failed to update property status'
      );
    }

    return response.data.data;
  }

  /**
   * Archive property
   */
  async archiveProperty(propertyId: string): Promise<Property> {
    const response = await apiClient.put<ApiResponse<Property>>(
      `${API_ENDPOINTS.PROPERTIES.DETAIL(propertyId)}/archive`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to archive property');
    }

    return response.data.data;
  }

  /**
   * Restore archived property
   */
  async restoreProperty(propertyId: string): Promise<Property> {
    const response = await apiClient.put<ApiResponse<Property>>(
      `${API_ENDPOINTS.PROPERTIES.DETAIL(propertyId)}/restore`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to restore property');
    }

    return response.data.data;
  }

  /**
   * Duplicate property
   */
  async duplicateProperty(
    propertyId: string,
    title: string
  ): Promise<Property> {
    const response = await apiClient.post<ApiResponse<Property>>(
      `${API_ENDPOINTS.PROPERTIES.DETAIL(propertyId)}/duplicate`,
      { title }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to duplicate property');
    }

    return response.data.data;
  }

  /**
   * Export properties
   */
  async exportProperties(
    format: 'csv' | 'xlsx' | 'json',
    filters?: PropertyFilters
  ): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(`${key}[]`, v.toString()));
          } else if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await apiClient.get(
      `${API_ENDPOINTS.PROPERTIES.LIST}/export?${params.toString()}`,
      {
        responseType: 'blob',
      }
    );

    return response.data;
  }

  /**
   * Get properties for current user
   */
  async getMyProperties(
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<PaginatedResponse<PropertyListItem>> {
    const params = new URLSearchParams();

    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
    }

    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortOrder', sort.direction);
    }

    const response = await apiClient.get<PaginatedResponse<PropertyListItem>>(
      `${API_ENDPOINTS.PROPERTIES.LIST}/my-properties?${params.toString()}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch my properties');
    }

    return response.data;
  }

  /**
   * Get recent properties
   */
  async getRecentProperties(limit: number = 5): Promise<PropertyListItem[]> {
    const response = await apiClient.get<ApiResponse<PropertyListItem[]>>(
      `${API_ENDPOINTS.PROPERTIES.LIST}/recent?limit=${limit}`
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || 'Failed to fetch recent properties'
      );
    }

    return response.data.data;
  }
}

// Create and export singleton instance
export const propertyService = new PropertyService();
