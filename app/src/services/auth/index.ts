// src/services/auth/index.ts
import { AuthService } from './authService';
export { AuthService } from './authService';
export { TokenService } from './tokenService';
// Create singleton instance
export const authService = new AuthService();
