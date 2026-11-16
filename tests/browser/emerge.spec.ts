/**
 * Runs in real Chromium: real IntersectionObserver, real CSS animations and layout.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, h, nextTick, type App } from 'vue';
import { Emerge } from 'vue-emerge';

let app: App | null = null;
let host: HTMLElement;

function render(node: () => ReturnType<typeof h>) {
  host = document.createElement('div');
  document.body.appendChild(host);
  app = createApp({ render: node });
  app.mount(host);
}

const waitFor = async (check: () => boolean, timeout = 3000) => {
  const start = performance.now();
  while (!check()) {
    if (performance.now() - start > timeout) throw new Error('timed out');
    await new Promise((r) => setTimeout(r, 16));
  }
};

afterEach(() => {
  app?.unmount();
  host?.remove();
  app = null;
});

describe('<Emerge> in a real browser', () => {
  it('animates and settles with no leftover transform', async () => {
    render(() => h(Emerge, { animationDuration: 50, class: 'target' }, () => h('p', 'hi')));
    const el = document.querySelector('.target') as HTMLElement;
    await waitFor(() => el.classList.contains('vue-emerge--settled'));
    const style = getComputedStyle(el);
    expect(style.transform).toBe('none');
    expect(style.opacity).toBe('1');
  });

  it('keeps position: fixed descendants relative to the viewport (B2)', async () => {
    render(() =>
      h('div', { style: 'margin-top: 200px' }, [
        h(Emerge, { animationDuration: 30, class: 'target' }, () => h('div', { id: 'fixed', style: 'position: fixed; top: 0' }, 'fixed')),
      ])
    );
    const el = document.querySelector('.target') as HTMLElement;
    await waitFor(() => el.classList.contains('vue-emerge--settled'));
    await nextTick();
    expect(document.getElementById('fixed')!.getBoundingClientRect().top).toBe(0);
  });

  it('works with triggerOffset values that IntersectionObserver rejects (B1)', async () => {
    render(() => h(Emerge, { animationDuration: 30, triggerOffset: '2rem', class: 'target' }));
    const el = document.querySelector('.target') as HTMLElement;
    await waitFor(() => el.classList.contains('vue-emerge--animation-completed'));
  });

  it('does not animate elements below the fold until they are scrolled into view', async () => {
    render(() => h('div', [h('div', { style: 'height: 300vh' }), h(Emerge, { animationDuration: 30, class: 'target' }, () => 'low')]));
    const el = document.querySelector('.target') as HTMLElement;
    await new Promise((r) => setTimeout(r, 100));
    expect(el.classList.contains('vue-emerge--animated')).toBe(false);
    el.scrollIntoView();
    await waitFor(() => el.classList.contains('vue-emerge--animated'));
    window.scrollTo(0, 0);
  });

  it('does not inject a global [v-cloak] rule (B3)', () => {
    const rules = Array.from(document.styleSheets).flatMap((sheet) => Array.from(sheet.cssRules).map((r) => r.cssText));
    expect(rules.some((r) => r.includes('v-cloak'))).toBe(false);
    expect(rules.some((r) => r.includes('vue-emerge-animation'))).toBe(true);
  });
});
