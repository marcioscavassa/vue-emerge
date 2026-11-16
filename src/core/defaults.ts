import { getCurrentInstance, inject, type InjectionKey } from 'vue';
import type { AnimationDirection } from './animation';

/** Values that can be set globally with `app.use(VueEmerge, { defaults })`. */
export interface EmergeDefaults {
  root?: string;
  triggerOffset?: string;
  threshold?: number | number[];
  trigger?: string;
  tag?: string;
  direction?: AnimationDirection;
  moveAmount?: string;
  finalMoveAmount?: string;
  animationDuration?: number;
  animationDelay?: number;
  timingFunction?: string;
  blockHoverOnEnter?: boolean;
  once?: boolean;
}

export const EMERGE_DEFAULTS_KEY: InjectionKey<EmergeDefaults> = Symbol('vue-emerge-defaults');

/** Reads an app-level default, falling back to the built-in value. */
export function globalDefault<K extends keyof EmergeDefaults>(name: K, fallback: NonNullable<EmergeDefaults[K]> | undefined) {
  if (getCurrentInstance()) {
    const defaults = inject(EMERGE_DEFAULTS_KEY, null);
    const value = defaults?.[name];
    if (value !== undefined) return value;
  }
  return fallback;
}
