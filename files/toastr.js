/*!
 * toastr-next v3.0.0
 * A modern, zero-dependency revival of the legendary toastr notification library.
 * Original: https://github.com/CodeSeven/toastr (jQuery required, 2015)
 * Revival:  Zero dependencies · TypeScript source · CSS animations · Dark mode · ARIA
 * License:  MIT
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? module.exports = factory()
    : typeof define === 'function' && define.amd
      ? define(factory)
      : (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.toastr = factory());
})(this, function () {
  'use strict';

  // ─── Defaults ──────────────────────────────────────────────────────────────
  var DEFAULTS = {
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
    closeHtml: '<button type="button" aria-label="Close notification">\u00d7</button>',
  };

  // ─── State ─────────────────────────────────────────────────────────────────
  var toastId = 0;
  var previousMessage;
  var container = null;

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function getOptions(override) {
    return Object.assign({}, DEFAULTS, toastr.options, override || {});
  }

  function getContainer(opts) {
    if (container) return container;
    container = document.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'false');
    container.setAttribute('role', 'log');
    container.className = opts.positionClass;
    (document.querySelector(opts.target) || document.body).appendChild(container);
    return container;
  }

  function notify(type, message, title, optionsOverride) {
    var opts = getOptions(optionsOverride);

    if (opts.preventDuplicates && message === previousMessage) return null;
    previousMessage = message;

    toastId++;
    var id = toastId;
    var c = getContainer(opts);

    // Build toast
    var toast = document.createElement('div');
    toast.id = 'toast-' + id;
    toast.className = 'toast toast-' + type;
    toast.setAttribute('role', (type === 'error' || type === 'warning') ? 'alert' : 'status');
    toast.setAttribute('aria-live', (type === 'error' || type === 'warning') ? 'assertive' : 'polite');
    toast.setAttribute('aria-atomic', 'true');
    toast.setAttribute('data-animation', opts.animation);
    toast.setAttribute('tabindex', '0');
    if (opts.rtl) toast.classList.add('rtl');

    // Progress bar
    var progressEl = null;
    if (opts.progressBar) {
      progressEl = document.createElement('div');
      progressEl.className = 'toast-progress';
      toast.appendChild(progressEl);
    }

    // Close button
    var closeEl = null;
    if (opts.closeButton) {
      var wrapper = document.createElement('div');
      wrapper.innerHTML = opts.closeHtml;
      closeEl = wrapper.firstElementChild;
      closeEl.className = 'toast-close-button';
      toast.appendChild(closeEl);
    }

    // Title
    if (title) {
      var titleEl = document.createElement('div');
      titleEl.className = 'toast-title';
      titleEl.innerHTML = opts.escapeHtml ? escHtml(title) : title;
      toast.appendChild(titleEl);
    }

    // Message
    if (message) {
      var msgEl = document.createElement('div');
      msgEl.className = 'toast-message';
      msgEl.innerHTML = opts.escapeHtml ? escHtml(message) : message;
      toast.appendChild(msgEl);
    }

    // Insert
    if (opts.newestOnTop) {
      c.insertBefore(toast, c.firstChild);
    } else {
      c.appendChild(toast);
    }

    // Trigger CSS animation (double rAF so the class change triggers transition)
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { toast.classList.add('toast-shown'); });
    });

    // Dismiss promise
    var resolveDismiss;
    var dismissPromise = new Promise(function (resolve) { resolveDismiss = resolve; });

    var response = {
      toastId: id,
      type: type,
      message: message,
      title: title,
      state: 'visible',
      startTime: new Date(),
      options: opts,
      onDismissed: dismissPromise,
    };

    // ── Timers ────────────────────────────────────────────────────────────────
    var hideTimer = null;
    var progressTimer = null;
    var hideEta = 0;
    var maxHideTime = 0;

    function startHideTimer(duration) {
      if (!duration || duration <= 0) return;
      maxHideTime = duration;
      hideEta = Date.now() + duration;
      hideTimer = setTimeout(function () { hideToast(false); }, duration);
      if (progressEl) {
        progressTimer = setInterval(function () {
          var pct = ((hideEta - Date.now()) / maxHideTime) * 100;
          progressEl.style.width = Math.max(0, pct) + '%';
        }, 16);
      }
    }

    function clearTimers() {
      if (hideTimer) clearTimeout(hideTimer);
      if (progressTimer) clearInterval(progressTimer);
      hideTimer = null;
      progressTimer = null;
    }

    var removed = false;
    function removeToast() {
      if (removed || !toast.parentNode) return;
      removed = true;
      toast.remove();
      response.state = 'hidden';
      response.endTime = new Date();
      if (opts.onHidden) opts.onHidden();
      resolveDismiss();
      if (container && container.children.length === 0) {
        container.remove();
        container = null;
        previousMessage = undefined;
      }
    }

    function hideToast(force) {
      if (!force && document.activeElement && toast.contains(document.activeElement)) return;
      clearTimers();
      toast.classList.remove('toast-shown');
      toast.classList.add('toast-hiding');
      toast.addEventListener('animationend', removeToast, { once: true });
      toast.addEventListener('transitionend', removeToast, { once: true });
      setTimeout(removeToast, 800);
    }

    // ── Events ────────────────────────────────────────────────────────────────
    if (opts.closeOnHover) {
      toast.addEventListener('mouseenter', function () {
        clearTimers();
        if (progressEl) progressEl.style.width = '100%';
      });
      toast.addEventListener('mouseleave', function () {
        startHideTimer(opts.extendedTimeOut);
      });
    }

    if (closeEl) {
      closeEl.addEventListener('click', function (e) {
        e.stopPropagation();
        if (opts.onCloseClick) opts.onCloseClick(e);
        hideToast(true);
      });
    }

    if (!opts.onclick && opts.tapToDismiss) {
      toast.addEventListener('click', function () { hideToast(true); });
    }

    if (opts.onclick) {
      toast.addEventListener('click', function (e) {
        opts.onclick(e);
        hideToast(true);
      });
    }

    toast.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hideToast(true);
    });

    startHideTimer(opts.timeOut);
    if (opts.onShown) setTimeout(opts.onShown, 300);

    return response;
  }

  // ─── Public API ────────────────────────────────────────────────────────────
  var toastr = {
    options: {},
    version: '3.0.0',

    success: function (message, title, options) { return notify('success', message, title, options); },
    error:   function (message, title, options) { return notify('error',   message, title, options); },
    info:    function (message, title, options) { return notify('info',    message, title, options); },
    warning: function (message, title, options) { return notify('warning', message, title, options); },

    remove: function () {
      if (container) { container.remove(); container = null; previousMessage = undefined; }
    },

    clear: function () {
      if (!container) return;
      Array.from(container.children).forEach(function (child) {
        child.classList.remove('toast-shown');
        child.classList.add('toast-hiding');
      });
      setTimeout(function () { toastr.remove(); }, 800);
    },
  };

  return toastr;
});
