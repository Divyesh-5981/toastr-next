import { defineConfig } from 'vite';

// Demo site build — serves index.html as a static site
export default defineConfig({
  build: {
    outDir: 'dist-demo',
    emptyOutDir: true,
  },
});
