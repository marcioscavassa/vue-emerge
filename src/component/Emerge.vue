<template>
  <component
    :is="tag"
    ref="element"
    v-cloak
    style="opacity: 0"
    :style="componentStyles"
    :class="['vue-emerge', { 'vue-emerge--animated': isVisible, 'vue-emerge--animation-completed': animationCompleted }]"
    v-bind="componentProps"
  >
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch, type Component, type PropType } from 'vue';
  import { useEmerge } from '../composables/useEmerge';

  type AnimationDirection = 'vertical' | 'horizontal';

  const props = defineProps({
    root: {
      type: String,
      default: undefined,
    },
    triggerOffset: {
      type: String,
      default: '0px',
    },
    threshold: {
      type: [Number, Array] as PropType<number | number[]>,
      default: 0.0,
      validator: (value: number | number[]) => {
        const isValidNumber = (num: number) => num >= 0 && num <= 1;
        return Array.isArray(value) ? value.every(isValidNumber) : isValidNumber(value);
      },
    },
    trigger: {
      type: String,
      default: undefined,
    },
    tag: {
      type: [String, Object] as PropType<string | Component>,
      default: 'div',
    },
    direction: {
      type: String as PropType<AnimationDirection>,
      default: 'vertical',
      validator: (value: string) => ['vertical', 'horizontal'].includes(value),
    },
    moveAmount: {
      type: String,
      default: '3rem',
    },
    finalMoveAmount: {
      type: String,
      default: '0',
    },
    animationDuration: {
      type: Number,
      default: 1000,
    },
    animationDelay: {
      type: Number,
      default: 0,
    },
    timingFunction: {
      type: String,
      default: 'ease',
    },
    blockHoverOnEnter: {
      type: Boolean,
      default: true,
    },
    componentProps: {
      type: Object,
      default: () => ({}),
    },
  });

  const element = ref<HTMLElement | null>(null);
  const animationCompleted = ref(false);

  const animationProps = reactive({
    name: 'vue-emerge-animation',
    duration: `${props.animationDuration}ms`,
    delay: `${props.animationDelay}ms`,
    timingFunction: props.timingFunction,
  });

  const { isVisible } = useEmerge(element, {
    root: props.root,
    triggerOffset: props.triggerOffset,
    threshold: props.threshold,
    trigger: props.trigger,
  });

  const onAnimationEnd = () => {
    animationCompleted.value = true;
  };

  watch(
    isVisible,
    (newValue) => {
      if (!!newValue) {
        if (!props.blockHoverOnEnter) return;
        setTimeout(() => {
          onAnimationEnd();
        }, props.animationDuration + props.animationDelay);
      }
    },
    { once: true }
  );

  const initialTransform = computed(() => {
    const axis = props.direction === 'horizontal' ? 'X' : 'Y';
    return `translate${axis}(${props.moveAmount})`;
  });

  const finalTransform = computed(() => {
    if (props.finalMoveAmount === '0' || !props.finalMoveAmount) {
      return 'translate(0, 0)';
    }
    const axis = props.direction === 'horizontal' ? 'X' : 'Y';
    return `translate${axis}(${props.finalMoveAmount})`;
  });

  const pointerEventsStyle = computed(() => (props.blockHoverOnEnter ? 'none' : 'auto'));

  const componentStyles = computed(() => {
    const cssVariables = {
      '--vue-emerge-initial-transform': initialTransform.value,
      '--vue-emerge-final-transform': finalTransform.value,
      '--vue-emerge-animation-name': animationProps.name,
      '--vue-emerge-animation-duration': animationProps.duration,
      '--vue-emerge-animation-delay': animationProps.delay,
      '--vue-emerge-timing-function': animationProps.timingFunction,
      '--vue-emerge-pointer-events': pointerEventsStyle.value,
    };
    if (!isVisible.value) {
      return {
        transform: initialTransform.value,
        ...cssVariables,
      };
    }
    return cssVariables;
  });
</script>

<style>
  [v-cloak] {
    display: none;
  }

  @keyframes vue-emerge-animation {
    from {
      opacity: 0;
      transform: var(--vue-emerge-initial-transform);
    }

    to {
      opacity: 1;
      transform: var(--vue-emerge-final-transform);
    }
  }
</style>

<style scoped>
  .vue-emerge--animated {
    animation-name: var(--vue-emerge-animation-name);
    animation-duration: var(--vue-emerge-animation-duration);
    animation-timing-function: var(--vue-emerge-timing-function);
    animation-fill-mode: forwards;
    animation-delay: var(--vue-emerge-animation-delay);
    pointer-events: var(--vue-emerge-pointer-events);
  }

  .vue-emerge--animated.vue-emerge--animation-completed {
    pointer-events: auto;
  }
</style>
