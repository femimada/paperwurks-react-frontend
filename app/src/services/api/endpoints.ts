import { API_ENDPOINTS } from '@/shared/constants/api';
import type { ApiEndpoint } from '@/shared/types/api/common.types';

/**
 * API endpoint configurations with metadata
 */
export const endpoints: Record<string, ApiEndpoint> = {
  // Authentication endpoints
  LOGIN: {
    method: 'POST',
    path: API_ENDPOINTS.AUTH.LOGIN,
    auth: false,
  },
  REGISTER: {
    method: 'POST',
    path: API_ENDPOINTS.AUTH.REGISTER,
    auth: false,
  },
  LOGOUT: {
    method: 'POST',
    path: API_ENDPOINTS.AUTH.LOGOUT,
    auth: true,
  },
  REFRESH_TOKEN: {
    method: 'POST',
    path: API_ENDPOINTS.AUTH.REFRESH,
    auth: true,
  },

  // User endpoints
  GET_PROFILE: {
    method: 'GET',
    path: API_ENDPOINTS.USERS.PROFILE,
    auth: true,
  },
  UPDATE_PROFILE: {
    method: 'PUT',
    path: API_ENDPOINTS.USERS.UPDATE_PROFILE,
    auth: true,
  },
  CHANGE_PASSWORD: {
    method: 'PUT',
    path: API_ENDPOINTS.USERS.CHANGE_PASSWORD,
    auth: true,
  },

  // Property endpoints
  GET_PROPERTIES: {
    method: 'GET',
    path: API_ENDPOINTS.PROPERTIES.LIST,
    auth: true,
  },
  CREATE_PROPERTY: {
    method: 'POST',
    path: API_ENDPOINTS.PROPERTIES.CREATE,
    auth: true,
  },

  // Notification endpoints
  GET_NOTIFICATIONS: {
    method: 'GET',
    path: API_ENDPOINTS.NOTIFICATIONS.LIST,
    auth: true,
  },
  MARK_NOTIFICATION_READ: {
    method: 'PUT',
    path: '', // Will be built dynamically with ID
    auth: true,
  },
};

/**
 * Build endpoint URL with parameters
 */
export const buildEndpoint = (
  template: string,
  params: Record<string, string>
): string => {
  let url = template;

  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, encodeURIComponent(value));
  });

  return url;
};

/**
 * Get endpoint configuration
 */
export const getEndpoint = (key: string): ApiEndpoint | undefined => {
  return endpoints[key];
};
