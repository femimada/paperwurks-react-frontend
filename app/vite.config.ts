import { defineConfig } from 'vite';
import path, { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

//https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/domains': path.resolve(__dirname, './src/domains'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/tests': path.resolve(__dirname, './src/__tests__'),
    },
  },
});
