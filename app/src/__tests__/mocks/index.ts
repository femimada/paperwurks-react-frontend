// src/mocks/index.ts
export { worker } from './browser';
export { server } from './server';
export { handlers } from './handlers';

// Enable API mocking ONLY in browser development environment
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  const { worker } = await import('./browser');

  worker
    .start({
      onUnhandledRequest: 'warn',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    })
    .then(() => {
      console.log('🔧 MSW: Mock API is running');
    })
    .catch((error) => {
      console.error('🔧 MSW: Failed to start mock API:', error);
    });
}
