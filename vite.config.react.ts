import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { injectCssFromFile } from './vite-plugin-inject-css';

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));

export default defineConfig({
  define: {
    __PKG_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/react/index.ts'),
      name: 'ToastrReact',
      formats: ['es', 'cjs'],
      fileName: (format) => `toastr-next.react.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'toastr-next'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'toastr-next': 'Toastr',
        },
        assetFileNames: 'toastr-next.[ext]',
        dir: 'dist',
      },
    },
    sourcemap: true,
    minify: 'esbuild',
    emptyOutDir: false,
  },
  plugins: [injectCssFromFile(resolve(__dirname, 'dist/toastr-next.css'))],
});
