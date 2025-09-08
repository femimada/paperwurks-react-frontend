// Local storage helper utilities

import { logger } from '@/utils/logger';

/**
 * Safely get item from localStorage with error handling
 */
export const getStorageItem = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return null;

    return JSON.parse(item);
  } catch (error) {
    logger.warn(`Failed to get localStorage item: ${key}`, error);
    return null;
  }
};

/**
 * Safely set item in localStorage with error handling
 */
export const setStorageItem = <T>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.warn(`Failed to set localStorage item: ${key}`, error);
    return false;
  }
};

/**
 * Remove item from localStorage
 */
export const removeStorageItem = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    logger.warn(`Failed to remove localStorage item: ${key}`, error);
    return false;
  }
};

/**
 * Clear all localStorage items with optional prefix filter
 */
export const clearStorage = (prefix?: string): boolean => {
  try {
    if (prefix) {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
    } else {
      localStorage.clear();
    }
    return true;
  } catch (error) {
    logger.warn('Failed to clear localStorage', error);
    return false;
  }
};

/**
 * Check if localStorage is available
 */
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get storage item with expiration check
 */
export const getStorageItemWithExpiry = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const parsed = JSON.parse(item);

    // Check if item has expiry
    if (parsed.expiry && Date.now() > parsed.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.value || parsed;
  } catch (error) {
    logger.warn(`Failed to get localStorage item with expiry: ${key}`, error);
    return null;
  }
};

/**
 * Set storage item with expiration time
 */
export const setStorageItemWithExpiry = <T>(
  key: string,
  value: T,
  expiryMs: number
): boolean => {
  try {
    const item = {
      value,
      expiry: Date.now() + expiryMs,
    };

    localStorage.setItem(key, JSON.stringify(item));
    return true;
  } catch (error) {
    logger.warn(`Failed to set localStorage item with expiry: ${key}`, error);
    return false;
  }
};
