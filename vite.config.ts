import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Toastr',
      formats: ['es', 'cjs', 'umd', 'iife'],
      fileName: (format) => `toastr-next.${format}.js`,
    },
    rollupOptions: {
      output: {
        assetFileNames: 'toastr-next.[ext]',
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
});
