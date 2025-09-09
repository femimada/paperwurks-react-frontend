// src/services/auth/tokenService.ts
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
} from '@/utils/storage/localStorage';
import { LOCAL_STORAGE_KEYS } from '@/constants/storage';
import type { AuthTokens } from '@/types/auth';
import { logger } from '@/utils/logger';

/**
 * Service for managing authentication tokens
 */
export class TokenService {
  private static readonly TOKEN_KEY = LOCAL_STORAGE_KEYS.AUTH_TOKEN;
  private static readonly REFRESH_KEY = LOCAL_STORAGE_KEYS.REFRESH_TOKEN;

  /**
   * Store authentication tokens
   */
  static setTokens(tokens: AuthTokens): void {
    try {
      setStorageItem(this.TOKEN_KEY, tokens.accessToken);
      setStorageItem(this.REFRESH_KEY, tokens.refreshToken);

      logger.debug('Tokens stored successfully');
    } catch (error) {
      logger.error('Failed to store tokens', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  /**
   * Get stored access token
   */
  static getAccessToken(): string | null {
    try {
      return getStorageItem<string>(this.TOKEN_KEY);
    } catch (error) {
      logger.error('Failed to retrieve access token', error);
      return null;
    }
  }

  /**
   * Get stored refresh token
   */
  static getRefreshToken(): string | null {
    try {
      return getStorageItem<string>(this.REFRESH_KEY);
    } catch (error) {
      logger.error('Failed to retrieve refresh token', error);
      return null;
    }
  }

  /**
   * Get both tokens
   */
  static getTokens(): {
    accessToken: string | null;
    refreshToken: string | null;
  } {
    return {
      accessToken: this.getAccessToken(),
      refreshToken: this.getRefreshToken(),
    };
  }

  /**
   * Remove all stored tokens
   */
  static clearTokens(): void {
    try {
      removeStorageItem(this.TOKEN_KEY);
      removeStorageItem(this.REFRESH_KEY);

      logger.debug('Tokens cleared successfully');
    } catch (error) {
      logger.error('Failed to clear tokens', error);
    }
  }

  /**
   * Check if user has valid tokens
   */
  static hasValidTokens(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    return !!(accessToken && refreshToken);
  }

  /**
   * Check if access token is expired
   */
  static isTokenExpired(expirationDate?: string): boolean {
    if (!expirationDate) return true;

    try {
      const expDate = new Date(expirationDate);
      const now = new Date();

      if (isNaN(expDate.getTime())) {
        return true;
      }

      // Add 5-minute buffer before actual expiration
      const bufferTime = 5 * 60 * 1000;
      return expDate.getTime() - bufferTime <= now.getTime();
    } catch (error) {
      logger.error('Failed to check token expiration', error);
      return true;
    }
  }

  /**
   * Get token expiration time in milliseconds
   */
  static getTokenExpirationTime(expirationDate?: string): number | null {
    if (!expirationDate) return null;

    try {
      return new Date(expirationDate).getTime();
    } catch (error) {
      logger.error('Failed to parse token expiration date', error);
      return null;
    }
  }
}
