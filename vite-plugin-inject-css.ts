import { readFileSync } from 'fs';
import type { Plugin } from 'vite';

/**
 * Stylesheet `id` used by the injected <style> tag. Shared across all bundles
 * so multiple toastr-next bundles loaded on the same page de-duplicate.
 */
const STYLE_ID = '__toastr_next_css__';

function makeInjector(cssContent: string): string {
  return `
(function(){
  if (typeof document === 'undefined') return;
  var id = ${JSON.stringify(STYLE_ID)};
  if (document.getElementById(id)) return;
  var s = document.createElement('style');
  s.id = id;
  s.textContent = ${JSON.stringify(cssContent)};
  document.head.appendChild(s);
})();
`.trim();
}

function prependToChunks(bundle: Record<string, unknown>, cssContent: string): void {
  const injector = makeInjector(cssContent);
  for (const chunk of Object.values(bundle)) {
    const c = chunk as { type: string; code?: string };
    if (c.type === 'chunk' && typeof c.code === 'string') {
      c.code = injector + '\n' + c.code;
    }
  }
}

/**
 * Injects the CSS asset emitted during this build into every JS chunk,
 * so the bundle is self-contained and consumers don't need to import CSS
 * separately. Use for builds whose entry imports the CSS source file.
 */
export function injectBundledCss(): Plugin {
  return {
    name: 'inject-bundled-css',
    apply: 'build',
    generateBundle(_, bundle) {
      let cssContent = '';
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if ((chunk as { type: string }).type === 'asset' && fileName.endsWith('.css')) {
          cssContent = (chunk as { source: string }).source;
        }
      }
      if (!cssContent) return;
      prependToChunks(bundle, cssContent);
    },
  };
}

/**
 * Reads CSS from a path on disk and injects it into every JS chunk. Use for
 * sibling bundles whose entry does NOT import the CSS source file (e.g. the
 * React adapter), so vite emits no CSS asset of its own. The path typically
 * points at the CSS emitted by the main build.
 */
export function injectCssFromFile(cssPath: string): Plugin {
  return {
    name: 'inject-css-from-file',
    apply: 'build',
    generateBundle(_, bundle) {
      let cssContent = '';
      try {
        cssContent = readFileSync(cssPath, 'utf-8');
      } catch {
        return;
      }
      if (!cssContent) return;
      prependToChunks(bundle, cssContent);
    },
  };
}
