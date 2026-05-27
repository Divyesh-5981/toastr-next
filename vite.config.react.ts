import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';

/**
 * Reads the already-built CSS from disk and injects it into every JS chunk
 * so the React bundle is self-contained and doesn't rely on the consumer
 * importing toastr-next core first.
 */
function injectCss(): Plugin {
  return {
    name: 'inject-css',
    apply: 'build',
    generateBundle(_, bundle) {
      let cssContent = '';

      // Try to read the CSS built by the main vite build
      try {
        cssContent = readFileSync(
          resolve(__dirname, 'dist/toastr-next.css'),
          'utf-8'
        );
      } catch {
        // CSS not found — skip injection
        return;
      }

      if (!cssContent) return;

      const injector = `
(function(){
  if (typeof document === 'undefined') return;
  var id = '__toastr_next_css__';
  if (document.getElementById(id)) return;
  var s = document.createElement('style');
  s.id = id;
  s.textContent = ${JSON.stringify(cssContent)};
  document.head.appendChild(s);
})();
`.trim();

      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk') {
          chunk.code = injector + '\n' + chunk.code;
        }
      }
    },
  };
}

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
  plugins: [injectCss()],
});
