// src/__tests__/setup/setup.ts - Fixed version
import '@testing-library/jest-dom';
import { afterAll, beforeAll, vi, beforeEach } from 'vitest';

// Global test setup - runs before all tests

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock hasPointerCapture - fixes Radix UI issues
Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();

// Mock environment variables
vi.mock('@/shared/utils/env', () => ({
  getEnvVar: vi.fn((key: string, defaultValue?: string) => {
    const envVars: Record<string, string> = {
      VITE_API_BASE_URL: 'http://localhost:3000/api',
      VITE_APP_ENV: 'test',
    };
    return envVars[key] || defaultValue || '';
  }),
}));

// Console spy to suppress expected errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
        args[0].includes('target.hasPointerCapture is not a function'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Clear all mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
