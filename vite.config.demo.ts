import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));

export default defineConfig({
  define: {
    __PKG_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    outDir: 'dist-demo',
    emptyOutDir: true,
  },
});
