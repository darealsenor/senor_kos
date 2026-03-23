import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: './',
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-toast'],
          'map-vendor': ['leaflet', 'react-leaflet'],
          'utils-vendor': ['jotai'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
