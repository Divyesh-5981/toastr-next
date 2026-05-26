# toastr-next

[![npm version](https://img.shields.io/npm/v/toastr-next.svg)](https://www.npmjs.com/package/toastr-next)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![Tests](https://img.shields.io/badge/tests-31%20passing-brightgreen.svg)](#)
[![Bundle Size](https://img.shields.io/badge/deps-zero-blue.svg)](#)

A TypeScript rewrite of [toastr 2.x](https://github.com/CodeSeven/toastr) — zero dependencies, fully typed, promise-based API, dark mode, and CSS animation presets.

---

## Why toastr-next?

| Feature        | toastr 2.x              | toastr-next 3.x                                |
| -------------- | ----------------------- | ---------------------------------------------- |
| Dependencies   | jQuery required         | **Zero**                                       |
| TypeScript     | No                      | **First-class**                                |
| Animations     | jQuery animate + easing | **CSS `@keyframes`**                           |
| Dark mode      | Manual CSS              | **`prefers-color-scheme` + `data-theme`**      |
| Accessibility  | Partial                 | **Full (ARIA, keyboard)**                      |
| Return value   | jQuery object           | **`ToastInstance` (with `dismissed` Promise)** |
| React          | Third-party             | **Built-in hook + provider**                   |
| Bundle formats | UMD only                | **ESM, CJS, UMD, IIFE**                        |

---

## Install

```bash
npm install toastr-next
```

```bash
yarn add toastr-next
```

```bash
pnpm add toastr-next
```

---

## Quick Start

### Vanilla / TypeScript

```typescript
import { toastr } from "toastr-next";
import "toastr-next/style";

// Fire and forget
toastr.success("Saved!");
toastr.error("Something went wrong", "Error");
toastr.warning("Low disk space", "Warning");
toastr.info("Update available");

// Wait until the toast is dismissed
const instance = toastr.info("Loading…");
await instance.dismissed;
console.log("toast closed");
```

### React

```tsx
import { ToastrProvider, useToastr } from "toastr-next/react";

// 1. Wrap your app once
function App() {
	return (
		<ToastrProvider options={{ positionClass: "toast-top-right" }}>
			<YourApp />
		</ToastrProvider>
	);
}

// 2. Use the hook anywhere inside the tree
function SaveButton() {
	const { success, error } = useToastr({ positionClass: "toast-bottom-right" });

	async function handleSave() {
		try {
			await save();
			success("Saved!");
		} catch (e) {
			error("Save failed", "Error");
		}
	}

	return <button onClick={handleSave}>Save</button>;
}
```

---

## Options

All options can be set globally on `toastr.options` or passed per-call as the third argument.

```typescript
toastr.options.timeOut = 3000;
toastr.success("Hello", "Title", { closeButton: true, animation: "slide" });
```

| Option              | Type                                      | Default                | Description                                                      |
| ------------------- | ----------------------------------------- | ---------------------- | ---------------------------------------------------------------- |
| `allowHtml`         | `boolean`                                 | `false`                | Render HTML in title and message (use with trusted content only) |
| `animation`         | `'fade' \| 'slide' \| 'bounce' \| 'flip'` | `'fade'`               | CSS `@keyframes` animation preset                                |
| `closeButton`       | `boolean`                                 | `false`                | Show a close button                                              |
| `closeHtml`         | `string`                                  | `'<button>…</button>'` | Custom close button HTML                                         |
| `closeOnHover`      | `boolean`                                 | `true`                 | Pause countdown while hovering                                   |
| `extendedTimeOut`   | `number`                                  | `1000`                 | Ms to keep toast open after hover                                |
| `newestOnTop`       | `boolean`                                 | `true`                 | Stack newest toasts on top                                       |
| `onCloseClick`      | `(e: MouseEvent) => void`                 | —                      | Callback when close button clicked                               |
| `onHidden`          | `() => void`                              | —                      | Callback after toast is hidden                                   |
| `onShown`           | `() => void`                              | —                      | Callback after toast is shown                                    |
| `onclick`           | `(e: MouseEvent) => void`                 | —                      | Callback when toast body is clicked                              |
| `positionClass`     | `string`                                  | `'toast-top-right'`    | Container position class                                         |
| `preventDuplicates` | `boolean`                                 | `false`                | Suppress duplicate messages                                      |
| `progressBar`       | `boolean`                                 | `false`                | Show a progress bar                                              |
| `rtl`               | `boolean`                                 | `false`                | Right-to-left layout                                             |
| `tapToDismiss`      | `boolean`                                 | `true`                 | Click toast body to dismiss                                      |
| `target`            | `string`                                  | `'body'`               | CSS selector for the container parent                            |
| `timeOut`           | `number`                                  | `5000`                 | Ms before auto-dismiss (0 = sticky)                              |

> **Removed from 2.x:** `showMethod`, `hideMethod`, `closeMethod`, `showEasing`, `hideEasing`, `closeEasing`, `escapeHtml`. Use `animation` for animations and `allowHtml` for HTML content control.

---

## Animations

Four built-in CSS `@keyframes` presets — no jQuery, no easing plugin required.

```typescript
toastr.success("Saved!", "", { animation: "fade" }); // default
toastr.info("Note", "", { animation: "slide" });
toastr.warning("Heads up", "", { animation: "bounce" });
toastr.error("Failed", "", { animation: "flip" });
```

---

## Dark Mode

Dark styles are applied automatically via `prefers-color-scheme: dark`. You can also force a theme by setting `data-theme` on any ancestor element (including `<html>`):

```html
<!-- Force dark mode -->
<html data-theme="dark">
	<!-- Force light mode -->
	<html data-theme="light"></html>
</html>
```

---

## Accessibility

- Toast containers use `role="alert"` and `aria-live="assertive"` (errors/warnings) or `aria-live="polite"` (info/success)
- Close buttons have a descriptive `aria-label`
- **Keyboard support:**
  - `Escape` dismisses the focused or most-recent toast
  - `Tab` moves focus to the close button within a toast

---

## Promise API

Every `toastr.*()` call returns a `ToastInstance` synchronously.

```typescript
interface ToastInstance {
	/** Resolves when the toast has finished its dismiss animation. */
	dismissed: Promise<void>;
	/** Programmatically remove the toast immediately (no animation). */
	remove(): void;
	/** Trigger the dismiss animation then remove. */
	clear(): void;
}
```

```typescript
// Wait until the user dismisses the toast before proceeding
const toast = toastr.success("File uploaded");
await toast.dismissed;
navigateAway();

// Or dismiss programmatically
const toast = toastr.info("Processing…", "", { timeOut: 0 });
await doWork();
toast.clear();
```

---

## Imperative API

```typescript
// Remove all toasts immediately (no animation)
toastr.remove();

// Dismiss all toasts with animation
toastr.clear();

// Subscribe to all toast lifecycle events; returns an unsubscribe function
const unsubscribe = toastr.subscribe((event) => {
	console.log(event.state); // 'shown' | 'hidden' | 'clicked'
	console.log(event.type); // 'success' | 'error' | 'info' | 'warning'
});

// Stop listening
unsubscribe();
```

---

## Sticky Toasts (No Auto-Hide)

```typescript
toastr.options.timeOut = 0;
toastr.options.extendedTimeOut = 0;

toastr.warning("This will not go away on its own.", "Action required");
```

---

## Position Classes

```
toast-top-right       (default)
toast-top-left
toast-top-center
toast-top-full-width
toast-bottom-right
toast-bottom-left
toast-bottom-center
toast-bottom-full-width
```

---

## CDN / UMD

```html
<link
	rel="stylesheet"
	href="https://cdn.jsdelivr.net/npm/toastr-next@3/dist/toastr-next.css"
/>
<script src="https://cdn.jsdelivr.net/npm/toastr-next@3/dist/toastr-next.iife.js"></script>
<script>
	toastr.success("Hello from CDN!");
</script>
```

---

## Bundle Formats

| Format | Path                       | Use case                         |
| ------ | -------------------------- | -------------------------------- |
| ESM    | `dist/toastr-next.es.js`   | Bundlers (Vite, Webpack, Rollup) |
| CJS    | `dist/toastr-next.cjs.js`  | Node.js / CommonJS               |
| UMD    | `dist/toastr-next.umd.js`  | Legacy bundlers                  |
| IIFE   | `dist/toastr-next.iife.js` | `<script>` tag, CDN              |

---

## Migration from toastr 2.x

### 1. Remove jQuery

```diff
- <script src="jquery.min.js"></script>
- <script src="toastr.min.js"></script>
+ <!-- toastr-next has no dependencies -->
```

```diff
- npm install jquery toastr
+ npm install toastr-next
```

### 2. Update imports

```diff
- import toastr from 'toastr';
- import 'toastr/build/toastr.min.css';
+ import { toastr } from 'toastr-next';
+ import 'toastr-next/style';
```

### 3. Replace animation options

```diff
- toastr.options.showMethod = 'slideDown';
- toastr.options.hideMethod = 'slideUp';
- toastr.options.showEasing = 'easeOutBounce';
- toastr.options.hideEasing = 'easeInBack';
+ toastr.options.animation = 'slide';
```

The `showMethod`, `hideMethod`, `closeMethod`, `showEasing`, `hideEasing`, and `closeEasing` options are **removed**. Use the `animation` option with one of the four presets: `'fade'` `'slide'` `'bounce'` `'flip'`.

### 4. Update the `subscribe` callback

`subscribe()` now returns an **unsubscribe function** instead of void:

```diff
- toastr.subscribe(callback);
+ const unsubscribe = toastr.subscribe(callback);
+ // later…
+ unsubscribe();
```

### 5. Handle the new return type

`toastr.success()` (and all variants) now return a `ToastInstance` synchronously instead of a jQuery object:

```diff
- const $toast = toastr.success('Saved!');
- $toast.css('color', 'red'); // jQuery DOM manipulation
+ const instance = toastr.success('Saved!');
+ await instance.dismissed;  // wait for it to close
```

### 6. New: `instance.dismissed` Promise

```typescript
// Block until the user closes the toast
const instance = toastr.warning("Are you sure?", "", {
	timeOut: 0,
	closeButton: true,
});
await instance.dismissed;
proceed();
```

### 7. Replace `escapeHtml` with `allowHtml`

HTML is **escaped by default** (secure). To render HTML content, opt in explicitly:

```diff
- toastr.success('<b>Bold</b>', '', { escapeHtml: false });
+ toastr.success('<b>Bold</b>', '', { allowHtml: true });
```

---

## Development

```bash
# Install dependencies
npm install

# Run tests (31 Vitest tests)
npm test

# Watch mode
npm run test:watch

# Build all bundles + type declarations
npm run build
```

---

## Contributing

Pull requests are welcome. Please:

- Pass all existing tests (`npm test`)
- Add tests for new behaviour
- Target the `develop` branch

---

## License

MIT — see [LICENSE](LICENSE).

---

## Credits

Originally created by [John Papa](https://twitter.com/John_Papa), [Tim Ferrell](https://twitter.com/ferrell_tim), and [Hans Fjällemark](https://twitter.com/hfjallemark).  
Inspired by [notifer.js](https://github.com/Srirangan/notifer.js/).  
toastr-next 3.x is a TypeScript rewrite with zero dependencies.
