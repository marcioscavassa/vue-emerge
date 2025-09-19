# vue-emerge

A lightweight and easy-to-use Vue 3 component to apply an "emerge" animation to your elements as they enter the viewport. It leverages the `IntersectionObserver` API for optimal performance.

[![npm version](https://badge.fury.io/js/vue-emerge.svg)](https://badge.fury.io/js/vue-emerge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Features

- **Component-Based:** A simple `<Emerge>` component to wrap your content.
- **Highly Customizable:** Control animation direction, duration, delay, distance, and more.
- **Performant:** Uses `IntersectionObserver` to trigger animations only when needed, ensuring no performance overhead.
- **Flexible Triggering:** Animate an element based on its own visibility or the visibility of another element.
- **Tag Agnostic:** Renders as a `div` by default, but can be configured to render any HTML tag or another component.

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

| Prop                | Type                         | Default      | Description                                                                                                                |
| ------------------- | ---------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `root`              | `string`                     | `undefined`  | A CSS selector for an element to act as the viewport for<br>visibility checking. If omitted, the browser viewport is used. |
| `triggerOffset`     | `string`                     | `'-100px'`   | Offset for the `IntersectionObserver`'s `rootMargin`.                                                                      |
| `threshold`         | `number \| number[]`         | `0.1`        | A number or array between 0.0 and 1.0 indicating how much<br>of the element must be visible to trigger the animation.      |
| `trigger`           | `string`                     | `undefined`  | A CSS selector for an element to act as the visibility trigger.                                                            |
| `tag`               | `string \| Component`        | `'div'`      | The HTML tag or component to render as the root element.                                                                   |
| `direction`         | `'vertical' \| 'horizontal'` | `'vertical'` | The direction of the emerge animation.                                                                                     |
| `moveAmount`        | `string`                     | `'3rem'`     | The initial distance the element is translated (e.g., `'50px'`).                                                           |
| `animationDuration` | `number`                     | `1000`       | The duration of the animation in milliseconds.                                                                             |
| `animationDelay`    | `number`                     | `0`          | The delay before the animation starts in milliseconds.                                                                     |
| `timingFunction`    | `string`                     | `'ease'`     | A valid CSS `animation-timing-function` value<br>(e.g., `'ease-in-out'`, `'cubic-bezier'`).                                |
| `componentProps`    | `object`                     | `{}`         | Allows passing additional attributes or props to the rendered tag.                                                         |

---

## Advanced Usage

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
    padding-bottom: 10rem;
  }
  #section-trigger {
    height: 200px;
    margin-top: 100vh;
  }
</style>
```

### Controlling the Trigger Point with `threshold`

By default, the animation triggers as soon as a small part of the element becomes visible. You can change this behavior with the `threshold` prop, which accepts a number between `0.0` (barely visible) and `1.0` (fully visible).

This is useful for delaying an animation until more of the element is on screen.

```vue
<template>
  <section>
    <Emerge :threshold="0.75">
      <p>This will only appear when you've scrolled far enough to see most of it.</p>
    </Emerge>

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
    margin-top: 20rem;
  }
</style>
```

### Staggered Animations in a List

You can create beautiful staggered animations for lists of items by using `<Emerge>` inside a `v-for` loop. The key is to combine a common `trigger` for the entire list with a dynamic `animationDelay` for each item.

In this example, all `<Emerge>` components watch a single parent element (`.features-list`). When that parent becomes visible, all items begin their animation in a staggered sequence.

```vue
<template>
  <section>
    <h2>Our Features</h2>

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
    padding: 1rem;
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

**How it works:** Two props work together to create this effect:

1.  **`trigger=".features-list"`**: This prop tells every `<Emerge>` component inside the loop to start its animation only when the parent container with the class `.features-list` becomes visible. This is more performant and ensures the entire group animation is perfectly synchronized.

2.  **`:animationDelay="index * 150"`**: This line creates the staggered timing. For each item, we multiply its loop `index` (0, 1, 2, ...) by a base delay of **150ms**.
    - **Item 1 (index 0):** `0 * 150 = 0ms` delay.
    - **Item 2 (index 1):** `1 * 150 = 150ms` delay.
    - **Item 3 (index 2):** `2 * 150 = 300ms` delay.
    - And so on...

This combination creates a robust and smooth animation for the entire list as it enters the viewport.

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
<div class="visible-container">
  <Emerge trigger=".visible-container" moveAmount="110vw">
    <p>Animated Content</p>
  </Emerge>
</div>
```

### 2. A horizontal scrollbar appears during the animation.

This is expected CSS behavior when an element is animated from an off-screen position (e.g., with `direction="horizontal"`). The browser creates a scrollbar to accommodate the content that is temporarily outside the viewport's bounds.

**Solution:**

To fix this, apply overflow-x: hidden; to a higher-level container. Based on your layout, you must choose a container that is wide enough to contain the entire animation. If the container is too narrow, the animation effect may be visually cut off. A full-width section or a main page wrapper is often a safe choice.

```vue
<div style="overflow-x: hidden;">
  <section>
    <Emerge direction="horizontal" moveAmount="100px">
      <p>This content will not cause a scrollbar.</p>
    </Emerge>
  </section>
</div>
```

---

## License

Released under the [MIT License](https://opensource.org/licenses/MIT).
