import { onMounted, onUnmounted, ref, type ComponentPublicInstance, type Ref } from 'vue';
import { watchVisibility, type EmergeOptions } from '../core/watchVisibility';

export type { EmergeOptions };

/**
 * Tracks when an element enters the viewport.
 *
 * ```ts
 * const el = ref<HTMLElement | null>(null);
 * const { isVisible } = useEmerge(el, { threshold: 0.5 });
 * ```
 *
 * Options are read once, when the component mounts.
 */
export function useEmerge(
  elementRef: Ref<HTMLElement | Element | ComponentPublicInstance | null | undefined>,
  options: EmergeOptions | (() => EmergeOptions) = {}
) {
  const isVisible = ref(false);
  let stop: (() => void) | null = null;

  onMounted(() => {
    const resolved = typeof options === 'function' ? options() : options;
    stop = watchVisibility(elementRef.value, resolved, (visible) => {
      isVisible.value = visible;
    });
  });

  onUnmounted(() => {
    stop?.();
    stop = null;
  });

  return { isVisible };
}
