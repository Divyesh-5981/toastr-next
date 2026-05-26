/**
 * toastr-next — Unit Tests
 * Run with: npx vitest run
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { toastr } from './toastr';

// Mock DOM
beforeEach(() => {
  document.body.innerHTML = '';
  toastr.options = {};
  // @ts-ignore reset internal state between tests
  toastr.remove();
});

describe('toastr.success()', () => {
  it('creates a toast element with class toast-success', () => {
    toastr.success('Hello!');
    const el = document.querySelector('.toast-success');
    expect(el).not.toBeNull();
  });

  it('renders the message text', () => {
    toastr.success('Saved successfully!');
    const msg = document.querySelector('.toast-message');
    expect(msg?.innerHTML).toContain('Saved successfully!');
  });

  it('renders the title when provided', () => {
    toastr.success('Saved!', 'My Title');
    const title = document.querySelector('.toast-title');
    expect(title?.innerHTML).toContain('My Title');
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
});

describe('options.rtl', () => {
  it('adds rtl class when enabled', () => {
    toastr.success('مرحبا', undefined, { rtl: true });
    expect(document.querySelector('.toast.rtl')).not.toBeNull();
  });
});

describe('toastr.clear()', () => {
  it('adds toast-hiding class to all toasts', () => {
    toastr.success('A');
    toastr.error('B');
    // Manually add shown class so the test works without rAF
    document.querySelectorAll('.toast').forEach(t => t.classList.add('toast-shown'));
    toastr.clear();
    document.querySelectorAll('.toast').forEach(t => {
      expect(t.classList.contains('toast-hiding')).toBe(true);
    });
  });
});

describe('Promise API', () => {
  it('onDismissed is a Promise', () => {
    const response = toastr.success('Test');
    expect(response.onDismissed).toBeInstanceOf(Promise);
  });

  it('response includes correct type and message', () => {
    const response = toastr.warning('Watch out!', 'Alert');
    expect(response.type).toBe('warning');
    expect(response.message).toBe('Watch out!');
    expect(response.title).toBe('Alert');
    expect(response.state).toBe('visible');
  });
});

describe('HTML escaping', () => {
  it('escapes HTML when escapeHtml is true', () => {
    toastr.success('<script>alert(1)</script>', undefined, { escapeHtml: true });
    const msg = document.querySelector('.toast-message');
    expect(msg?.innerHTML).not.toContain('<script>');
    expect(msg?.innerHTML).toContain('&lt;script&gt;');
  });

  it('allows HTML when escapeHtml is false (default)', () => {
    toastr.success('<strong>Bold!</strong>');
    const msg = document.querySelector('.toast-message');
    expect(msg?.querySelector('strong')).not.toBeNull();
  });
});
