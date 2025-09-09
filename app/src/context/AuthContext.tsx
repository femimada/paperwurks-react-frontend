// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import { authService, TokenService } from '@/services/auth';
import { logger } from '@/utils/logger';
import type {
  AuthState,
  AuthActions,
  UseAuthReturn,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  ProfileUpdateFormData,
  User,
  AuthTokens,
} from '@/types/auth';
import type { UserRole, Permission } from '@/types/global.types';

// Auth Context
interface AuthContextValue extends AuthState, AuthActions {
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  isRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Auth Actions
type AuthAction =
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        permissions: action.payload.user.permissions,
      };

    case 'AUTH_ERROR':
      return {
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        permissions: [],
      };

    case 'AUTH_LOGOUT':
      return {
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        permissions: [],
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
        permissions: action.payload.permissions,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  permissions: [],
};

// Auth Provider Props
interface AuthProviderProps {
  children: React.ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing tokens on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const { accessToken, refreshToken } = TokenService.getTokens();

      if (accessToken && refreshToken) {
        dispatch({ type: 'AUTH_LOADING' });

        try {
          // Try to get current user with existing token
          const user = await authService.getCurrentUser();

          const tokens: AuthTokens = {
            accessToken,
            refreshToken,
            expiresAt: '', // We don't store expiry locally, server handles it
            tokenType: 'Bearer',
          };

          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, tokens },
          });

          logger.info('Authentication restored from stored tokens');
        } catch (error) {
          // Token might be expired, try to refresh
          try {
            const refreshResponse =
              await authService.refreshToken(refreshToken);
            TokenService.setTokens(refreshResponse.tokens);

            dispatch({
              type: 'AUTH_SUCCESS',
              payload: refreshResponse,
            });

            logger.info('Authentication refreshed successfully');
          } catch (refreshError) {
            // Refresh failed, clear tokens and show login
            TokenService.clearTokens();
            dispatch({ type: 'AUTH_LOGOUT' });
            logger.warn('Token refresh failed, user needs to login again');
          }
        }
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      dispatch({ type: 'AUTH_LOADING' });

      try {
        const authResponse = await authService.login(credentials);

        // Store tokens
        TokenService.setTokens(authResponse.tokens);

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: authResponse,
        });

        logger.info('User logged in successfully', {
          userId: authResponse.user.id,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Login failed';
        dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
        logger.error('Login failed', error);
        throw error;
      }
    },
    []
  );

  // Register function
  const register = useCallback(
    async (userData: RegisterRequest): Promise<void> => {
      dispatch({ type: 'AUTH_LOADING' });

      try {
        const authResponse = await authService.register(userData);

        // Store tokens
        TokenService.setTokens(authResponse.tokens);

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: authResponse,
        });

        logger.info('User registered successfully', {
          userId: authResponse.user.id,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Registration failed';
        dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
        logger.error('Registration failed', error);
        throw error;
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      logger.warn('Logout API call failed, clearing local state anyway', error);
    }

    // Always clear local state regardless of API call success
    TokenService.clearTokens();
    dispatch({ type: 'AUTH_LOGOUT' });

    logger.info('User logged out');
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<void> => {
    const { refreshToken: currentRefreshToken } = TokenService.getTokens();

    if (!currentRefreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const authResponse = await authService.refreshToken(currentRefreshToken);

      TokenService.setTokens(authResponse.tokens);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: authResponse,
      });

      logger.debug('Token refreshed successfully');
    } catch (error) {
      TokenService.clearTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
      logger.error('Token refresh failed', error);
      throw error;
    }
  }, []);

  // Forgot password function
  const forgotPassword = useCallback(async (email: string): Promise<void> => {
    try {
      await authService.forgotPassword(email);
      logger.info('Password reset email sent', { email });
    } catch (error) {
      logger.error('Forgot password failed', error);
      throw error;
    }
  }, []);

  // Reset password function
  const resetPassword = useCallback(
    async (data: ResetPasswordRequest): Promise<void> => {
      try {
        await authService.resetPassword(data);
        logger.info('Password reset successful');
      } catch (error) {
        logger.error('Password reset failed', error);
        throw error;
      }
    },
    []
  );

  // Change password function
  const changePassword = useCallback(
    async (data: ChangePasswordRequest): Promise<void> => {
      try {
        await authService.changePassword(data);
        logger.info('Password changed successfully');
      } catch (error) {
        logger.error('Password change failed', error);
        throw error;
      }
    },
    []
  );

  // Update profile function
  const updateProfile = useCallback(
    async (profileData: Partial<ProfileUpdateFormData>): Promise<void> => {
      if (!state.user) {
        throw new Error('No authenticated user');
      }

      try {
        const updatedUser = await authService.updateProfile(profileData);

        dispatch({
          type: 'UPDATE_USER',
          payload: updatedUser,
        });

        logger.info('Profile updated successfully');
      } catch (error) {
        logger.error('Profile update failed', error);
        throw error;
      }
    },
    [state.user]
  );

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Permission checking functions
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return state.permissions.includes(permission);
    },
    [state.permissions]
  );

  const hasRole = useCallback(
    (role: UserRole): boolean => {
      return state.user?.role === role;
    },
    [state.user?.role]
  );

  const hasAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      return permissions.some((permission) =>
        state.permissions.includes(permission)
      );
    },
    [state.permissions]
  );

  const isRole = useCallback(
    (roles: UserRole[]): boolean => {
      return state.user ? roles.includes(state.user.role) : false;
    },
    [state.user?.role]
  );

  // Context value
  const contextValue: AuthContextValue = {
    // State
    ...state,

    // Actions
    login,
    register,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    clearError,

    // Permission helpers
    hasPermission,
    hasRole,
    hasAnyPermission,
    isRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
