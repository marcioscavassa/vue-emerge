import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';
import VueEmerge, { Emerge, vEmerge } from 'vue-emerge';
import { MockIntersectionObserver as IO } from './io-mock';

const flush = async () => {
  await Promise.resolve();
  await nextTick();
};

function animationEnd(el: Element, animationName = 'vue-emerge-animation') {
  const event = new Event('animationend', { bubbles: true }) as AnimationEvent;
  Object.defineProperty(event, 'animationName', { value: animationName });
  el.dispatchEvent(event);
}

const original = window.IntersectionObserver;

beforeEach(() => {
  IO.reset();
  (window as any).IntersectionObserver = IO;
  document.body.innerHTML = '';
});

afterEach(() => {
  (window as any).IntersectionObserver = original;
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('<Emerge> behavior', () => {
  it('starts the animation when the element enters the viewport', async () => {
    const wrapper = mount(Emerge, { attachTo: document.body });
    const el = wrapper.element as HTMLElement;
    expect(el.classList.contains('vue-emerge--animated')).toBe(false);

    IO.fire(el, true);
    await flush();

    expect(el.classList.contains('vue-emerge--animated')).toBe(true);
    expect(el.style.transform).toBe('');
    expect(wrapper.emitted('visible')).toHaveLength(1);
    wrapper.unmount();
  });

  it('removes the leftover transform and inline opacity once the animation ends (B2)', async () => {
    const wrapper = mount(Emerge, { attachTo: document.body });
    const el = wrapper.element as HTMLElement;
    IO.fire(el, true);
    await flush();
    expect(el.style.opacity).toBe('0');

    animationEnd(el);
    await flush();

    expect(el.classList.contains('vue-emerge--animation-completed')).toBe(true);
    expect(el.classList.contains('vue-emerge--settled')).toBe(true);
    expect(el.style.opacity).toBe('');
    expect(wrapper.emitted('animation-end')).toHaveLength(1);
    wrapper.unmount();
  });

  it('keeps the final transform when finalMoveAmount is not zero', async () => {
    const wrapper = mount(Emerge, { props: { finalMoveAmount: '1rem' }, attachTo: document.body });
    const el = wrapper.element as HTMLElement;
    IO.fire(el, true);
    await flush();
    animationEnd(el);
    await flush();
    expect(el.classList.contains('vue-emerge--animation-completed')).toBe(true);
    expect(el.classList.contains('vue-emerge--settled')).toBe(false);
    wrapper.unmount();
  });

  it('ignores animationend events bubbling from children', async () => {
    const wrapper = mount(Emerge, { slots: { default: () => h('span') }, attachTo: document.body });
    const el = wrapper.element as HTMLElement;
    IO.fire(el, true);
    await flush();
    animationEnd(el.querySelector('span')!);
    await flush();
    expect(el.classList.contains('vue-emerge--animation-completed')).toBe(false);
    wrapper.unmount();
  });

  it('completes through the safety timer when animationend never fires', async () => {
    vi.useFakeTimers();
    const wrapper = mount(Emerge, { props: { animationDuration: 500, animationDelay: 100 }, attachTo: document.body });
    const el = wrapper.element as HTMLElement;
    IO.fire(el, true);
    await flush();
    vi.advanceTimersByTime(500 + 100 + 250);
    await flush();
    expect(el.classList.contains('vue-emerge--animation-completed')).toBe(true);
    wrapper.unmount();
  });

  it('also marks completion when blockHoverOnEnter is false', async () => {
    const wrapper = mount(Emerge, { props: { blockHoverOnEnter: false }, attachTo: document.body });
    const el = wrapper.element as HTMLElement;
    IO.fire(el, true);
    await flush();
    animationEnd(el);
    await flush();
    expect(el.classList.contains('vue-emerge--animation-completed')).toBe(true);
    expect(el.style.getPropertyValue('--vue-emerge-pointer-events')).toBe('auto');
    wrapper.unmount();
  });

  it('shares one observer between instances with the same options (P1)', async () => {
    const App = defineComponent({
      render: () =>
        h(
          'div',
          Array.from({ length: 50 }, (_, i) => h(Emerge, { key: i }))
        ),
    });
    const wrapper = mount(App, { attachTo: document.body });
    await flush();
    expect(IO.active()).toHaveLength(1);
    expect(IO.active()[0].targets.size).toBe(50);
    wrapper.unmount();
    expect(IO.active()).toHaveLength(0);
  });

  it('shares one observer when many instances use the same trigger', async () => {
    const trigger = document.createElement('div');
    trigger.className = 'list';
    document.body.appendChild(trigger);
    const App = defineComponent({
      render: () =>
        h(
          'div',
          Array.from({ length: 10 }, (_, i) => h(Emerge, { key: i, trigger: '.list' }))
        ),
    });
    const wrapper = mount(App, { attachTo: document.body });
    await flush();
    expect(IO.active()).toHaveLength(1);
    IO.fire(trigger, true);
    await flush();
    expect(wrapper.findAll('.vue-emerge--animated')).toHaveLength(10);
    wrapper.unmount();
  });

  it('replays the trigger state to instances mounted later', async () => {
    const trigger = document.createElement('div');
    trigger.id = 'late';
    document.body.appendChild(trigger);
    const show = ref(false);
    const App = defineComponent({
      render: () => h('div', [h(Emerge, { trigger: '#late', once: false }), show.value ? h(Emerge, { trigger: '#late', class: 'second' }) : null]),
    });
    const wrapper = mount(App, { attachTo: document.body });
    await flush();
    IO.fire(trigger, true);
    await flush();
    show.value = true;
    await flush();
    await flush();
    expect(wrapper.find('.second').classes()).toContain('vue-emerge--animated');
    wrapper.unmount();
  });

  it('does not break with an invalid triggerOffset (B1)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const wrapper = mount(Emerge, { props: { triggerOffset: '2rem' }, attachTo: document.body });
    await flush();
    expect(IO.active()[0].rootMargin).toBe('0px 0px 0px 0px');
    expect(warn).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('passes valid px and % offsets through', async () => {
    const a = mount(Emerge, { props: { triggerOffset: '-100px' }, attachTo: document.body });
    const b = mount(Emerge, { props: { triggerOffset: '10%' }, attachTo: document.body });
    await flush();
    expect(IO.active().map((io) => io.rootMargin)).toEqual(['0px 0px -100px 0px', '0px 0px 10% 0px']);
    a.unmount();
    b.unmount();
  });

  it('does not break with an invalid selector (B4)', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const wrapper = mount(Emerge, { props: { trigger: '#1-item', root: '[[' }, attachTo: document.body });
    await flush();
    expect(IO.active()[0].targets.has(wrapper.element)).toBe(true);
    wrapper.unmount();
  });

  it('shows the content when IntersectionObserver is not available (B4)', async () => {
    (window as any).IntersectionObserver = undefined;
    const wrapper = mount(Emerge, { attachTo: document.body });
    await flush();
    expect(wrapper.classes()).toContain('vue-emerge--animated');
    wrapper.unmount();
  });

  it('shows the content when the observer cannot be created', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    IO.throwOnCreate = new SyntaxError('bad options');
    const wrapper = mount(Emerge, { attachTo: document.body });
    await flush();
    expect(wrapper.classes()).toContain('vue-emerge--animated');
    wrapper.unmount();
  });

  it('reacts to animation prop changes after mount (B5)', async () => {
    const wrapper = mount(Emerge, { props: { animationDelay: 0 }, attachTo: document.body });
    await wrapper.setProps({ animationDelay: 300, animationDuration: 600, timingFunction: 'linear' });
    const el = wrapper.element as HTMLElement;
    expect(el.style.getPropertyValue('--vue-emerge-animation-delay')).toBe('300ms');
    expect(el.style.getPropertyValue('--vue-emerge-animation-duration')).toBe('600ms');
    expect(el.style.getPropertyValue('--vue-emerge-timing-function')).toBe('linear');
    wrapper.unmount();
  });

  it('animates again on re-entry when once is false', async () => {
    const wrapper = mount(Emerge, { props: { once: false }, attachTo: document.body });
    const el = wrapper.element as HTMLElement;
    IO.fire(el, true);
    await flush();
    expect(wrapper.classes()).toContain('vue-emerge--animated');
    IO.fire(el, false);
    await flush();
    expect(wrapper.classes()).not.toContain('vue-emerge--animated');
    expect(el.style.transform).toBe('translateY(3rem)');
    IO.fire(el, true);
    await flush();
    expect(wrapper.classes()).toContain('vue-emerge--animated');
    wrapper.unmount();
  });

  it('stops observing after the first entry by default', async () => {
    const wrapper = mount(Emerge, { attachTo: document.body });
    IO.fire(wrapper.element, true);
    await flush();
    expect(IO.active()).toHaveLength(0);
    wrapper.unmount();
  });

  it('renders content visible and static when disabled', async () => {
    const wrapper = mount(Emerge, { props: { disabled: true }, attachTo: document.body });
    const el = wrapper.element as HTMLElement;
    expect(el.style.opacity).toBe('');
    expect(el.style.transform).toBe('');
    expect(wrapper.classes()).toContain('vue-emerge--disabled');
    wrapper.unmount();
  });

  it('reveals the content when it receives keyboard focus (A2)', async () => {
    const wrapper = mount(Emerge, { slots: { default: () => h('a', { href: '#' }, 'link') }, attachTo: document.body });
    wrapper.find('a').element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await flush();
    expect(wrapper.classes()).toContain('vue-emerge--animated');
    wrapper.unmount();
  });

  it('clears the safety timer on unmount (B6)', async () => {
    vi.useFakeTimers();
    const wrapper = mount(Emerge, { attachTo: document.body });
    IO.fire(wrapper.element, true);
    await flush();
    expect(vi.getTimerCount()).toBe(1);
    wrapper.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('plugin options', () => {
  it('applies global defaults to props that are not set', () => {
    const wrapper = mount(defineComponent({ render: () => h('div', [h(Emerge, { class: 'a' }), h(Emerge, { class: 'b', animationDuration: 200 })]) }), {
      global: { plugins: [[VueEmerge, { defaults: { animationDuration: 600, moveAmount: '10px' } }]] },
      attachTo: document.body,
    });
    const a = wrapper.find('.a').element as HTMLElement;
    const b = wrapper.find('.b').element as HTMLElement;
    expect(a.style.getPropertyValue('--vue-emerge-animation-duration')).toBe('600ms');
    expect(a.style.transform).toBe('translateY(10px)');
    expect(b.style.getPropertyValue('--vue-emerge-animation-duration')).toBe('200ms');
    wrapper.unmount();
  });

  it('registers the v-emerge directive without replacing an existing one', () => {
    const own = { mounted() {} };
    const wrapper = mount(defineComponent({ render: () => h('div') }), {
      global: { directives: { emerge: own }, plugins: [VueEmerge] },
    });
    expect(wrapper.vm.$.appContext.directives.emerge).toBe(own);
    wrapper.unmount();
  });
});

describe('v-emerge directive', () => {
  it('animates an element without a wrapper', async () => {
    const App = defineComponent({
      directives: { emerge: vEmerge },
      template: `<p v-emerge="{ direction: 'horizontal', moveAmount: '-20px' }">hi</p>`,
    });
    const wrapper = mount(App, { attachTo: document.body });
    const el = wrapper.element as HTMLElement;
    expect(el.classList.contains('vue-emerge')).toBe(true);
    expect(el.style.transform).toBe('translateX(-20px)');
    IO.fire(el, true);
    await flush();
    expect(el.classList.contains('vue-emerge--animated')).toBe(true);
    animationEnd(el);
    expect(el.classList.contains('vue-emerge--settled')).toBe(true);
    wrapper.unmount();
    expect(IO.active()).toHaveLength(0);
  });
});
