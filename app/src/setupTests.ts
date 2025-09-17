// src/setupTests.ts
import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';

//
let server: any;

async function initializeMSW() {
  try {
    const { server: mockServer } = await import('./__tests__/mocks/server');
    server = mockServer;
    console.log('MSW server loaded successfully');
    return true;
  } catch (error) {
    console.warn(
      '⚠️ MSW server not available, tests will run without API mocking'
    );
    server = null;
    return false;
  }
}

beforeAll(async () => {
  await initializeMSW();

  if (server) {
    server.listen({
      onUnhandledRequest: 'warn', // Less strict than 'error'
    });
  }
});

afterEach(() => {
  if (server) {
    server.resetHandlers();
  }
});

afterAll(() => {
  if (server) {
    server.close();
  }
});

export { server };
