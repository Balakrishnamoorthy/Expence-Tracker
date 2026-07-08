import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-192.png', 'logo-512.png', 'favicon.ico'],
      manifest: {
        name: 'Expense Tracker',
        short_name: 'EXPTRA',
        description: 'Collabrative expense tracking app for friends and family.',
        theme_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: '/logo-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/logo-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }
        ]
      }
    })],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,      // don't expose source in prod
    chunkSizeWarningLimit: 600,
    minify: 'esbuild',      // use esbuild for minification
  },
});
