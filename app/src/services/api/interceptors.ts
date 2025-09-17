//src/services/api/interceptors.ts

import type {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import type { ApiError, NetworkError } from '@/shared/types/api/error.types';
import { HTTP_STATUS } from '@/shared/constants/api';
import { logger } from '@/shared/utils/logger';

import { apiClient } from './client';
import { authService, TokenService } from '@/domains/auth';

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (value: { token: string }) => void;
  reject: (reason?: any) => void;
}> = [];

// Sanitize sensitive data for logging
const sanitizeData = (data: any, url?: string): any => {
  if (!data || typeof data !== 'object') return data;
  if (url?.includes('/auth')) {
    return '[REDACTED]';
  }
  const sanitized = { ...data };
  if (sanitized.email)
    sanitized.email = sanitized.email.replace(/@.*/, '@[redacted]');
  if (sanitized.password) sanitized.password = '[REDACTED]';
  return sanitized;
};

const processQueue = (
  error: Error | null,
  tokenObj: { token: string } | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(tokenObj!);
    }
  });
  failedQueue = [];
};

/**
 * Request interceptor to add auth token and CSRF (placeholder - implement fetch if needed)
 */
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = TokenService.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // CSRF placeholder - fetch from /csrf on app init if required
  // if (config.headers && !config.url?.includes('/login')) {
  //   config.headers['X-CSRF-Token'] = getCsrfToken();
  // }
  config.headers.set('X-Request-ID', crypto.randomUUID());

  // Sanitized logging
  logger.debug('API Request', {
    method: config.method?.toUpperCase(),
    url: config.url,
    data: sanitizeData(config.data, config.url),
  });
  return config;
};

/**
 * Request error interceptor
 */
const requestErrorInterceptor = (error: AxiosError) => {
  logger.error('API Request Error', error.message);
  return Promise.reject(error);
};

/**
 * Response interceptor for successful responses
 */
const responseInterceptor = (response: AxiosResponse) => {
  const { headers, ...logData } = response;
  logger.debug('API Response', {
    status: logData.status,
    url: logData.config.url,
    data: logData.data,
  });
  return response;
};

/**
 * Response error interceptor
 */
const responseErrorInterceptor = async (error: AxiosError) => {
  const originalRequest = error.config as InternalAxiosRequestConfig & {
    _retry?: boolean;
  };

  // Handle different error types
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    if (status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<{ token: string }>(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((tokenObj) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization =
                'Bearer ' + tokenObj.token;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const authResponse = await authService.refreshToken();
        const tokenObj = { token: authResponse.tokens.accessToken };
        processQueue(null, tokenObj);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokenObj.token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        TokenService.clearTokens();
        // Trigger client-side logout
        window.dispatchEvent(new CustomEvent('auth:logout'));
        if (typeof window !== 'undefined') {
          // Redirect to login after refresh fails
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
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
