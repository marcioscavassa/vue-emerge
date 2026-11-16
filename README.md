# vue-emerge

A lightweight and easy-to-use Vue 3 component to apply an "emerge" animation to your elements as they enter the viewport. It leverages the `IntersectionObserver` API for optimal performance, and also ships a `v-emerge` directive and a `useEmerge` composable.

[![npm version](https://badge.fury.io/js/vue-emerge.svg)](https://badge.fury.io/js/vue-emerge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Features

- **Component-Based:** A simple `<Emerge>` component to wrap your content.
- **Highly Customizable:** Control animation direction, duration, delay, distance, and more.
- **Performant:** Uses `IntersectionObserver` to trigger animations only when needed. Elements with the same options share a single observer, so long lists stay cheap.
- **Flexible Triggering:** Animate an element based on its own visibility or the visibility of another element.
- **Tag Agnostic:** Renders as a `div` by default, but can be configured to render any HTML tag or another component.
- **Nuxt & SSR Ready:** Designed to work flawlessly in server-side rendering environments.
- **Accessible:** Respects `prefers-reduced-motion` (fade only, no movement) and reveals content as soon as it receives keyboard focus.
- **Robust:** Invalid options never leave content hidden. If detection is impossible, the content is simply shown.

---

## Installation

Using npm:

```bash
npm install vue-emerge
```

Using yarn:

```bash
yarn add vue-emerge
```

### Global registration (optional)

You can import `<Emerge>` where you use it (as in the examples below) or register it once for the whole app. Registering the plugin also adds the `v-emerge` directive.

```js
import { createApp } from 'vue';
import VueEmerge from 'vue-emerge';
import App from './App.vue';

createApp(App).use(VueEmerge).mount('#app');
```

You can also set default values for every `<Emerge>` in the app. A prop set on a component always wins over these defaults.

```js
createApp(App)
  .use(VueEmerge, {
    defaults: { animationDuration: 600, moveAmount: '2rem', timingFunction: 'ease-out' },
  })
  .mount('#app');
```

With Nuxt 3, create `plugins/vue-emerge.ts`:

```ts
import VueEmerge from 'vue-emerge';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueEmerge);
});
```

Using a `<script>` tag (UMD build), the plugin is available as `VueEmerge.default` and the component as `VueEmerge.Emerge`:

```html
<script src="https://unpkg.com/vue@3"></script>
<script src="https://unpkg.com/vue-emerge"></script>
<script>
  Vue.createApp({}).use(VueEmerge.default).mount('#app');
</script>
```

---

## Basic Usage

The easiest way to use `vue-emerge` is by wrapping the content you want to animate with the `<Emerge>` component.

```vue
<template>
  <section>
    <h2>Scroll Down to See the Animation</h2>

    <Emerge>
      <h3>Hello, World!</h3>
      <p>This card will animate when it enters the viewport.</p>
    </Emerge>
  </section>
</template>

<script setup>
  import { Emerge } from 'vue-emerge';
</script>

<style scoped>
  section {
    padding-bottom: 10rem;
  }
  h2 {
    margin-bottom: 150vh;
  }
</style>
```

---

## API Reference

### `<Emerge />` Component Props

You can customize the animation behavior by passing props to the `<Emerge>` component.

| Prop                | Type                         | Default      | Description                                                                                                                                                                                              |
| ------------------- | ---------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `root`              | `string`                     | `undefined`  | A CSS selector for an element to act as the viewport for visibility checking. If omitted, the browser viewport is used.                                                                                  |
| `triggerOffset`     | `string`                     | `'0px'`      | Bottom offset of the detection area, in `px` or `%` only (other units such as `rem` are not supported by `IntersectionObserver`). A positive value triggers earlier, a negative value later.             |
| `threshold`         | `number \| number[]`         | `0.0`        | A number or array between 0.0 and 1.0 indicating how much of the element must be visible to trigger the animation.                                                                                       |
| `trigger`           | `string`                     | `undefined`  | A CSS selector for an element to act as the visibility trigger. The first matching element in the page is used.                                                                                          |
| `tag`               | `string \| Component`        | `'div'`      | The HTML tag or component to render as the wrapping element. For best compatibility (especially with Nuxt/SSR), it's recommended to use the default slot for complex content like images or form inputs. |
| `direction`         | `'vertical' \| 'horizontal'` | `'vertical'` | The direction of the emerge animation.                                                                                                                                                                   |
| `moveAmount`        | `string`                     | `'3rem'`     | The initial distance the element is translated (e.g., `'50px'`).                                                                                                                                         |
| `finalMoveAmount`   | `string`                     | `'0'`        | The final translated distance for the animation (e.g., `'1rem'`).                                                                                                                                        |
| `animationDuration` | `number`                     | `1000`       | The duration of the animation in milliseconds.                                                                                                                                                           |
| `animationDelay`    | `number`                     | `0`          | The delay before the animation starts in milliseconds.                                                                                                                                                   |
| `timingFunction`    | `string`                     | `'ease'`     | A valid CSS `animation-timing-function` value (e.g., `'ease-in-out'`, `'cubic-bezier(0.22, 1, 0.36, 1)'`).                                                                                               |
| `blockHoverOnEnter` | `boolean`                    | `true`       | When true, disables hover and other pointer events during the animation. Set to false to allow interaction while animating.                                                                              |
| `componentProps`    | `object`                     | `{}`         | Allows passing additional attributes or props to the rendered tag. Never build this object from untrusted user input: keys such as `innerHTML` are applied to the DOM.                                   |
| `once`              | `boolean`                    | `true`       | When `false`, the element animates again every time it re-enters the viewport.                                                                                                                           |
| `disabled`          | `boolean`                    | `false`      | Shows the content immediately, without animation.                                                                                                                                                        |

Regular attributes such as `class`, `id` or `aria-*` are passed straight to the rendered element, so `componentProps` is only needed for props of a custom `tag` component.

### Events

| Event           | Description                                                 |
| --------------- | ----------------------------------------------------------- |
| `visible`       | The element entered the viewport and its animation started. |
| `animation-end` | The entrance animation finished.                            |

```vue
<Emerge @visible="loadChart" @animation-end="onDone">
  <Chart />
</Emerge>
```

### CSS classes

| Class                             | When                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------- |
| `vue-emerge`                      | Always.                                                                      |
| `vue-emerge--animated`            | From the moment the element becomes visible.                                 |
| `vue-emerge--animation-completed` | After the animation ends.                                                    |
| `vue-emerge--settled`             | After the animation ends at its natural position (`finalMoveAmount` is `0`). |
| `vue-emerge--disabled`            | When `disabled` is `true`.                                                   |

Once settled, the element has no `transform` left, so `position: fixed` children (modals, dropdowns) and `z-index` behave normally. When `finalMoveAmount` is not `0`, the final `transform` has to stay applied and creates a containing block for `position: fixed` children.

---

## Advanced Usage

### Using with Form Inputs (`v-model`)

`vue-emerge` seamlessly works with form inputs. For maximum compatibility and to ensure reactivity, place the input element directly inside the `<Emerge>` component's slot.

```vue
<template>
  <p>Your name: {{ name }}</p>

  <Emerge>
    <input v-model="name" placeholder="Enter your name" />
  </Emerge>

  <p>Selected option: {{ selected }}</p>

  <Emerge>
    <select v-model="selected">
      <option>A</option>
      <option>B</option>
    </select>
  </Emerge>
</template>

<script setup>
  import { Emerge } from 'vue-emerge';
  import { ref } from 'vue';

  const name = ref('');
  const selected = ref('A');
</script>
```

---

### Customizing the Animation

Here's an example of a horizontal animation with a custom duration and delay.

```vue
<Emerge direction="horizontal" moveAmount="-50px" :animationDuration="800" :animationDelay="200" timingFunction="ease-out">
  <p>This text will slide in from the left.</p>
</Emerge>
```

### Using a Custom Trigger

You can make an element animate when a _different_ element becomes visible by using the `trigger` prop with a CSS selector.

```vue
<template>
  <section>
    <div id="section-trigger">Section Header</div>

    <Emerge trigger="#section-trigger">
      <p>This content appears when the section header above is in view.</p>
    </Emerge>
  </section>
</template>

<script setup>
  import { Emerge } from 'vue-emerge';
</script>

<style scoped>
  section {
    padding: 110vh 0 10rem 0;
  }
  #section-trigger {
    height: 200px;
  }
</style>
```

### Controlling the Trigger Point with `threshold`

By default, the animation triggers as soon as a small part of the element becomes visible. You can change this behavior with the `threshold` prop, which accepts a number between `0.0` (barely visible) and `1.0` (fully visible).

This is useful for delaying an animation until more of the element is on screen.

```vue
<template>
  <section>
    <h2>Scroll Down to See the Animation</h2>

    <Emerge :threshold="1">
      <img src="https://placehold.co/400x400" alt="A beautiful landscape" />
    </Emerge>
  </section>
</template>

<script setup>
  import { Emerge } from 'vue-emerge';
</script>

<style scoped>
  section {
    padding-bottom: 10rem;
  }
  div {
    margin-top: 110vh;
  }
</style>
```

### Staggered Animations in a List

You can create beautiful staggered animations for lists of items by using `<Emerge>` inside a `v-for` loop. The key is to combine a common `trigger` for the entire list with a dynamic `animationDelay` for each item.

In this example, all `<Emerge>` components watch a single parent element (`.features-list`). When that parent becomes visible, all items begin their animation in a staggered sequence.

```vue
<template>
  <section>
    <h2>Scroll Down to See the Animation</h2>

    <div class="features-list">
      <Emerge
        v-for="(feature, index) in features"
        :key="feature.id"
        trigger=".features-list"
        :animationDelay="index * 150"
        direction="horizontal"
        moveAmount="50px"
      >
        <div class="feature-item">
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </Emerge>
    </div>
  </section>
</template>

<script setup>
  import { Emerge } from 'vue-emerge';

  const features = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `Feature ${i + 1}`,
    description: `Description of feature ${i + 1}`,
  }));
</script>

<style scoped>
  section {
    padding-bottom: 10rem;
  }
  h2 {
    margin-bottom: 100vh;
  }
  .features-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .feature-item {
    padding: 1.5rem;
    background-color: #f8f9fa;
    border-left: 4px solid #007bff;
    border-radius: 4px;
    flex: 1 1 200px;
  }
</style>
```

**How it works:** Two props work together to create this effect:

1.  **`trigger=".features-list"`**: This prop tells every `<Emerge>` component inside the loop to start its animation only when the parent container with the class `.features-list` becomes visible. This is more performant and ensures the entire group animation is perfectly synchronized.

2.  **`:animationDelay="index * 150"`**: This line creates the staggered timing. For each item, we multiply its loop `index` (0, 1, 2, ...) by a base delay of **150ms**.
    - **Item 1 (index 0):** `0 * 150 = 0ms` delay.
    - **Item 2 (index 1):** `1 * 150 = 150ms` delay.
    - **Item 3 (index 2):** `2 * 150 = 300ms` delay.
    - And so on...

This combination creates a robust and smooth animation for the entire list as it enters the viewport.

### Animating Elements Inside a Scrollable Container

By default, `<Emerge>` tracks visibility relative to the browser's main viewport. However, you can track visibility relative to any scrollable ancestor element by using the `root` prop.

The `root` prop accepts a CSS selector for the scrollable container. This is perfect for elements inside scrollable tables, sidebars, or modal windows.

In this example, the rows will animate as you scroll **inside the `#table-container` div**.

```vue
<template>
  <div id="table-container">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Product</th>
        </tr>
      </thead>
      <tbody>
        <Emerge tag="tr" v-for="item in items" :key="item.id" root="#table-container" trigger-offset="0px" moveAmount="-4rem" direction="horizontal">
          <td>{{ item.id }}</td>
          <td>{{ item.product }}</td>
        </Emerge>
      </tbody>
    </table>
  </div>
</template>

<script setup>
  import { Emerge } from 'vue-emerge';

  const items = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    product: `Product Name ${i + 1}`,
  }));
</script>

<style>
  #table-container {
    border: 1px solid #ccc;
    max-height: 400px;
    overflow-y: scroll;
  }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  thead {
    background: #eee;
    position: sticky;
    top: 0px;
    z-index: 5;
  }
  th,
  td {
    border-bottom: 1px solid #eee;
    padding: 1rem;
    text-align: left;
  }
</style>
```

### The `v-emerge` directive

Use the directive when you do not want an extra wrapper element. It accepts the same options as the component props.

```vue
<template>
  <img v-emerge="{ direction: 'horizontal', moveAmount: '-50px' }" src="/photo.jpg" alt="" />
</template>

<script setup>
  import { vEmerge } from 'vue-emerge'; // not needed if you registered the plugin
</script>
```

### The `useEmerge` composable

For full control, `useEmerge` tells you when an element enters the viewport and leaves the styling to you.

```vue
<template>
  <div ref="box" :class="{ shown: isVisible }">...</div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useEmerge } from 'vue-emerge';

  const box = ref(null);
  const { isVisible } = useEmerge(box, { threshold: 0.5 });
</script>
```

---

## Accessibility

- When the operating system asks for reduced motion (`prefers-reduced-motion: reduce`), elements fade in without moving.
- Content inside a hidden `<Emerge>` is revealed as soon as it receives keyboard focus.
- With server-side rendering, content is sent hidden and revealed by JavaScript. To keep it visible for visitors without JavaScript, add this to your page `<head>`:

```html
<noscript>
  <style>
    .vue-emerge {
      opacity: 1 !important;
      transform: none !important;
    }
  </style>
</noscript>
```

## Content Security Policy

By default the styles are injected at runtime with a `<style>` tag. If your `style-src` policy does not allow that, import the entry without injection and load the stylesheet as a file:

```js
import VueEmerge, { Emerge } from 'vue-emerge/no-css';
import 'vue-emerge/style.css';
```

Use one entry or the other across your app, not both.

---

## Troubleshooting

Encountered an unexpected issue? Here are some common problems and their solutions.

### 1. The element doesn't animate or appear on the screen.

This can happen if the `moveAmount` value is so large that it pushes the element completely outside the viewport. When this occurs, the `IntersectionObserver` (the API used for visibility detection) may fail to register it.

**Solutions:**

- **Option A: Reduce the `moveAmount`**
  Try using a smaller value to ensure that at least a small part of the element remains within the initial detection area.

- **Option B: Use a `trigger`**
  Set a parent or a nearby visible element as the animation trigger. This way, the animation will start when the _trigger_ becomes visible, regardless of the animated element's initial off-screen position.

```vue
<template>
  <div class="visible-container">
    <Emerge trigger=".visible-container" moveAmount="110vw">
      <p>Animated Content</p>
    </Emerge>
  </div>
</template>
```

### 2. With `threshold: 1` the element never animates.

A threshold of `1` means the whole element must be visible. An element taller than the viewport (or than its `root` container) can never be fully visible, so it never triggers. Use a lower threshold such as `0.25` for tall elements.

### 3. Every item in a list animates together with the first one.

`trigger` uses `document.querySelector`, which returns the **first** matching element in the page. If each item uses a shared selector like `trigger=".card"`, all of them watch the first card. Give each trigger a unique id (for example ``:trigger="`#card-${item.id}`"``), or omit `trigger` so each item watches itself.

### 4. A horizontal scrollbar appears during the animation.

This is expected CSS behavior when an element is animated from an off-screen position (e.g., with `direction="horizontal"`). The browser creates a scrollbar to accommodate the content that is temporarily outside the viewport's bounds.

**Solution:**

To fix this, apply overflow-x: hidden; to a higher-level container. Based on your layout, you must choose a container that is wide enough to contain the entire animation. If the container is too narrow, the animation effect may be visually cut off. A full-width section or a main page wrapper is often a safe choice.

```vue
<template>
  <div style="overflow-x: hidden;">
    <section>
      <Emerge direction="horizontal" moveAmount="100px">
        <p>This content will not cause a scrollbar.</p>
      </Emerge>
    </section>
  </div>
</template>
```

### 5. Using with Nuxt.js & SSR

`vue-emerge` is fully compatible with Nuxt 3 and Server-Side Rendering (SSR). To ensure a smooth experience and prevent common "hydration mismatch" errors, it's crucial to follow the recommended composition pattern.

Hydration errors occur when the HTML rendered on the server is different from what the client-side Vue app expects. Self-closing tags (like `<img>`) and complex form elements are common sources of these issues.

The solution is to **always pass these elements into the <Emerge> component's default slot.**

#### Example: Images

**Incorrect usage (may cause hydration errors in Nuxt):**

```vue
<template>
  <Emerge tag="img" src="/path/to/image.png" />
</template>
```

**Correct usage (SSR-safe):**

```vue
<template>
  <Emerge>
    <img src="/path/to/image.png" />
  </Emerge>
</template>
```

#### Example: Form Inputs with `v-model`

Similarly, to guarantee correct reactivity and avoid hydration issues, always place your form elements inside the slot.

**Correct usage:**

```vue
<template>
  <p>Your message: {{ message }}</p>

  <Emerge>
    <textarea v-model="message"></textarea>
  </Emerge>
</template>

<script setup>
  import { Emerge } from 'vue-emerge';
  import { ref } from 'vue';

  const message = ref('');
</script>
```

By following this pattern, you ensure that the server and client render identical DOM structures, leading to a perfectly smooth and error-free animation experience in your Nuxt application.

---

## Development

```bash
npm install
npm run dev          # playground with the examples above
npm test             # unit tests (happy-dom) and browser tests (Chromium)
npm run typecheck
npm run lint
npm run build
```

The browser tests need Playwright's Chromium: `npx playwright install chromium`.

---

## License

Released under the [MIT License](https://opensource.org/licenses/MIT).
