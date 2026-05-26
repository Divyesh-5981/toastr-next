import { useEffect, useRef } from "react";
import { toastr } from "../toastr";
import type { ToastrOptions, ToastPosition } from "../types";

export interface ToastrProviderProps {
	/**
	 * Shorthand for setting `positionClass` globally.
	 * Ignored if `options.positionClass` is also provided.
	 */
	position?: ToastPosition;
	/**
	 * Full options object applied globally — mirrors `toastr.options`.
	 * When provided, `position` is used as a fallback for `positionClass`.
	 */
	options?: ToastrOptions;
	/** @deprecated Use `options` instead. Will be merged into `options`. */
	defaults?: ToastrOptions;
	onReady?: (t: typeof toastr) => void;
}

export function ToastrProvider({
	position = "toast-top-right",
	options,
	defaults,
	onReady,
}: ToastrProviderProps) {
	const configRef = useRef({ position, options, defaults });

	useEffect(() => {
		configRef.current = { position, options, defaults };
	}, [position, options, defaults]);

	useEffect(() => {
		const curr = configRef.current;
		toastr.options = {
			positionClass: curr.position,
			...curr.defaults,
			...curr.options,
		};
		onReady?.(toastr);
	}, [onReady]);

	return null;
}
