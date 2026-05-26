import "./toastr.css";
import type { ToastType, ToastrOptions, ToastResponse } from "./types";

// ─── Defaults ─────────────────────────────────────────────────────────────────

type BaseToastrOptions = Omit<
	Required<ToastrOptions>,
	"onShown" | "onHidden" | "onclick" | "onCloseClick"
>;

const DEFAULTS: BaseToastrOptions = {
	timeOut: 5000,
	extendedTimeOut: 1000,
	closeButton: false,
	progressBar: false,
	newestOnTop: true,
	preventDuplicates: false,
	tapToDismiss: true,
	closeOnHover: true,
	positionClass: "toast-top-right",
	animation: "fade",
	allowHtml: false,
	escapeHtml: false,
	rtl: false,
	target: "body",
	closeHtml: '<button type="button" aria-label="Close notification">×</button>',
};

// ─── Core ─────────────────────────────────────────────────────────────────────

let toastId = 0;
let container: HTMLElement | null = null;
const activeMessages = new Set<string>();

function getOptions(
	override?: ToastrOptions,
): ToastrOptions & BaseToastrOptions {
	return { ...DEFAULTS, ...toastr.options, ...override };
}

function getContainer(options: ToastrOptions & BaseToastrOptions): HTMLElement {
	if (container) return container;
	container = document.createElement("div");
	container.id = "toast-container";
	container.setAttribute("aria-live", "polite");
	container.setAttribute("aria-atomic", "false");
	container.setAttribute("role", "log");
	container.className = options.positionClass;
	(document.querySelector(options.target) ?? document.body).appendChild(
		container,
	);
	return container;
}

function notify(
	type: ToastType,
	message: string,
	title?: string,
	optionsOverride?: ToastrOptions,
): ToastResponse {
	const options = getOptions(optionsOverride);

	if (options.preventDuplicates && activeMessages.has(message)) {
		return null as unknown as ToastResponse;
	}
	activeMessages.add(message);

	toastId++;
	const id = toastId;

	const c = getContainer(options);

	const toast = document.createElement("div");
	toast.id = `toast-${id}`;
	toast.className = `toast toast-${type}`;
	toast.setAttribute(
		"role",
		type === "error" || type === "warning" ? "alert" : "status",
	);
	toast.setAttribute(
		"aria-live",
		type === "error" || type === "warning" ? "assertive" : "polite",
	);
	toast.setAttribute("aria-atomic", "true");
	toast.setAttribute("data-animation", options.animation);
	if (options.rtl) toast.classList.add("rtl");

	// Progress bar
	let progressEl: HTMLElement | null = null;
	if (options.progressBar) {
		progressEl = document.createElement("div");
		progressEl.className = "toast-progress";
		toast.appendChild(progressEl);
	}

	// Close button
	let closeEl: HTMLElement | null = null;
	if (options.closeButton) {
		const wrapper = document.createElement("div");
		wrapper.innerHTML = options.closeHtml;
		closeEl = wrapper.firstElementChild as HTMLElement;
		closeEl.className = "toast-close-button";
		toast.appendChild(closeEl);
	}

	// Title
	if (title) {
		const titleEl = document.createElement("div");
		titleEl.className = "toast-title";
		if (options.allowHtml) {
			titleEl.innerHTML = title;
		} else {
			titleEl.textContent = title;
		}
		toast.appendChild(titleEl);
	}

	// Message
	if (message) {
		const msgEl = document.createElement("div");
		msgEl.className = "toast-message";
		if (options.allowHtml) {
			msgEl.innerHTML = message;
		} else {
			msgEl.textContent = message;
		}
		toast.appendChild(msgEl);
	}

	if (options.newestOnTop) {
		c.insertBefore(toast, c.firstChild);
	} else {
		c.appendChild(toast);
	}

	// Double-RAF so CSS animation triggers correctly
	requestAnimationFrame(() => {
		requestAnimationFrame(() => toast.classList.add("toast-shown"));
	});

	let resolveDismiss!: () => void;
	const dismissPromise = new Promise<void>((r) => {
		resolveDismiss = r;
	});

	const response: ToastResponse = {
		toastId: id,
		type,
		message,
		title,
		state: "visible",
		startTime: new Date(),
		options,
		onDismissed: dismissPromise,
	};

	// ── Timers & progress ──────────────────────────────────────────────────────

	let hideTimer: ReturnType<typeof setTimeout> | null = null;
	let hasTransitioned = false;

	function startHideTimer(duration: number) {
		if (duration <= 0) return;
		hideTimer = setTimeout(() => hideToast(false), duration);
		if (progressEl) {
			progressEl.style.transition = "none";
			progressEl.style.width = "100%";
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					hasTransitioned = true;
					progressEl!.style.transition = `width ${duration}ms linear`;
					progressEl!.style.width = "0%";
				});
			});
		}
	}

	function clearTimers() {
		if (hideTimer) clearTimeout(hideTimer);
		hideTimer = null;
		if (progressEl && hasTransitioned) {
			const currentWidth = window.getComputedStyle(progressEl).width;
			progressEl.style.transition = "none";
			progressEl.style.width = currentWidth;
		}
	}

	function hideToast(force = false) {
		if (
			!force &&
			document.activeElement &&
			toast.contains(document.activeElement)
		)
			return;
		clearTimers();
		toast.classList.remove("toast-shown");
		toast.classList.add("toast-hiding");

		if (
			typeof toast.getAnimations === "function" &&
			toast.getAnimations().length
		) {
			Promise.all(toast.getAnimations().map((a) => a.finished))
				.then(removeToast)
				.catch(removeToast);
		} else {
			toast.addEventListener("animationend", function handler(e) {
				if (e.target !== toast) return;
				toast.removeEventListener("animationend", handler);
				removeToast();
			});
			setTimeout(removeToast, 500);
		}
	}

	function removeToast() {
		if (!toast.parentNode) return;
		toast.remove();
		activeMessages.delete(message);
		response.state = "hidden";
		response.endTime = new Date();
		if (options.onHidden) options.onHidden();
		resolveDismiss();
		if (container && container.children.length === 0) {
			container.remove();
			container = null;
		}
	}

	// ── Events ─────────────────────────────────────────────────────────────────

	if (options.closeOnHover) {
		toast.addEventListener("mouseenter", () => {
			clearTimers();
			if (progressEl) progressEl.style.width = "100%";
		});
		toast.addEventListener("mouseleave", () => {
			startHideTimer(options.extendedTimeOut);
		});
	}

	if (closeEl) {
		closeEl.addEventListener("click", (e) => {
			e.stopPropagation();
			if (options.onCloseClick) options.onCloseClick(e as MouseEvent);
			hideToast(true);
		});
	}

	if (!options.onclick && options.tapToDismiss) {
		toast.addEventListener("click", () => hideToast(true));
	}

	if (options.onclick) {
		toast.addEventListener("click", (e) => {
			options.onclick!(e as MouseEvent);
			hideToast(true);
		});
	}

	toast.setAttribute("tabindex", "0");
	toast.addEventListener("keydown", (e) => {
		if (e.key === "Escape") hideToast(true);
	});

	// ── Start ──────────────────────────────────────────────────────────────────

	startHideTimer(options.timeOut);
	if (options.onShown) setTimeout(options.onShown, 300);

	return response;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const toastr = {
	options: {} as ToastrOptions,

	success(
		message: string,
		title?: string,
		options?: ToastrOptions,
	): ToastResponse {
		return notify("success", message, title, options);
	},

	error(
		message: string,
		title?: string,
		options?: ToastrOptions,
	): ToastResponse {
		return notify("error", message, title, options);
	},

	info(
		message: string,
		title?: string,
		options?: ToastrOptions,
	): ToastResponse {
		return notify("info", message, title, options);
	},

	warning(
		message: string,
		title?: string,
		options?: ToastrOptions,
	): ToastResponse {
		return notify("warning", message, title, options);
	},

	remove(): void {
		if (container) {
			container.remove();
			container = null;
			activeMessages.clear();
		}
	},

	clear(): void {
		if (!container) return;
		Array.from(container.children).forEach((child) => {
			(child as HTMLElement).classList.remove("toast-shown");
			(child as HTMLElement).classList.add("toast-hiding");
		});
		setTimeout(() => toastr.remove(), 800);
	},

	version: "3.0.0",
};

export default toastr;
