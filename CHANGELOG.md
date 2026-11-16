# Changelog

All notable changes to this project are documented here. The project follows [Semantic Versioning](https://semver.org/).

## Unreleased

No breaking changes: props, defaults, the `Emerge` export and `app.use(VueEmerge)` work as before.

### Fixed

- `triggerOffset` values the browser rejects (such as `2rem` or `100`) no longer leave the element invisible. They fall back to `0px` with a warning.
- After the animation, the element no longer keeps a `transform`. A leftover transform made `position: fixed` children (modals, dropdowns) position relative to the element and created a new stacking context.
- Removed the global `[v-cloak] { display: none }` rule injected into every app. The `v-cloak` attribute was dropped by the Vue compiler, so the rule had no effect on the component.
- Invalid CSS selectors in `trigger` or `root` and browsers without `IntersectionObserver` no longer break the component. The content is shown instead.
- `animationDuration`, `animationDelay` and `timingFunction` now react to changes after mount.
- The end of the animation is detected with the `animationend` event, with a timer as a safety net that is cleared on unmount.
- During `animationDelay` the element stays at its initial position (`animation-fill-mode: both`).
- `require('vue-emerge')` returned an empty object because the UMD file was parsed as ESM. CommonJS consumers now get `dist/vue-emerge.umd.cjs`.

### Changed

- The `vue-emerge--animation-completed` class is now also added when `blockHoverOnEnter` is `false`.
- Elements with the same options share one `IntersectionObserver` instead of creating one each.
- Warnings are printed only in development builds.
- Styles are no longer scoped, so the same CSS serves the component and the new directive. Selectors became less specific, which makes overriding them easier.

### Added

- `prefers-reduced-motion` support: elements fade in without moving.
- Content is revealed as soon as it receives keyboard focus.
- `once` prop (re-animate on every entry) and `disabled` prop (show without animation).
- `visible` and `animation-end` events.
- Global defaults: `app.use(VueEmerge, { defaults: { ... } })`.
- `v-emerge` directive and public `useEmerge` composable.
- `vue-emerge/no-css` entry and `vue-emerge/style.css` for strict Content Security Policies.
- Exported types (`EmergeProps`, `EmergeOptions`, `EmergeDefaults`, `AnimationDirection`, `EmergeDirectiveOptions`) and global component typing for templates.
- Tests (unit, browser and SSR), CI on Vue 3.2 to latest, lint, formatting and bundle size checks.
