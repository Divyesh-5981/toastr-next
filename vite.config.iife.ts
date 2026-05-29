import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { injectBundledCss } from './vite-plugin-inject-css';

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));

/**
 * Dedicated IIFE build. Uses src/iife.ts (default-only export) so the
 * global `window.toastr` resolves to the toastr object directly, matching
 * the CDN usage documented in README.
 */
export default defineConfig({
  define: {
    __PKG_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/iife.ts'),
      name: 'toastr',
      formats: ['iife'],
      fileName: () => 'toastr-next.iife.js',
    },
    rollupOptions: {
      output: {
        exports: 'default',
        assetFileNames: 'toastr-next.[ext]',
      },
    },
    emptyOutDir: false,
    sourcemap: true,
    minify: 'esbuild',
  },
  plugins: [injectBundledCss()],
});
