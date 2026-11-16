<template>
  <component :is="tag" ref="element" :style="componentStyles" :class="classes" v-bind="componentProps">
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref, watch, type Component, type PropType } from 'vue';
  import { useEmerge } from '../composables/useEmerge';
  import {
    ANIMATION_NAME,
    animationTimeout,
    animationVariables,
    endsAtRest,
    initialTransform,
    type AnimationDirection,
    type AnimationOptions,
  } from '../core/animation';
  import { globalDefault } from '../core/defaults';
  import { resolveElement } from '../core/utils';

  defineOptions({ name: 'Emerge' });

  const props = defineProps({
    root: {
      type: String,
      default: () => globalDefault('root', undefined),
    },
    triggerOffset: {
      type: String,
      default: () => globalDefault('triggerOffset', '0px'),
    },
    threshold: {
      type: [Number, Array] as PropType<number | number[]>,
      default: () => globalDefault('threshold', 0),
      validator: (value: number | number[]) => {
        const isValidNumber = (num: number) => typeof num === 'number' && num >= 0 && num <= 1;
        return Array.isArray(value) ? value.every(isValidNumber) : isValidNumber(value);
      },
    },
    trigger: {
      type: String,
      default: () => globalDefault('trigger', undefined),
    },
    tag: {
      type: [String, Object] as PropType<string | Component>,
      default: () => globalDefault('tag', 'div'),
    },
    direction: {
      type: String as PropType<AnimationDirection>,
      default: () => globalDefault('direction', 'vertical'),
      validator: (value: string) => ['vertical', 'horizontal'].includes(value),
    },
    moveAmount: {
      type: String,
      default: () => globalDefault('moveAmount', '3rem'),
    },
    finalMoveAmount: {
      type: String,
      default: () => globalDefault('finalMoveAmount', '0'),
    },
    animationDuration: {
      type: Number,
      default: () => globalDefault('animationDuration', 1000),
    },
    animationDelay: {
      type: Number,
      default: () => globalDefault('animationDelay', 0),
    },
    timingFunction: {
      type: String,
      default: () => globalDefault('timingFunction', 'ease'),
    },
    blockHoverOnEnter: {
      type: Boolean,
      default: () => globalDefault('blockHoverOnEnter', true),
    },
    componentProps: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({}),
    },
    /** When `false`, the element animates again every time it re-enters the viewport. */
    once: {
      type: Boolean,
      default: () => globalDefault('once', true),
    },
    /** Shows the content immediately, without animation. */
    disabled: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits<{
    /** The element entered the viewport and its animation started. */
    (e: 'visible'): void;
    /** The entrance animation finished. */
    (e: 'animation-end'): void;
  }>();

  type State = 'hidden' | 'animating' | 'completed';

  const element = ref<HTMLElement | null>(null);
  const state = ref<State>('hidden');

  const animation = computed<AnimationOptions>(() => ({
    direction: props.direction,
    moveAmount: props.moveAmount,
    finalMoveAmount: props.finalMoveAmount,
    animationDuration: props.animationDuration,
    animationDelay: props.animationDelay,
    timingFunction: props.timingFunction,
    blockHoverOnEnter: props.blockHoverOnEnter,
  }));

  const { isVisible } = useEmerge(element, () => ({
    root: props.root,
    triggerOffset: props.triggerOffset,
    threshold: props.threshold,
    trigger: props.trigger,
    once: props.once,
  }));

  let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
  const clearFallback = () => {
    if (fallbackTimer !== undefined) clearTimeout(fallbackTimer);
    fallbackTimer = undefined;
  };

  const complete = () => {
    clearFallback();
    if (state.value !== 'animating') return;
    state.value = 'completed';
    emit('animation-end');
  };

  const start = () => {
    if (state.value !== 'hidden') return;
    state.value = 'animating';
    emit('visible');
    // Safety net in case `animationend` never fires (e.g. the animation is overridden by user CSS).
    fallbackTimer = setTimeout(complete, animationTimeout(animation.value));
  };

  const reset = () => {
    clearFallback();
    state.value = 'hidden';
  };

  watch(isVisible, (visible) => (visible ? start() : reset()));

  const onAnimationEnd = (event: Event) => {
    const e = event as AnimationEvent;
    if (e.target === e.currentTarget && e.animationName === ANIMATION_NAME) complete();
  };

  // Keyboard users may focus content before it is revealed: reveal it right away.
  const onFocusIn = () => {
    if (state.value === 'hidden' && !props.disabled) isVisible.value = true;
  };

  let listenedElement: Element | null = null;
  onMounted(() => {
    listenedElement = resolveElement(element.value);
    listenedElement?.addEventListener('animationend', onAnimationEnd);
    listenedElement?.addEventListener('focusin', onFocusIn);
  });

  onUnmounted(() => {
    clearFallback();
    listenedElement?.removeEventListener('animationend', onAnimationEnd);
    listenedElement?.removeEventListener('focusin', onFocusIn);
  });

  const isSettled = computed(() => state.value === 'completed' && endsAtRest(animation.value));

  const classes = computed(() => [
    'vue-emerge',
    {
      'vue-emerge--animated': state.value !== 'hidden' && !props.disabled,
      'vue-emerge--animation-completed': state.value === 'completed' && !props.disabled,
      'vue-emerge--settled': isSettled.value && !props.disabled,
      'vue-emerge--disabled': props.disabled,
    },
  ]);

  const componentStyles = computed(() => {
    const variables = animationVariables(animation.value);
    if (props.disabled || isSettled.value) return variables;
    if (state.value === 'hidden') {
      return { opacity: '0', transform: initialTransform(animation.value), ...variables };
    }
    return { opacity: '0', ...variables };
  });
</script>
