/**
 * toastr-next v3.0.0
 * A modern, zero-dependency revival of the legendary toastr notification library.
 * Original: https://github.com/CodeSeven/toastr (jQuery, 2015)
 * Revival:  Zero dependencies · TypeScript · CSS animations · Dark mode · ARIA
 *
 * MIT License
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastPosition =
  | 'toast-top-right'
  | 'toast-top-left'
  | 'toast-top-center'
  | 'toast-top-full-width'
  | 'toast-bottom-right'
  | 'toast-bottom-left'
  | 'toast-bottom-center'
  | 'toast-bottom-full-width';

export type AnimationType = 'fade' | 'slide' | 'bounce' | 'flip';

export interface ToastrOptions {
  /** Auto-dismiss after N ms. Set 0 for sticky. @default 5000 */
  timeOut?: number;
  /** Time before hiding after hover-out. @default 1000 */
  extendedTimeOut?: number;
  /** Show a close (×) button. @default false */
  closeButton?: boolean;
  /** Show a progress bar counting down. @default false */
  progressBar?: boolean;
  /** Stack newest toasts on top. @default true */
  newestOnTop?: boolean;
  /** Prevent identical messages from stacking. @default false */
  preventDuplicates?: boolean;
  /** Click anywhere on toast to dismiss. @default true */
  tapToDismiss?: boolean;
  /** Pause countdown on hover. @default true */
  closeOnHover?: boolean;
  /** Container position class. @default 'toast-top-right' */
  positionClass?: ToastPosition;
  /** Entry/exit animation style. @default 'fade' */
  animation?: AnimationType;
  /** Escape HTML in message/title. @default false */
  escapeHtml?: boolean;
  /** Right-to-left mode. @default false */
  rtl?: boolean;
  /** DOM target to append container. @default 'body' */
  target?: string;
  /** Custom HTML for the close button. */
  closeHtml?: string;
  /** Called when toast becomes visible. */
  onShown?: () => void;
  /** Called when toast finishes hiding. */
  onHidden?: () => void;
  /** Called when toast body is clicked. */
  onclick?: (event: MouseEvent) => void;
  /** Called when close button is clicked. */
  onCloseClick?: (event: MouseEvent) => void;
}

export interface ToastResponse {
  toastId: number;
  type: ToastType;
  message: string;
  title?: string;
  state: 'visible' | 'hidden';
  startTime: Date;
  endTime?: Date;
  options: Required<ToastrOptions>;
  /** Resolves when the toast is dismissed */
  onDismissed: Promise<void>;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULTS: Required<ToastrOptions> = {
  timeOut: 5000,
  extendedTimeOut: 1000,
  closeButton: false,
  progressBar: false,
  newestOnTop: true,
  preventDuplicates: false,
  tapToDismiss: true,
  closeOnHover: true,
  positionClass: 'toast-top-right',
  animation: 'fade',
  escapeHtml: false,
  rtl: false,
  target: 'body',
  closeHtml: '<button type="button" aria-label="Close notification">×</button>',
  onShown: undefined as unknown as () => void,
  onHidden: undefined as unknown as () => void,
  onclick: undefined as unknown as (e: MouseEvent) => void,
  onCloseClick: undefined as unknown as (e: MouseEvent) => void,
};

// ─── Core ─────────────────────────────────────────────────────────────────────

let toastId = 0;
let previousMessage: string | undefined;
let container: HTMLElement | null = null;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getOptions(override?: ToastrOptions): Required<ToastrOptions> {
  return { ...DEFAULTS, ...toastr.options, ...override };
}

function getContainer(options: Required<ToastrOptions>): HTMLElement {
  if (container) return container;
  container = document.createElement('div');
  container.id = 'toast-container';
  container.setAttribute('aria-live', 'polite');
  container.setAttribute('aria-atomic', 'false');
  container.setAttribute('role', 'log');
  container.className = options.positionClass;
  (document.querySelector(options.target) ?? document.body).appendChild(container);
  return container;
}

function notify(type: ToastType, message: string, title?: string, optionsOverride?: ToastrOptions): ToastResponse {
  const options = getOptions(optionsOverride);

  // Prevent duplicates
  if (options.preventDuplicates && message === previousMessage) {
    return null as unknown as ToastResponse;
  }
  previousMessage = message;

  toastId++;
  const id = toastId;

  const c = getContainer(options);

  // Build toast element
  const toast = document.createElement('div');
  toast.id = `toast-${id}`;
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', type === 'error' || type === 'warning' ? 'alert' : 'status');
  toast.setAttribute('aria-live', type === 'error' || type === 'warning' ? 'assertive' : 'polite');
  toast.setAttribute('aria-atomic', 'true');
  toast.setAttribute('data-animation', options.animation);
  if (options.rtl) toast.classList.add('rtl');

  // Progress bar
  let progressEl: HTMLElement | null = null;
  if (options.progressBar) {
    progressEl = document.createElement('div');
    progressEl.className = 'toast-progress';
    toast.appendChild(progressEl);
  }

  // Close button
  let closeEl: HTMLElement | null = null;
  if (options.closeButton) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = options.closeHtml;
    closeEl = wrapper.firstElementChild as HTMLElement;
    closeEl.className = 'toast-close-button';
    toast.appendChild(closeEl);
  }

  // Title
  if (title) {
    const titleEl = document.createElement('div');
    titleEl.className = 'toast-title';
    titleEl.textContent = options.escapeHtml ? escapeHtml(title) : title;
    // allow raw HTML in title if escapeHtml is false
    if (!options.escapeHtml) titleEl.innerHTML = title;
    toast.appendChild(titleEl);
  }

  // Message
  if (message) {
    const msgEl = document.createElement('div');
    msgEl.className = 'toast-message';
    if (options.escapeHtml) {
      msgEl.textContent = escapeHtml(message);
    } else {
      msgEl.innerHTML = message;
    }
    toast.appendChild(msgEl);
  }

  // Insert into container
  if (options.newestOnTop) {
    c.insertBefore(toast, c.firstChild);
  } else {
    c.appendChild(toast);
  }

  // Trigger enter animation (next frame so CSS transition fires)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('toast-shown'));
  });

  // Promise that resolves on dismiss
  let resolveDismiss!: () => void;
  const dismissPromise = new Promise<void>((r) => { resolveDismiss = r; });

  const response: ToastResponse = {
    toastId: id,
    type,
    message,
    title,
    state: 'visible',
    startTime: new Date(),
    options,
    onDismissed: dismissPromise,
  };

  // ── Timers & progress ──────────────────────────────────────────────────────

  let hideTimer: ReturnType<typeof setTimeout> | null = null;
  let progressTimer: ReturnType<typeof setInterval> | null = null;
  let hideEta = 0;
  let maxHideTime = 0;

  function startHideTimer(duration: number) {
    if (duration <= 0) return;
    maxHideTime = duration;
    hideEta = Date.now() + duration;
    hideTimer = setTimeout(() => hideToast(false), duration);
    if (progressEl) {
      progressTimer = setInterval(() => {
        const pct = ((hideEta - Date.now()) / maxHideTime) * 100;
        progressEl!.style.width = Math.max(0, pct) + '%';
      }, 16);
    }
  }

  function clearTimers() {
    if (hideTimer) clearTimeout(hideTimer);
    if (progressTimer) clearInterval(progressTimer);
    hideTimer = null;
    progressTimer = null;
  }

  function hideToast(force = false) {
    if (!force && document.activeElement && toast.contains(document.activeElement)) return;
    clearTimers();
    toast.classList.remove('toast-shown');
    toast.classList.add('toast-hiding');
    toast.addEventListener('animationend', () => removeToast(), { once: true });
    toast.addEventListener('transitionend', () => removeToast(), { once: true });
    // Fallback if animation doesn't fire
    setTimeout(() => removeToast(), 800);
  }

  function removeToast() {
    if (!toast.parentNode) return;
    toast.remove();
    response.state = 'hidden';
    response.endTime = new Date();
    if (options.onHidden) options.onHidden();
    resolveDismiss();
    if (container && container.children.length === 0) {
      container.remove();
      container = null;
      previousMessage = undefined;
    }
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  if (options.closeOnHover) {
    toast.addEventListener('mouseenter', () => {
      clearTimers();
      if (progressEl) progressEl.style.width = '100%';
    });
    toast.addEventListener('mouseleave', () => {
      startHideTimer(options.extendedTimeOut);
    });
  }

  if (closeEl) {
    closeEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (options.onCloseClick) options.onCloseClick(e as MouseEvent);
      hideToast(true);
    });
  }

  if (!options.onclick && options.tapToDismiss) {
    toast.addEventListener('click', () => hideToast(true));
  }

  if (options.onclick) {
    toast.addEventListener('click', (e) => {
      options.onclick(e as MouseEvent);
      hideToast(true);
    });
  }

  // Keyboard: Escape dismisses
  toast.setAttribute('tabindex', '0');
  toast.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideToast(true);
  });

  // ── Start ──────────────────────────────────────────────────────────────────

  startHideTimer(options.timeOut);
  if (options.onShown) setTimeout(options.onShown, 300);

  return response;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const toastr = {
  /** Global default options — override before calling show methods. */
  options: {} as ToastrOptions,

  /** Show a success toast. Returns a ToastResponse with an onDismissed Promise. */
  success(message: string, title?: string, options?: ToastrOptions): ToastResponse {
    return notify('success', message, title, options);
  },

  /** Show an error toast. */
  error(message: string, title?: string, options?: ToastrOptions): ToastResponse {
    return notify('error', message, title, options);
  },

  /** Show an info toast. */
  info(message: string, title?: string, options?: ToastrOptions): ToastResponse {
    return notify('info', message, title, options);
  },

  /** Show a warning toast. */
  warning(message: string, title?: string, options?: ToastrOptions): ToastResponse {
    return notify('warning', message, title, options);
  },

  /** Remove all toasts instantly (no animation). */
  remove(): void {
    if (container) {
      container.remove();
      container = null;
      previousMessage = undefined;
    }
  },

  /** Dismiss all toasts with animation. */
  clear(): void {
    if (!container) return;
    Array.from(container.children).forEach((child) => {
      (child as HTMLElement).classList.remove('toast-shown');
      (child as HTMLElement).classList.add('toast-hiding');
    });
    setTimeout(() => toastr.remove(), 800);
  },

  version: '3.0.0',
};

export default toastr;
