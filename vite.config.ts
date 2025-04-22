import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // для внешнего доступа (ngrok)
    allowedHosts: true, // ✅ разрешить любые домены
    proxy: {
      '/claude': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
});
