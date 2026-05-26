# 🍞 toastr-next

> A modern, zero-dependency revival of the legendary [toastr](https://github.com/CodeSeven/toastr) notification library.

[![npm version](https://img.shields.io/badge/npm-3.0.0-brightgreen)](https://npmjs.com/package/toastr-next)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-first-blue)](src/toastr.ts)
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![WCAG 2.1 AA](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-green)](src/toastr.ts)

The original `toastr` has **12,000+ stars** and is used by **119,000+ projects** — but it requires jQuery and hasn't been updated since 2015. This is the version developers deserve in 2026.

## What changed

| | toastr v2 (2015) | toastr-next v3 (2026) |
|---|---|---|
| **Bundle size** | ~87 KB (jQuery + toastr) | ~6 KB |
| **Dependencies** | jQuery required | **Zero** |
| **Animations** | jQuery `.fadeIn()` / JS | Pure CSS `@keyframes` |
| **Dark mode** | ❌ | ✅ Auto via `prefers-color-scheme` |
| **TypeScript** | ❌ | ✅ Full types + JSDoc |
| **Accessibility** | Partial | ✅ ARIA live regions, keyboard nav |
| **Promise API** | ❌ | ✅ `await toast.onDismissed` |
| **Animation styles** | 1 (fade via jQuery) | ✅ 4: fade, slide, bounce, flip |
| **ESM support** | ❌ | ✅ ESM + CJS + IIFE |

## Installation

```bash
npm install toastr-next
```

Or via CDN (no bundler needed):
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/toastr-next/dist/toastr.css">
<script src="https://cdn.jsdelivr.net/npm/toastr-next/dist/toastr.js"></script>
```

## Quick start

```ts
import toastr from 'toastr-next';
import 'toastr-next/dist/toastr.css';

toastr.success('Changes saved!');
toastr.error('Something went wrong', 'Error');
toastr.info('New message received');
toastr.warning('Low disk space', 'Warning');
```

**Drop-in replacement for toastr v2** — same API, just remove the jQuery `<script>` tag.

## Options

```ts
toastr.options = {
  timeOut: 5000,              // ms before auto-dismiss. 0 = sticky
  extendedTimeOut: 1000,      // ms before hiding after hover-out
  closeButton: false,         // show ✕ button
  progressBar: false,         // countdown bar
  newestOnTop: true,          // stack order
  preventDuplicates: false,   // block identical messages
  tapToDismiss: true,         // click to close
  closeOnHover: true,         // pause on hover
  positionClass: 'toast-top-right',  // 8 positions available
  animation: 'fade',          // 'fade' | 'slide' | 'bounce' | 'flip'
  escapeHtml: false,          // sanitize message/title
  rtl: false,                 // right-to-left
};
```

### Positions

`toast-top-right` · `toast-top-left` · `toast-top-center` · `toast-top-full-width`  
`toast-bottom-right` · `toast-bottom-left` · `toast-bottom-center` · `toast-bottom-full-width`

## Promise API

```ts
// Resolves when the toast is dismissed (by user or timeout)
const toast = toastr.success('File uploaded!', 'Done', { timeOut: 3000 });
await toast.onDismissed;
router.push('/dashboard');

// Chain toasts sequentially
await toastr.info('Step 1: Validating...').onDismissed;
await toastr.info('Step 2: Uploading...').onDismissed;
toastr.success('All done!');
```

## Accessibility

Every toast now includes:
- `role="alert"` (errors/warnings) or `role="status"` (info/success)
- `aria-live="assertive"` or `aria-live="polite"` based on severity
- `aria-atomic="true"` so screen readers announce the full toast
- Close button with `aria-label="Close notification"`
- **Keyboard support**: `Escape` dismisses, `Tab` focuses the close button

## Migration from v2

```diff
- <script src="jquery.min.js"></script>  <!-- remove this -->
- <script src="toastr.min.js"></script>
- <link rel="stylesheet" href="toastr.min.css">

+ <script src="toastr-next/dist/toastr.js"></script>
+ <link rel="stylesheet" href="toastr-next/dist/toastr.css">

  // API is identical
  toastr.success('Hello!');

+ // New: animation styles
+ toastr.options.animation = 'bounce';

+ // New: await dismiss
+ await toastr.info('Hi').onDismissed;
```

## License

MIT — same as the original toastr.

---

*Built for the [GitHub Finish-Up-A-Thon 2026](https://dev.to/challenges/github-2026-05-21) with GitHub Copilot.*
