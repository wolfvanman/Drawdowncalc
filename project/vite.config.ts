import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: 'pension-calculator.[hash].js',
        chunkFileNames: 'pension-calculator-chunk.[hash].js',
        assetFileNames: 'pension-calculator-asset.[hash][extname]'
      }
    }
  },
  base: './'
});