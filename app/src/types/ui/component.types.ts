// Component prop types and UI-related interfaces

import type {
  ReactNode,
  HTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
} from 'react';

/**
 * Base component props that all components can extend
 */
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  testId?: string;
}

/**
 * Component size variants
 */
export type ComponentSize = 'sm' | 'base' | 'lg' | 'xl';

/**
 * Component variants for styling
 */
export type ComponentVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';

/**
 * Loading states
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Button component props
 */
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    BaseComponentProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

/**
 * Input component props
 */
export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    BaseComponentProps {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  ref?: React.Ref<HTMLInputElement>;
  rightIcon?: React.ReactNode;
}

/**
 * Card component props
 */
export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    BaseComponentProps {
  header?: ReactNode;
  footer?: ReactNode;
  padding?: ComponentSize;
  shadow?: boolean;
}

/**
 * Modal component props
 */
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ComponentSize;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
}

/**
 * Badge component props
 */
export interface BadgeProps extends BaseComponentProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: ComponentSize;
  dot?: boolean;
}

/**
 * Avatar component props
 */
export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: ComponentSize;
  onError?: () => void;
}

/**
 * Progress bar props
 */
export interface ProgressBarProps extends BaseComponentProps {
  value: number;
  max?: number;
  size?: ComponentSize;
  showLabel?: boolean;
  label?: string;
}

/**
 * Spinner component props
 */
export interface SpinnerProps extends BaseComponentProps {
  size?: ComponentSize;
  color?: string;
}

/**
 * Toast notification props
 */
export interface ToastProps extends BaseComponentProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

/**
 * Navigation item interface
 */
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: number;
  active?: boolean;
  disabled?: boolean;
}

/**
 * Breadcrumb item interface
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

/**
 * Table column definition
 */
export interface TableColumn<T = any> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => ReactNode;
}

/**
 * Form field validation state
 */
export interface ValidationState {
  isValid: boolean;
  error?: string;
  touched: boolean;
}

/**
 * Generic option type for selects and similar components
 */
export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

/**
 * Theme context interface
 */
export interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
