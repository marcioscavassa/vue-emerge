import { isIntersectionObserverSupported, observe } from './observerPool';
import { resolveElement, safeQuerySelector, toRootMargin, warn } from './utils';

export interface EmergeOptions {
  /** CSS selector of the scrollable ancestor used as viewport. Defaults to the browser viewport. */
  root?: string;
  /** Bottom offset of the detection area, in `px` or `%`. Defaults to `'0px'`. */
  triggerOffset?: string;
  /** How much of the element must be visible (0 to 1). Defaults to `0`. */
  threshold?: number | number[];
  /** CSS selector of another element whose visibility triggers the animation. */
  trigger?: string;
  /** When `false`, visibility is tracked continuously instead of only the first time. Defaults to `true`. */
  once?: boolean;
}

/**
 * Starts tracking the visibility of `target` (or of `options.trigger`).
 * Calls `onChange(true)` when it enters and, if `once` is false, `onChange(false)` when it leaves.
 * Never throws: when detection is impossible the element is reported visible,
 * so content is never left hidden. Returns a function that stops tracking.
 */
export function watchVisibility(target: unknown, options: EmergeOptions, onChange: (visible: boolean) => void): () => void {
  const once = options.once !== false;

  if (!isIntersectionObserverSupported()) {
    onChange(true);
    return () => {};
  }

  let element: Element | null = null;
  if (options.trigger) {
    element = safeQuerySelector(options.trigger);
    if (!element) {
      warn(`Trigger element with selector "${options.trigger}" not found. Falling back to observing the component itself.`);
    }
  }
  if (!element) element = resolveElement(target);
  if (!element) {
    warn('The element to be observed is not a valid DOM node.');
    onChange(true);
    return () => {};
  }

  let root: Element | null = null;
  if (options.root) {
    root = safeQuerySelector(options.root);
    if (!root) {
      warn(`Root element with selector "${options.root}" not found. Falling back to the browser viewport.`);
    }
  }

  let stop: () => void = () => {};
  try {
    stop = observe(element, { root, rootMargin: toRootMargin(options.triggerOffset), threshold: options.threshold ?? 0 }, (entry) => {
      if (entry.isIntersecting) {
        onChange(true);
        if (once) stop();
      } else if (!once) {
        onChange(false);
      }
    });
  } catch (error) {
    warn(`Could not observe the element (${(error as Error).message}). Showing it without animation.`);
    onChange(true);
  }
  return () => stop();
}
