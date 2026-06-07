import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy /evaluation-service to the remote test server to avoid CORS in dev
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/evaluation-service': {
        target: 'http://4.224.186.213',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
