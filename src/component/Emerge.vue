<template>
  <component style="opacity: 0" v-cloak :is="tag" ref="element" :class="['element', { 'element-animated': isVisible }]" v-bind="componentProps">
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, type Component, type PropType } from 'vue';
  import { useEmerge } from '../composables/useEmerge';

  type AnimationDirection = 'vertical' | 'horizontal';

  const props = defineProps({
    root: {
      type: String,
      default: undefined,
    },
    triggerOffset: {
      type: String,
      default: '-100px',
    },
    threshold: {
      type: [Number, Array] as PropType<number | number[]>,
      default: 0.1,
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
    componentProps: {
      type: Object,
      default: () => ({}),
    },
  });

  const element = ref<HTMLElement | null>(null);

  const { isVisible } = useEmerge(element, {
    root: props.root,
    triggerOffset: props.triggerOffset,
    threshold: props.threshold,
    trigger: props.trigger,
  });

  const initialTransform = computed(() => {
    const axis = props.direction === 'horizontal' ? 'X' : 'Y';
    return `translate${axis}(${props.moveAmount})`;
  });

  const animationProps = reactive({
    name: 'emerge-animation',
    duration: `${props.animationDuration}ms`,
    delay: `${props.animationDelay}ms`,
    timingFunction: props.timingFunction,
  });
</script>

<style>
  [v-cloak] {
    display: none;
  }

  @keyframes emerge-animation {
    from {
      opacity: 0;
      transform: v-bind('initialTransform');
    }
    to {
      opacity: 1;
      transform: translate(0, 0);
    }
  }
</style>

<style scoped>
  .element {
    opacity: 0;
    transform: v-bind('initialTransform');
  }

  .element-animated {
    animation-name: v-bind('animationProps.name');
    animation-duration: v-bind('animationProps.duration');
    animation-timing-function: v-bind('animationProps.timingFunction');
    animation-fill-mode: forwards;
    animation-delay: v-bind('animationProps.delay');
    transition: none;
  }
</style>
