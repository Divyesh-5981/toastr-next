import { defineConfig } from 'vitest/config';
import { type Plugin } from 'vite';
import { resolve } from 'path';

/**
 * Injects the extracted CSS into the JS bundle as a self-executing
 * style injector, so consumers don't need to import the CSS separately.
 */
function injectCss(): Plugin {
  let cssContent = '';

  return {
    name: 'inject-css',
    apply: 'build',
    generateBundle(_, bundle) {
      // Grab the emitted CSS asset
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'asset' && fileName.endsWith('.css')) {
          cssContent = chunk.source as string;
        }
      }

      // Inject a self-executing CSS injector into every JS chunk
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
  plugins: [injectCss()],
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
