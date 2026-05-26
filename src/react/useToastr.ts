import { useCallback, useEffect, useRef } from "react";
import { toastr } from "../toastr";
import type { ToastrOptions, ToastResponse } from "../types";

export function useToastr(defaults?: ToastrOptions): {
	success: (
		message: string,
		title?: string,
		options?: ToastrOptions,
	) => ToastResponse;
	info: (
		message: string,
		title?: string,
		options?: ToastrOptions,
	) => ToastResponse;
	warning: (
		message: string,
		title?: string,
		options?: ToastrOptions,
	) => ToastResponse;
	error: (
		message: string,
		title?: string,
		options?: ToastrOptions,
	) => ToastResponse;
	clear: () => void;
	remove: () => void;
} {
	const defaultsRef = useRef(defaults);
	useEffect(() => {
		defaultsRef.current = defaults;
	}, [defaults]);

	const success = useCallback(
		(message: string, title?: string, options?: ToastrOptions) =>
			toastr.success(message, title, { ...defaultsRef.current, ...options }),
		[],
	);

	const info = useCallback(
		(message: string, title?: string, options?: ToastrOptions) =>
			toastr.info(message, title, { ...defaultsRef.current, ...options }),
		[],
	);

	const warning = useCallback(
		(message: string, title?: string, options?: ToastrOptions) =>
			toastr.warning(message, title, { ...defaultsRef.current, ...options }),
		[],
	);

	const error = useCallback(
		(message: string, title?: string, options?: ToastrOptions) =>
			toastr.error(message, title, { ...defaultsRef.current, ...options }),
		[],
	);

	const clear = useCallback(() => toastr.clear(), []);
	const remove = useCallback(() => toastr.remove(), []);

	return { success, info, warning, error, clear, remove };
}