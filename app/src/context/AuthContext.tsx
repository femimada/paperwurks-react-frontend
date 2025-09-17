// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

import { TokenService } from '@/domains/auth/services/tokenService';
import { logger } from '@/shared/utils/logger';
import type { User, AuthResponse, RegisterRequest } from '@/domains/auth/types';
import type { LoginFormData as LoginRequest } from '@/domains/auth/components';
import type { Permission } from '@/shared/types/global.types';
import { authService } from '@/domains/auth';

// Enhanced types for better safety
type AuthErrorPayload = { message: string; code?: string };
type AuthSuccessPayload = AuthResponse;
type UpdateUserPayload = User;

interface AuthState {
  permissions: Permission[];
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: AuthSuccessPayload }
  | { type: 'AUTH_ERROR'; payload: AuthErrorPayload }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: UpdateUserPayload };

export interface AuthContextType {
  permissions: Permission[];
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  register: (data: RegisterRequest) => Promise<void>;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: {
    token: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  clearError: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        permissions: action.payload.user?.permissions ?? [],
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload.message,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        permissions: [],
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
        permissions: action.payload.permissions ?? [],
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    permissions: [],
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  const login = useCallback(async (credentials: LoginRequest) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const authResponse = await authService.login(credentials);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: authResponse,
      });
      logger.debug('Login successful');
    } catch (error: any) {
      const errorPayload: AuthErrorPayload = {
        message: error.message || 'Login failed',
      };
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorPayload,
      });
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const authResponse = await authService.register(data);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: authResponse,
      });
      logger.debug('Registration successful');
    } catch (error: any) {
      const errorPayload: AuthErrorPayload = {
        message: error.message || 'Registration failed',
      };
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorPayload,
      });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      await authService.logout();
      dispatch({ type: 'AUTH_LOGOUT' });
      logger.debug('Logout successful');
    } catch (error: any) {
      dispatch({ type: 'AUTH_LOGOUT' });
      logger.error('Server logout failed, logging out client-side', error);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const authResponse = await authService.refreshToken(); // Now standardized to return AuthResponse
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: authResponse,
      });
      logger.debug('Token refresh successful');
    } catch (error: any) {
      dispatch({ type: 'AUTH_LOGOUT' });
      throw error;
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      await authService.forgotPassword(email);
      logger.debug('Password reset email sent');
    } catch (error: any) {
      const errorPayload: AuthErrorPayload = {
        message: error.message || 'Failed to send password reset email',
      };
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorPayload,
      });
      throw error;
    }
  }, []);

  const resetPassword = useCallback(
    async (data: {
      token: string;
      password: string;
      confirmPassword: string;
    }) => {
      dispatch({ type: 'AUTH_LOADING' });
      try {
        await authService.resetPassword(data);
        dispatch({ type: 'AUTH_LOGOUT' });
        logger.debug('Password reset successful');
      } catch (error: any) {
        const errorPayload: AuthErrorPayload = {
          message: error.message || 'Password reset failed',
        };
        dispatch({
          type: 'AUTH_ERROR',
          payload: errorPayload,
        });
        throw error;
      }
    },
    []
  );

  const changePassword = useCallback(
    async (data: { currentPassword: string; newPassword: string }) => {
      dispatch({ type: 'AUTH_LOADING' });
      try {
        await authService.changePassword(data);
        dispatch({ type: 'AUTH_LOGOUT' });
        logger.debug('Password change successful, user logged out.');
      } catch (error: any) {
        const errorPayload: AuthErrorPayload = {
          message: error.message || 'Password change failed',
        };
        dispatch({
          type: 'AUTH_ERROR',
          payload: errorPayload,
        });
        throw error;
      }
    },
    []
  );

  const updateProfile = useCallback(async (data: Partial<User>) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const updatedUser = await authService.updateProfile(data);
      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUser,
      });
      logger.debug('Profile update successful');
      return updatedUser;
    } catch (error: any) {
      const errorPayload: AuthErrorPayload = {
        message: error.message || 'Profile update failed',
      };
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorPayload,
      });
      throw error;
    }
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const updatedUser = await authService.verifyEmail(token);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      logger.debug('Email verification successful');
    } catch (error: any) {
      const errorPayload: AuthErrorPayload = {
        message: error.message || 'Email verification failed',
      };
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorPayload,
      });
      throw error;
    }
  }, []);

  const resendVerification = useCallback(async () => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      await authService.resendVerification();
      logger.debug('Verification email resent successfully');
    } catch (error: any) {
      const errorPayload: AuthErrorPayload = {
        message: error.message || 'Failed to resend verification email',
      };
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorPayload,
      });
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
    logger.debug('Error cleared');
  }, []);

  // Listen for logout event from interceptors
  useEffect(() => {
    const handleAuthLogout = () => {
      dispatch({ type: 'AUTH_LOGOUT' });
    };
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      if (
        TokenService.hasValidTokens() &&
        !TokenService.isTokenExpired(TokenService.getAccessToken())
      ) {
        try {
          const user = await authService.getCurrentUser();
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, tokens: TokenService.getTokens()! },
          });
        } catch (error) {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      }
    };
    initializeAuth();
  }, []);

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return state.permissions.includes(permission);
    },
    [state.permissions]
  );

  const hasAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      return permissions.some((p) => state.permissions.includes(p));
    },
    [state.permissions]
  );

  const hasRole = useCallback(
    (role: string): boolean => {
      return state.user?.role === role;
    },
    [state.user]
  );

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        login,
        register,
        logout,
        refreshToken,
        forgotPassword,
        resetPassword,
        changePassword,
        updateProfile,
        verifyEmail,
        resendVerification,
        clearError,
        hasPermission,
        hasAnyPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
