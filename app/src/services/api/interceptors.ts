import type {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import type { ApiError, NetworkError } from '@/types/api/error.types';
import { HTTP_STATUS } from '@/constants/api';
import {
  getStorageItem,
  removeStorageItem,
} from '@/utils/storage/localStorage';
import { LOCAL_STORAGE_KEYS } from '@/constants/storage';
import { logger } from '@/utils/logger';

/**
 * Request interceptor to add auth token
 */
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  // Add auth token if available
  const token = getStorageItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Add request ID for tracking
  config.headers.set('X-Request-ID', crypto.randomUUID());
  logger.debug('API Request', {
    method: config.method?.toUpperCase(),
    url: config.url,
    data: config.data,
  });

  return config;
};

/**
 * Request error interceptor
 */
const requestErrorInterceptor = (error: AxiosError) => {
  logger.error('API Request Error', error);
  return Promise.reject(error);
};

/**
 * Response interceptor for successful responses
 */
const responseInterceptor = (response: AxiosResponse) => {
  logger.debug('API Response', {
    status: response.status,
    url: response.config.url,
    data: response.data,
  });

  return response;
};

/**
 * Response error interceptor
 */
const responseErrorInterceptor = async (error: AxiosError) => {
  const originalRequest = error.config;

  // Handle different error types
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data as any;

    const apiError: ApiError = {
      code: data?.code || status.toString(),
      message: data?.message || 'Server error occurred',
      type: getErrorType(status),
      severity: getErrorSeverity(status),
      timestamp: new Date().toISOString(),
      statusCode: status,
      details: data?.details,
      field: data?.field,
      requestId: error.response.headers?.['x-request-id'],
    };

    // Handle authentication errors
    if (status === HTTP_STATUS.UNAUTHORIZED) {
      // Clear stored tokens
      removeStorageItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      removeStorageItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);

      // Redirect to login (in a real app, you'd use your router)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    // Handle forbidden errors
    if (status === HTTP_STATUS.FORBIDDEN) {
      logger.warn('Forbidden access attempt', { url: originalRequest?.url });
    }

    logger.error('API Response Error', apiError);
    return Promise.reject(apiError);
  } else if (error.request) {
    // Network error
    const networkError: NetworkError = {
      type: 'network_error',
      message: 'Network connection failed',
      isOffline: !navigator.onLine,
      retryable: true,
    };

    logger.error('Network Error', networkError);
    return Promise.reject(networkError);
  } else {
    // Request setup error
    logger.error('Request Setup Error', error.message);
    return Promise.reject(error);
  }
};

/**
 * Map HTTP status codes to error types
 */
const getErrorType = (status: number): ApiError['type'] => {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return 'validation';
    case HTTP_STATUS.UNAUTHORIZED:
      return 'authentication';
    case HTTP_STATUS.FORBIDDEN:
      return 'authorization';
    case HTTP_STATUS.NOT_FOUND:
      return 'not_found';
    case HTTP_STATUS.CONFLICT:
      return 'conflict';
    case HTTP_STATUS.TOO_MANY_REQUESTS:
      return 'rate_limit';
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
    case HTTP_STATUS.BAD_GATEWAY:
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return 'server_error';
    default:
      return 'unknown';
  }
};

/**
 * Map HTTP status codes to error severity
 */
const getErrorSeverity = (status: number): ApiError['severity'] => {
  if (status >= 500) return 'high';
  if (status >= 400) return 'medium';
  return 'low';
};

/**
 * Setup request and response interceptors on axios instance
 */
export const setupInterceptors = (client: AxiosInstance): void => {
  // Request interceptors
  client.interceptors.request.use(requestInterceptor, requestErrorInterceptor);

  // Response interceptors
  client.interceptors.response.use(
    responseInterceptor,
    responseErrorInterceptor
  );
};
