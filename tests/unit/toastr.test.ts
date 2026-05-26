/**
 * toastr-next — Unit Tests
 * Run with: npx vitest run
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { toastr } from '../../src/toastr';

beforeEach(() => {
  document.body.innerHTML = '';
  toastr.options = {};
  // @ts-ignore reset internal state between tests
  toastr.remove();

  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(performance.now());
    return 0;
  });
});

// ─── Basic toast types ────────────────────────────────────────────────────────

describe('toastr.success()', () => {
  it('creates a toast element with class toast-success', () => {
    toastr.success('Hello!');
    const el = document.querySelector('.toast-success');
    expect(el).not.toBeNull();
  });

  it('renders the message text', () => {
    toastr.success('Saved successfully!');
    const msg = document.querySelector('.toast-message');
    expect(msg?.textContent).toContain('Saved successfully!');
  });

  it('renders the title when provided', () => {
    toastr.success('Saved!', 'My Title');
    const title = document.querySelector('.toast-title');
    expect(title?.textContent).toContain('My Title');
  });
});

describe('toastr.error()', () => {
  it('sets role="alert" for screen readers', () => {
    toastr.error('Something broke');
    const el = document.querySelector('.toast-error');
    expect(el?.getAttribute('role')).toBe('alert');
    expect(el?.getAttribute('aria-live')).toBe('assertive');
  });
});

describe('toastr.info()', () => {
  it('sets role="status" for non-urgent notifications', () => {
    toastr.info('FYI');
    const el = document.querySelector('.toast-info');
    expect(el?.getAttribute('role')).toBe('status');
    expect(el?.getAttribute('aria-live')).toBe('polite');
  });
});

describe('toastr.warning()', () => {
  it('creates a toast element with class toast-warning', () => {
    toastr.warning('Watch out!');
    expect(document.querySelector('.toast-warning')).not.toBeNull();
  });
});

// ─── Options ──────────────────────────────────────────────────────────────────

describe('options.closeButton', () => {
  it('adds a close button when enabled', () => {
    toastr.success('Test', undefined, { closeButton: true });
    const btn = document.querySelector('.toast-close-button');
    expect(btn).not.toBeNull();
    expect(btn?.getAttribute('aria-label')).toBe('Close notification');
  });

  it('does not add close button by default', () => {
    toastr.success('Test');
    expect(document.querySelector('.toast-close-button')).toBeNull();
  });
});

describe('options.progressBar', () => {
  it('adds a progress bar when enabled', () => {
    toastr.success('Test', undefined, { progressBar: true });
    expect(document.querySelector('.toast-progress')).not.toBeNull();
  });

  it('does not add a progress bar by default', () => {
    toastr.success('Test');
    expect(document.querySelector('.toast-progress')).toBeNull();
  });
});

describe('options.preventDuplicates', () => {
  it('blocks duplicate messages when enabled', () => {
    toastr.options = { preventDuplicates: true };
    toastr.info('Same message');
    toastr.info('Same message');
    const toasts = document.querySelectorAll('.toast');
    expect(toasts.length).toBe(1);
  });

  it('allows duplicates by default', () => {
    toastr.info('Same message');
    toastr.info('Same message');
    const toasts = document.querySelectorAll('.toast');
    expect(toasts.length).toBe(2);
  });
});

describe('options.animation', () => {
  it('sets data-animation attribute', () => {
    toastr.success('Test', undefined, { animation: 'bounce' });
    const el = document.querySelector('.toast');
    expect(el?.getAttribute('data-animation')).toBe('bounce');
  });

  it('defaults to fade animation', () => {
    toastr.success('Test');
    const el = document.querySelector('.toast');
    expect(el?.getAttribute('data-animation')).toBe('fade');
  });
});

describe('options.rtl', () => {
  it('adds rtl class when enabled', () => {
    toastr.success('مرحبا', undefined, { rtl: true });
    expect(document.querySelector('.toast.rtl')).not.toBeNull();
  });

  it('does not add rtl class by default', () => {
    toastr.success('Hello');
    expect(document.querySelector('.toast.rtl')).toBeNull();
  });
});

describe('options.newestOnTop', () => {
  it('inserts newest toast at the top by default', () => {
    toastr.success('First');
    toastr.success('Second');
    const toasts = document.querySelectorAll('.toast');
    expect(toasts[0].querySelector('.toast-message')?.textContent).toBe('Second');
  });

  it('appends to bottom when newestOnTop is false', () => {
    toastr.success('First', undefined, { newestOnTop: false });
    toastr.success('Second', undefined, { newestOnTop: false });
    const toasts = document.querySelectorAll('.toast');
    expect(toasts[toasts.length - 1].querySelector('.toast-message')?.textContent).toBe('Second');
  });
});

// ─── HTML handling ────────────────────────────────────────────────────────────

describe('options.allowHtml', () => {
  it('renders HTML when allowHtml is true', () => {
    toastr.success('<strong>Bold!</strong>', undefined, { allowHtml: true });
    const msg = document.querySelector('.toast-message');
    expect(msg?.querySelector('strong')).not.toBeNull();
  });

  it('escapes HTML by default (allowHtml: false)', () => {
    toastr.success('<script>alert(1)</script>');
    const msg = document.querySelector('.toast-message');
    expect(msg?.innerHTML).not.toContain('<script>');
    expect(msg?.textContent).toContain('<script>alert(1)</script>');
  });
});

// ─── Imperative API ───────────────────────────────────────────────────────────

describe('toastr.clear()', () => {
  it('adds toast-hiding class to all toasts', () => {
    toastr.success('A');
    toastr.error('B');
    document.querySelectorAll('.toast').forEach(t => t.classList.add('toast-shown'));
    toastr.clear();
    document.querySelectorAll('.toast').forEach(t => {
      expect(t.classList.contains('toast-hiding')).toBe(true);
    });
  });
});

describe('toastr.remove()', () => {
  it('removes the container immediately', () => {
    toastr.success('Test');
    expect(document.getElementById('toast-container')).not.toBeNull();
    toastr.remove();
    expect(document.getElementById('toast-container')).toBeNull();
  });
});

// ─── Promise / ToastInstance API ──────────────────────────────────────────────

describe('ToastInstance API', () => {
  it('dismissed is a Promise', () => {
    const instance = toastr.success('Test');
    expect(instance.dismissed).toBeInstanceOf(Promise);
  });

  it('instance has remove() method', () => {
    const instance = toastr.success('Test');
    expect(typeof instance.remove).toBe('function');
  });

  it('instance has clear() method', () => {
    const instance = toastr.success('Test');
    expect(typeof instance.clear).toBe('function');
  });

  it('instance.remove() removes the toast from the DOM', () => {
    const instance = toastr.success('Test');
    expect(document.querySelector('.toast-success')).not.toBeNull();
    instance.remove();
    expect(document.querySelector('.toast-success')).toBeNull();
  });

  it('response includes correct type and message', () => {
    const response = toastr.warning('Watch out!', 'Alert');
    expect(response.type).toBe('warning');
    expect(response.message).toBe('Watch out!');
    expect(response.title).toBe('Alert');
    expect(response.state).toBe('visible');
  });

  it('dismissed resolves after remove()', async () => {
    const instance = toastr.success('Test');
    let resolved = false;
    instance.dismissed.then(() => { resolved = true; });
    instance.remove();
    await Promise.resolve(); // flush microtasks
    expect(resolved).toBe(true);
  });
});

// ─── subscribe() ─────────────────────────────────────────────────────────────

describe('toastr.subscribe()', () => {
  it('returns an unsubscribe function', () => {
    const unsub = toastr.subscribe(() => { });
    expect(typeof unsub).toBe('function');
    unsub();
  });

  it('calls subscriber with state="hidden" after remove()', () => {
    const events: string[] = [];
    const unsub = toastr.subscribe((e) => events.push(e.state));
    const instance = toastr.success('Test');
    instance.remove();
    unsub();
    expect(events).toContain('hidden');
  });

  it('stops calling subscriber after unsubscribe', () => {
    const events: string[] = [];
    const unsub = toastr.subscribe((e) => events.push(e.state));
    unsub();
    const instance = toastr.success('Test');
    instance.remove();
    expect(events.length).toBe(0);
  });
});
