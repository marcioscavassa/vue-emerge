import type { App, Plugin } from 'vue';
import Emerge from './component/Emerge.vue';
import { vEmerge } from './directive';
import { EMERGE_DEFAULTS_KEY, type EmergeDefaults } from './core/defaults';

export interface EmergePluginOptions {
  /** Default values applied to every `<Emerge>` that does not set the prop explicitly. */
  defaults?: EmergeDefaults;
}

const plugin: Plugin<[EmergePluginOptions?]> = {
  install(app: App, options?: EmergePluginOptions) {
    app.component('Emerge', Emerge);
    if (!app.directive('emerge')) app.directive('emerge', vEmerge);
    if (options?.defaults) app.provide(EMERGE_DEFAULTS_KEY, options.defaults);
  },
};

export { Emerge, vEmerge };
export { useEmerge } from './composables/useEmerge';
export type { EmergeOptions } from './core/watchVisibility';
export type { AnimationDirection } from './core/animation';
export type { EmergeDefaults } from './core/defaults';
export type { EmergeDirectiveOptions } from './directive';
export type EmergeProps = InstanceType<typeof Emerge>['$props'];

export default plugin;

declare module 'vue' {
  export interface GlobalComponents {
    Emerge: typeof Emerge;
  }
  export interface GlobalDirectives {
    vEmerge: typeof vEmerge;
  }
}
