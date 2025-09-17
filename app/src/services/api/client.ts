import axios, { type AxiosInstance } from 'axios';
import { API_CONFIG } from '@/shared/constants/api';
import { setupInterceptors } from './interceptors';

/**
 * Create and configure axios instance
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Setup request and response interceptors
  setupInterceptors(client);

  return client;
};

/**
 * Main API client instance
 */
export const apiClient = createApiClient();

/**
 * Create a new API client instance (for testing or special cases)
 */
export const createClient = createApiClient;
