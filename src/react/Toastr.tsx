import { useEffect } from "react";
import { toastr } from "../toastr";
import type { ToastrOptions, ToastPosition } from "../types";

export interface ToastrProviderProps {
	position?: ToastPosition;
	defaults?: ToastrOptions;
	onReady?: (t: typeof toastr) => void;
}

export function ToastrProvider({
	position = "toast-top-right",
	defaults,
	onReady,
}: ToastrProviderProps) {
	useEffect(() => {
		toastr.options = { positionClass: position, ...defaults };
		onReady?.(toastr);
	}, [position, defaults, onReady]);

	return null;
}
