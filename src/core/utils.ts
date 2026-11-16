import type { ComponentPublicInstance } from 'vue';

/**
 * Whether development warnings should be printed.
 * Bundlers replace `process.env.NODE_ENV`, so warnings are removed from
 * production builds. Where `process` does not exist (e.g. the UMD build
 * loaded with a <script> tag) warnings stay on, as before.
 */
export const isDev: boolean = (() => {
  try {
    return process.env.NODE_ENV !== 'production';
  } catch {
    return true;
  }
})();

export function warn(message: string): void {
  if (isDev) console.warn(`vue-emerge: ${message}`);
}

/** `document.querySelector` that never throws on an invalid selector. */
export function safeQuerySelector(selector: string): Element | null {
  if (typeof document === 'undefined') return null;
  try {
    return document.querySelector(selector);
  } catch {
    warn(`"${selector}" is not a valid CSS selector.`);
    return null;
  }
}

const OFFSET_RE = /^-?(\d+(\.\d+)?|\.\d+)(px|%)$/;

/**
 * Builds the `rootMargin` used by the IntersectionObserver from `triggerOffset`.
 * IntersectionObserver only accepts `px` and `%`; any other value (e.g. `2rem`
 * or `100`) used to throw and leave the element invisible. Invalid values now
 * fall back to `0px` with a warning.
 */
export function toRootMargin(triggerOffset: string | undefined): string {
  let offset = (triggerOffset ?? '0px').trim();
  if (offset === '0' || offset === '') offset = '0px';
  if (!OFFSET_RE.test(offset)) {
    warn(`triggerOffset "${triggerOffset}" is invalid. Use a value in px or % (e.g. "100px" or "-10%"). Falling back to "0px".`);
    offset = '0px';
  }
  return `0px 0px ${offset} 0px`;
}

/** Resolves a template ref (element or component instance) to a DOM element. */
export function resolveElement(target: unknown): Element | null {
  if (!target) return null;
  if (typeof Element !== 'undefined' && target instanceof Element) return target;
  if (typeof target === 'object' && '$el' in (target as object)) {
    const el = (target as ComponentPublicInstance).$el;
    if (typeof Element !== 'undefined' && el instanceof Element) return el;
  }
  return null;
}
