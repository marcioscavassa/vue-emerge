/** Minimal controllable IntersectionObserver for unit tests. */
export class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  static throwOnCreate: Error | null = null;

  readonly targets = new Set<Element>();
  readonly root: Element | null;
  readonly rootMargin: string;
  readonly thresholds: number[];

  constructor(
    private readonly callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {}
  ) {
    if (MockIntersectionObserver.throwOnCreate) throw MockIntersectionObserver.throwOnCreate;
    this.root = (options.root as Element) ?? null;
    this.rootMargin = options.rootMargin ?? '0px';
    this.thresholds = ([] as number[]).concat(options.threshold ?? 0);
    MockIntersectionObserver.instances.push(this);
  }

  observe(el: Element) {
    this.targets.add(el);
  }
  unobserve(el: Element) {
    this.targets.delete(el);
  }
  disconnect() {
    this.targets.clear();
  }
  takeRecords() {
    return [];
  }

  /** Fires an entry for `el` on every observer that watches it. */
  static fire(el: Element, isIntersecting: boolean) {
    for (const io of MockIntersectionObserver.instances) {
      if (!io.targets.has(el)) continue;
      io.callback([{ target: el, isIntersecting, intersectionRatio: isIntersecting ? 1 : 0 } as IntersectionObserverEntry], io as any);
    }
  }

  static active() {
    return MockIntersectionObserver.instances.filter((io) => io.targets.size > 0);
  }

  static reset() {
    MockIntersectionObserver.instances = [];
    MockIntersectionObserver.throwOnCreate = null;
  }
}
