import type { Directive } from 'vue';
import {
  ANIMATION_DEFAULTS,
  ANIMATION_NAME,
  animationTimeout,
  animationVariables,
  endsAtRest,
  initialTransform,
  type AnimationOptions,
} from './core/animation';
import { watchVisibility, type EmergeOptions } from './core/watchVisibility';

/** Options accepted by the `v-emerge` directive. Same names and defaults as the `<Emerge>` props. */
export type EmergeDirectiveOptions = EmergeOptions & Partial<AnimationOptions>;

interface DirectiveState {
  stop: () => void;
  timer?: ReturnType<typeof setTimeout>;
  cleanup: () => void;
}

const states = new WeakMap<HTMLElement, DirectiveState>();

const resolve = (value: EmergeDirectiveOptions | undefined | null): AnimationOptions => ({
  ...ANIMATION_DEFAULTS,
  ...Object.fromEntries(Object.entries(value ?? {}).filter(([, v]) => v !== undefined)),
});

function applyHidden(el: HTMLElement, o: AnimationOptions) {
  for (const [name, val] of Object.entries(animationVariables(o))) el.style.setProperty(name, val);
  el.style.opacity = '0';
  el.style.transform = initialTransform(o);
  el.classList.add('vue-emerge');
  el.classList.remove('vue-emerge--animated', 'vue-emerge--animation-completed', 'vue-emerge--settled');
}

/**
 * Animates an element without adding a wrapper:
 *
 * ```vue
 * <img v-emerge="{ direction: 'horizontal', moveAmount: '-50px' }" src="..." />
 * ```
 */
export const vEmerge: Directive<HTMLElement, EmergeDirectiveOptions | undefined> = {
  getSSRProps(binding) {
    const o = resolve(binding.value);
    return {
      class: 'vue-emerge',
      style: { opacity: '0', transform: initialTransform(o), ...animationVariables(o) },
    };
  },

  mounted(el, binding) {
    const options = binding.value ?? {};
    const o = resolve(options);
    applyHidden(el, o);

    const state: DirectiveState = { stop: () => {}, cleanup: () => {} };

    const complete = () => {
      if (state.timer !== undefined) clearTimeout(state.timer);
      state.timer = undefined;
      if (!el.classList.contains('vue-emerge--animated')) return;
      el.classList.add('vue-emerge--animation-completed');
      if (endsAtRest(o)) {
        el.classList.add('vue-emerge--settled');
        el.style.removeProperty('opacity');
      }
    };

    const start = () => {
      if (el.classList.contains('vue-emerge--animated')) return;
      el.style.removeProperty('transform');
      el.classList.add('vue-emerge--animated');
      state.timer = setTimeout(complete, animationTimeout(o));
    };

    const onAnimationEnd = (e: AnimationEvent) => {
      if (e.target === el && e.animationName === ANIMATION_NAME) complete();
    };
    const onFocusIn = () => start();

    el.addEventListener('animationend', onAnimationEnd);
    el.addEventListener('focusin', onFocusIn);
    state.cleanup = () => {
      el.removeEventListener('animationend', onAnimationEnd);
      el.removeEventListener('focusin', onFocusIn);
      if (state.timer !== undefined) clearTimeout(state.timer);
    };

    state.stop = watchVisibility(el, options, (visible) => {
      if (visible) start();
      else {
        if (state.timer !== undefined) clearTimeout(state.timer);
        applyHidden(el, o);
      }
    });
    states.set(el, state);
  },

  unmounted(el) {
    const state = states.get(el);
    if (!state) return;
    state.stop();
    state.cleanup();
    states.delete(el);
  },
};
