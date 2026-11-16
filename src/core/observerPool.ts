/**
 * Shares IntersectionObserver instances between all elements that use the same
 * options (root, rootMargin and threshold). A list with hundreds of <Emerge>
 * items now uses a single observer instead of one per item.
 */

type Listener = (entry: IntersectionObserverEntry) => void;

interface Target {
  fns: Set<Listener>;
  /** Last entry seen for this element, replayed to late subscribers. */
  last?: IntersectionObserverEntry;
}

interface PoolEntry {
  observer: IntersectionObserver;
  listeners: Map<Element, Target>;
}

const pools = new Map<string, PoolEntry>();
const rootIds = new WeakMap<Element | Document, number>();
let nextRootId = 1;

function rootKey(root: Element | Document | null | undefined): string {
  if (!root) return 'viewport';
  let id = rootIds.get(root);
  if (!id) {
    id = nextRootId++;
    rootIds.set(root, id);
  }
  return String(id);
}

function keyFor(options: IntersectionObserverInit): string {
  const threshold = Array.isArray(options.threshold) ? options.threshold.join(',') : String(options.threshold ?? 0);
  return `${rootKey(options.root)}|${options.rootMargin ?? '0px'}|${threshold}`;
}

export const isIntersectionObserverSupported = (): boolean => typeof window !== 'undefined' && typeof window.IntersectionObserver !== 'undefined';

/**
 * Observes `element` and calls `listener` for each intersection change.
 * Returns a function that stops observing.
 * Throws if the browser rejects the options (callers must handle it).
 */
export function observe(element: Element, options: IntersectionObserverInit, listener: Listener): () => void {
  const key = keyFor(options);
  let pool = pools.get(key);

  if (!pool) {
    const listeners = new Map<Element, Target>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const target = listeners.get(entry.target);
        if (!target) continue;
        target.last = entry;
        // Copy: a listener may unsubscribe itself while we iterate.
        for (const fn of Array.from(target.fns)) fn(entry);
      }
    }, options);
    pool = { observer, listeners };
    pools.set(key, pool);
  }

  const { observer, listeners } = pool;
  let target = listeners.get(element);
  if (!target) {
    target = { fns: new Set() };
    listeners.set(element, target);
    observer.observe(element);
  }
  target.fns.add(listener);

  let active = true;

  // The element is already observed (e.g. a shared `trigger`): the observer will
  // not fire again until its state changes, so replay the last known entry.
  const replay = target.last;
  if (replay) {
    queueMicrotask(() => {
      if (active) listener(replay);
    });
  }

  return () => {
    if (!active) return;
    active = false;
    const current = listeners.get(element);
    if (!current) return;
    current.fns.delete(listener);
    if (current.fns.size === 0) {
      listeners.delete(element);
      observer.unobserve(element);
    }
    if (listeners.size === 0) {
      observer.disconnect();
      pools.delete(key);
    }
  };
}

/** @internal Used by tests. */
export function __poolSize(): number {
  return pools.size;
}
