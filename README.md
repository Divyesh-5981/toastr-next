# toastr-next

[![npm version](https://img.shields.io/npm/v/toastr-next.svg)](https://www.npmjs.com/package/toastr-next)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![Tests](https://img.shields.io/badge/tests-31%20passing-brightgreen.svg)](#)
[![Bundle Size](https://img.shields.io/badge/bundle-~4KB%20gzipped-blue.svg)](#)

A TypeScript rewrite of [toastr 2.x](https://github.com/CodeSeven/toastr) — zero dependencies, fully typed, promise-based API, dark mode, and CSS animation presets. **~4 KB gzipped** (JS 2.07 KB + CSS 2.02 KB).

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

> **CSS is automatically injected** into the page when you import the library — no separate stylesheet import required.

---

## 💻 Code Samples

Every snippet below is verified against the public API exported from `toastr-next` and `toastr-next/react`. Method signatures, option names, and return types map 1:1 to the current `src/`.

### Full integration demos

Three complete, copy-pasteable scenarios. Pick the one that matches your stack — each one is end-to-end (install → entry file → working notification) with nothing else required.

---

#### 1 · Bundler (Vite / Webpack / Rollup) — Vanilla TypeScript

The bundler-friendly path. No special bundler configuration needed: `toastr-next` ships ESM and CJS entries, and the stylesheet is injected at runtime so you do not need a CSS loader to import `.css`.

```bash
npm install toastr-next
```

```html
<!-- index.html -->
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <title>toastr-next demo</title>
    </head>
    <body>
        <button id="save">Save</button>
        <script type="module" src="/src/main.ts"></script>
    </body>
</html>
```

```typescript
// src/main.ts
import { toastr } from "toastr-next";
// CSS is auto-injected on first import — no `import "toastr-next/style"` needed.

toastr.options = {
    positionClass: "toast-top-right",
    progressBar: true,
    closeButton: true,
    timeOut: 4000,
};

document.getElementById("save")!.addEventListener("click", async () => {
    const t = toastr.info("Saving…", "", { timeOut: 0 });
    try {
        await saveToServer();
        t.clear();
        await t.dismissed;
        toastr.success("Saved!");
    } catch {
        t.clear();
        toastr.error("Save failed");
    }
});

async function saveToServer(): Promise<void> {
    await new Promise((r) => setTimeout(r, 1200));
}
```

Run with `npx vite`. The same `src/main.ts` works unchanged under Webpack, Rollup, Parcel, or esbuild — only the HTML entry / bundler config differs.

> If you prefer to manage CSS yourself (SSR pipelines, CSS purging, etc.), import `toastr-next/style` once and the runtime injector becomes a no-op since the styles are already present.

---

#### 2 · Plain HTML via CDN — no build step

The IIFE bundle defines `window.toastr` directly. Drop a single `<script>` into any HTML page and you are done.

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <title>toastr-next CDN demo</title>
    </head>
    <body>
        <button id="ok">Show success</button>
        <button id="err">Show error</button>

        <!-- Loads the IIFE bundle and registers window.toastr. CSS is auto-injected. -->
        <script src="https://cdn.jsdelivr.net/npm/toastr-next@3/dist/toastr-next.iife.js"></script>
        <script>
            toastr.options = {
                positionClass: "toast-top-right",
                progressBar: true,
                closeButton: true,
            };

            document.getElementById("ok").addEventListener("click", () => {
                toastr.success("Saved!", "Success");
            });

            document.getElementById("err").addEventListener("click", () => {
                toastr.error("Something went wrong", "Error");
            });
        </script>
    </body>
</html>
```

- `toastr-next@3` tracks the latest 3.x patch; use `toastr-next@3.0.7` for an exact pin.
- unpkg works too: `https://unpkg.com/toastr-next@3/dist/toastr-next.iife.js`.

---

#### 3 · React (Vite, Next.js client components, Remix, CRA)

```bash
npm install toastr-next
# React 17+ is required as a peer dependency
```

```tsx
// src/App.tsx
import { ToastrProvider } from "toastr-next/react";
import { SaveButton } from "./SaveButton";

export default function App() {
    return (
        <>
            <ToastrProvider
                position="toast-top-right"
                options={{ progressBar: true, closeButton: true, timeOut: 4000 }}
            />
            <main style={{ padding: 24 }}>
                <h1>My app</h1>
                <SaveButton />
            </main>
        </>
    );
}
```

```tsx
// src/SaveButton.tsx
import { useToastr } from "toastr-next/react";

export function SaveButton() {
    const toast = useToastr();

    async function handleSave() {
        const t = toast.info("Saving…", "", { timeOut: 0 });
        try {
            await saveToServer();
            t.clear();
            await t.dismissed;
            toast.success("Saved!");
        } catch {
            t.clear();
            toast.error("Save failed");
        }
    }

    return <button onClick={handleSave}>Save</button>;
}

async function saveToServer(): Promise<void> {
    await new Promise((r) => setTimeout(r, 1200));
}
```

```tsx
// src/main.tsx (Vite entry)
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);
```

The React adapter is a thin wrapper around vanilla `toastr` — no React context is used, so `useToastr` works with or without the Provider. Mount the Provider only when you want a single place to set global defaults.

> **Next.js / Remix / any SSR framework:** `import` is safe on the server (the CSS injector and module-level code are SSR-safe), but **calling** `toast.*()` on the server will throw because the runtime calls `document.createElement`. Trigger toasts from client components / `"use client"` boundaries only.

---

### Vanilla JavaScript / TypeScript

#### Basic toasts

```typescript
import { toastr } from "toastr-next";
// CSS is auto-injected on first import — no separate stylesheet needed.

toastr.success("Saved!");
toastr.error("Something went wrong");
toastr.info("Update available");
toastr.warning("Low disk space");

// Optional title as the second argument
toastr.success("Profile updated", "Saved");
```

Each method signature: `(message: string, title?: string, options?: ToastrOptions) => ToastInstance`.

#### Per-call options

Pass an options object as the third argument. Per-call options override global defaults. See the [Options table](#options) for the full list.

```typescript
toastr.success("Upload complete", "Done", {
    progressBar: true,
    closeButton: true,
    animation: "bounce",
    positionClass: "toast-bottom-right",
    timeOut: 4000,
});
```

#### Global defaults

Assigning to `toastr.options` **replaces** the defaults object (not merged). Set it once near your app entry, then override per call as needed.

```typescript
toastr.options = {
    positionClass: "toast-top-right",
    progressBar: true,
    closeButton: true,
    animation: "fade",
    timeOut: 5000,
};

// You can also mutate a single key:
toastr.options.timeOut = 3000;
```

#### Sticky toasts (no auto-dismiss)

Set `timeOut: 0`. If `closeOnHover` is left at its default (`true`), also set `extendedTimeOut: 0`, otherwise the toast will dismiss `extendedTimeOut` ms after the pointer leaves.

```typescript
toastr.warning("Action required", "Confirm to proceed", {
    timeOut: 0,
    extendedTimeOut: 0,
    closeButton: true,
});
```

#### Await dismissal (Promise API)

Each `toastr.*()` call returns a `ToastInstance` **synchronously**. `instance.dismissed` resolves after the toast's hide animation finishes (or immediately on browsers without the Web Animations API).

```typescript
const toast = toastr.info("Saving…", "", { timeOut: 0 });
await saveToServer();
toast.clear();         // trigger the dismiss animation
await toast.dismissed; // wait until the toast is fully gone
toastr.success("Saved!");
```

#### Programmatic control of a single toast

```typescript
const toast = toastr.info("Processing…");

toast.clear();  // dismiss with animation
toast.remove(); // remove from DOM immediately, no animation
```

#### Dismiss all toasts

```typescript
toastr.clear();  // animate every visible toast out
toastr.remove(); // remove every toast immediately, no animation
```

#### Subscribe to lifecycle events

`toastr.subscribe(callback)` returns an unsubscribe function. The callback fires for every state transition on every toast.

```typescript
const unsubscribe = toastr.subscribe((event) => {
    // event.state: "shown" | "hidden" | "clicked"
    // event.type:  "success" | "error" | "info" | "warning"
    console.log(event.toastId, event.type, event.state, event.message);
});

// Later — stop listening
unsubscribe();
```

#### Prevent duplicate messages

When `preventDuplicates` is enabled, a second call with the same `message` while a copy is still on screen is suppressed. The returned `ToastInstance` is a safe no-op: `dismissed` resolves immediately and `clear()` / `remove()` are no-ops — so `await` and chaining still work without null checks.

```typescript
toastr.options.preventDuplicates = true;

toastr.info("Loading…");
const suppressed = toastr.info("Loading…"); // not rendered — duplicate
await suppressed.dismissed;                  // resolves immediately
```

---

### React

Both exports live under the `toastr-next/react` entry point. The React adapter is a thin wrapper around the vanilla `toastr` — no React context is used, so the hook works with or without the Provider.

#### Setup with `ToastrProvider`

`<ToastrProvider />` is **self-closing**. It renders `null` and only configures the global `toastr.options`. Do not wrap children inside it.

```tsx
// App.tsx
import { ToastrProvider } from "toastr-next/react";

export default function App() {
    return (
        <>
            <ToastrProvider
                position="toast-top-right"
                options={{ progressBar: true, closeButton: true }}
            />
            <Routes />
        </>
    );
}
```

Provider props (all optional):

| Prop       | Type                          | Purpose                                                         |
| ---------- | ----------------------------- | --------------------------------------------------------------- |
| `position` | `ToastPosition`               | Shorthand for `options.positionClass` (default `toast-top-right`) |
| `options`  | `ToastrOptions`               | Full options object applied as global defaults                   |
| `onReady`  | `(t: typeof toastr) => void`  | Fired once after defaults are applied                            |

#### Trigger toasts with `useToastr`

```tsx
// Home.tsx
import { useToastr } from "toastr-next/react";

export function Home() {
    const toast = useToastr();

    async function handleSave() {
        try {
            await save();
            toast.success("Saved!", "Success");
        } catch {
            toast.error("Save failed", "Error");
        }
    }

    return (
        <div>
            <button onClick={() => toast.info("Hello!")}>Info</button>
            <button onClick={() => toast.warning("Heads up")}>Warning</button>
            <button onClick={handleSave}>Save</button>
        </div>
    );
}
```

The hook returns `{ success, info, warning, error, clear, remove }`. Each method has the same signature as `toastr.success(...)` and returns a `ToastInstance`. `clear` and `remove` are the global versions — they dismiss every visible toast, not just ones triggered through this hook.

#### Per-hook defaults

Defaults passed to `useToastr` are merged into every call made through it. Per-call options still take precedence.

```tsx
const toast = useToastr({ closeButton: true, timeOut: 6000 });

toast.info("Inherits closeButton + timeOut from the hook");
toast.warning("Per-call override", "", { timeOut: 0 }); // sticky
```

#### Await dismissal in React

```tsx
import { useToastr } from "toastr-next/react";

export function UploadButton() {
    const toast = useToastr();

    async function handleUpload() {
        const t = toast.info("Uploading…", "", { timeOut: 0, closeButton: true });
        try {
            await uploadFile();
            t.clear();
            await t.dismissed;
            toast.success("Upload complete!");
        } catch {
            t.clear();
            toast.error("Upload failed");
        }
    }

    return <button onClick={handleUpload}>Upload</button>;
}
```

#### Subscribing from React

`useToastr` does not expose `subscribe`. Use the global `toastr.subscribe()` inside an effect and return the unsubscribe function for cleanup.

```tsx
import { useEffect } from "react";
import { toastr } from "toastr-next";

export function ToastLogger() {
    useEffect(() => {
        const unsubscribe = toastr.subscribe((e) => console.log(e));
        return () => { unsubscribe(); };
    }, []);
    return null;
}
```

---

### TypeScript types

All exported types are re-exported from the package entry:

```typescript
import type {
    ToastrOptions,
    ToastInstance,
    ToastEvent,
    ToastType,     // "success" | "error" | "info" | "warning"
    ToastPosition, // 8 position-class string literals
    AnimationType, // "fade" | "slide" | "bounce" | "flip"
    ToastState,    // "shown" | "hidden" | "clicked"
} from "toastr-next";
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
	...
</html>

<!-- Force light mode (overrides OS preference) -->
<html data-theme="light">
	...
</html>
```

---

## Accessibility

- The toast container is a live region (`role="log"`, `aria-live="polite"`)
- Each toast uses `role="alert"` + `aria-live="assertive"` (errors/warnings) or `role="status"` + `aria-live="polite"` (info/success), with `aria-atomic="true"`
- Close buttons have a descriptive `aria-label`
- Toasts are focusable (`tabindex="0"`) and participate in natural tab order, so users can Tab into a toast and Tab again to reach its close button
- **Keyboard support:** pressing `Escape` while a toast is focused dismisses that toast

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

No CSS import needed — styles are bundled into the JS. For CDN usage:

```html
<script src="https://cdn.jsdelivr.net/npm/toastr-next@3/dist/toastr-next.iife.js"></script>
<script>
	toastr.success("Hello from CDN!");
</script>
```

If you prefer to manage CSS yourself (e.g. SSR or custom CSS pipelines), the stylesheet is still available separately:

```html
<link
	rel="stylesheet"
	href="https://cdn.jsdelivr.net/npm/toastr-next@3/dist/toastr-next.css"
/>
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
+ // No CSS import needed — styles are auto-injected!
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
- Target the `main` branch

---

## License

MIT — see [LICENSE](LICENSE).

---

## Credits

Originally created by [John Papa](https://twitter.com/John_Papa), [Tim Ferrell](https://twitter.com/ferrell_tim), and [Hans Fjällemark](https://twitter.com/hfjallemark).  
Inspired by [notifer.js](https://github.com/Srirangan/notifer.js/).  
toastr-next 3.x is a TypeScript rewrite with zero dependencies.
