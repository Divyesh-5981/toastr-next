import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
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
});
