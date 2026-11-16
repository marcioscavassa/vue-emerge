/**
 * API contract tests.
 *
 * These tests lock the public API that existing applications depend on:
 * package exports, plugin registration, prop names and defaults, and the
 * initial markup rendered on the client and on the server. A failure here
 * means a change would break existing users.
 */
import { describe, expect, it } from 'vitest';
import { createApp, createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { mount } from '@vue/test-utils';
import VueEmerge, { Emerge } from 'vue-emerge';

const EXPECTED_DEFAULTS: Record<string, unknown> = {
  root: undefined,
  triggerOffset: '0px',
  threshold: 0,
  trigger: undefined,
  tag: 'div',
  direction: 'vertical',
  moveAmount: '3rem',
  finalMoveAmount: '0',
  animationDuration: 1000,
  animationDelay: 0,
  timingFunction: 'ease',
  blockHoverOnEnter: true,
  componentProps: {},
};

describe('public API contract', () => {
  it('exports the component as a named export and the plugin as default', () => {
    expect(Emerge).toBeTruthy();
    expect(typeof VueEmerge.install).toBe('function');
  });

  it('registers the component globally as "Emerge" with app.use', () => {
    const app = createApp({ render: () => null });
    app.use(VueEmerge);
    expect(app.component('Emerge')).toBe(Emerge);
  });

  it('keeps every existing prop with the same default value', () => {
    const declared = (Emerge as any).props as Record<string, unknown>;
    const wrapper = mount(Emerge);
    const resolved = wrapper.vm.$props as Record<string, unknown>;
    for (const [name, expected] of Object.entries(EXPECTED_DEFAULTS)) {
      expect(declared, `prop "${name}" must exist`).toHaveProperty(name);
      expect(resolved[name], `default of "${name}"`).toEqual(expected);
    }
    wrapper.unmount();
  });

  it('renders the same initial client markup', () => {
    const wrapper = mount(Emerge, { slots: { default: () => h('p', 'hello') } });
    const el = wrapper.element as HTMLElement;
    expect(el.tagName).toBe('DIV');
    expect(el.classList.contains('vue-emerge')).toBe(true);
    expect(el.style.opacity).toBe('0');
    expect(el.style.transform).toBe('translateY(3rem)');
    expect(el.style.getPropertyValue('--vue-emerge-initial-transform')).toBe('translateY(3rem)');
    expect(el.style.getPropertyValue('--vue-emerge-final-transform')).toBe('translate(0, 0)');
    expect(el.style.getPropertyValue('--vue-emerge-animation-duration')).toBe('1000ms');
    expect(el.style.getPropertyValue('--vue-emerge-animation-delay')).toBe('0ms');
    expect(el.style.getPropertyValue('--vue-emerge-timing-function')).toBe('ease');
    expect(el.style.getPropertyValue('--vue-emerge-pointer-events')).toBe('none');
    expect(wrapper.find('p').text()).toBe('hello');
    wrapper.unmount();
  });

  it('honors tag, direction, moveAmount and componentProps', () => {
    const wrapper = mount(Emerge, {
      props: { tag: 'section', direction: 'horizontal', moveAmount: '-50px', componentProps: { id: 'x', 'data-a': '1' } },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.tagName).toBe('SECTION');
    expect(el.style.transform).toBe('translateX(-50px)');
    expect(el.id).toBe('x');
    expect(el.getAttribute('data-a')).toBe('1');
    wrapper.unmount();
  });

  it('renders the same initial markup on the server', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(Emerge, null, () => h('p', 'hi')) }));
    expect(html).toMatch(/^<div style="opacity:0;transform:translateY\(3rem\);/);
    expect(html).toContain('--vue-emerge-initial-transform:translateY(3rem);');
    expect(html).toContain('class="vue-emerge"');
    expect(html).toContain('<p>hi</p>');
  });
});
