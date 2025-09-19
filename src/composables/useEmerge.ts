import { ref, onMounted, onUnmounted, type Ref, type ComponentPublicInstance } from 'vue';

interface EmergeOptions {
  root?: string;
  triggerOffset?: string;
  threshold?: number | number[];
  trigger?: string;
}

export function useEmerge(elementRef: Ref<HTMLElement | ComponentPublicInstance | null>, options: EmergeOptions = {}) {
  const isVisible = ref(false);
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    let elementToObserve: Element | null = null;

    if (options.trigger) {
      elementToObserve = document.querySelector(options.trigger);
      if (!elementToObserve) {
        console.warn(`vue-emerge: Trigger element with selector "${options.trigger}" not found. Falling back to observing the component itself.`);
      }
    }

    if (!elementToObserve) {
      if (!elementRef.value) return;
      elementToObserve = (elementRef.value as any).$el ?? elementRef.value;
    }

    if (!(elementToObserve instanceof Element)) {
      console.warn('vue-emerge: The element to be observed is not a valid DOM node.');
      return;
    }

    let rootElement: Element | null = null;
    if (options.root) {
      rootElement = document.querySelector(options.root);
      if (!rootElement) {
        console.warn(`vue-emerge: Root element with selector "${options.root}" not found. Falling back to the browser viewport.`);
      }
    }

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          isVisible.value = true;
          observer?.disconnect();
        }
      },
      {
        root: rootElement,
        rootMargin: `0px 0px ${options.triggerOffset || '-100px'} 0px`,
        threshold: options.threshold ?? 0.1,
      }
    );

    observer.observe(elementToObserve);
  });

  onUnmounted(() => {
    observer?.disconnect();
  });

  return {
    isVisible,
  };
}
