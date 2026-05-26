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
  /** 
   * Allow raw HTML injection in message/title. 
   * @default false (secure textContent by default) 
   */
  allowHtml?: boolean;
  /** 
   * @deprecated use allowHtml (defaults to false, enforcing strict text content) 
   */
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
  options: ToastrOptions;
  /** Resolves when the toast is dismissed */
  onDismissed: Promise<void>;
}
