// src/services/auth/tokenService.ts
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
} from '@/shared/utils/storage/localStorage';
import type { AuthTokens } from '@/domains/auth/types';

export class TokenService {
  private static ACCESS_TOKEN_KEY = 'accessToken';
  private static REFRESH_TOKEN_KEY = 'refreshToken';

  static setTokens(tokens: AuthTokens): void {
    setStorageItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    document.cookie = `refreshToken=${tokens.refreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/`;
  }

  static getTokens(): AuthTokens {
    const accessToken = getStorageItem(this.ACCESS_TOKEN_KEY) as string | null;
    const refreshToken = this.getRefreshToken() ?? '';
    return {
      accessToken: accessToken ?? '',
      refreshToken,
      tokenType: 'Bearer',
      expiresAt: '',
    };
  }

  static getAccessToken(): string | null {
    return getStorageItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    const cookies = document.cookie.split('; ').reduce(
      (acc, cookie) => {
        const [name, value] = cookie.split('=');
        acc[name] = value;
        return acc;
      },
      {} as Record<string, string>
    );
    return cookies[this.REFRESH_TOKEN_KEY] ?? null;
  }

  static clearTokens(): void {
    removeStorageItem(this.ACCESS_TOKEN_KEY);
    document.cookie =
      'refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/';
  }

  static hasValidTokens(): boolean {
    const { accessToken, refreshToken } = this.getTokens();
    return !!accessToken && !!refreshToken;
  }

  static getTokenPayload(token: string | null): { exp?: number } | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  }

  static isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    const payload = this.getTokenPayload(token);
    if (!payload || !payload.exp) return true;
    return payload.exp * 1000 < Date.now();
  }

  static getTokenExpirationTime(token: string | null): number | null {
    if (!token) return null;
    const payload = this.getTokenPayload(token);
    return payload && payload.exp ? payload.exp * 1000 : null;
  }
}
