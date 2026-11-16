<template>
  <main>
    <h1>vue-emerge playground</h1>
    <p>Scroll down.</p>

    <section>
      <h2>Basic</h2>
      <Emerge>
        <div class="card">Hello, World!</div>
      </Emerge>
    </section>

    <section>
      <h2>Horizontal with delay</h2>
      <Emerge direction="horizontal" move-amount="-50px" :animation-duration="800" :animation-delay="200" timing-function="ease-out">
        <div class="card">Slides in from the left</div>
      </Emerge>
    </section>

    <section>
      <h2>Staggered list</h2>
      <div class="list">
        <Emerge v-for="i in 12" :key="i" trigger=".list" :animation-delay="(i - 1) * 100" direction="horizontal" move-amount="50px">
          <div class="card">Item {{ i }}</div>
        </Emerge>
      </div>
    </section>

    <section>
      <h2>Scrollable container</h2>
      <div id="container">
        <Emerge v-for="i in 30" :key="i" root="#container" direction="horizontal" move-amount="-4rem">
          <div class="row">Row {{ i }}</div>
        </Emerge>
      </div>
    </section>

    <section>
      <h2>Re-animates on every entry</h2>
      <Emerge :once="false">
        <div class="card">Scroll up and down</div>
      </Emerge>
    </section>

    <section>
      <h2>Directive</h2>
      <p v-emerge="{ direction: 'horizontal', moveAmount: '3rem' }" class="card">No wrapper element</p>
    </section>

    <section>
      <h2>Fixed descendant</h2>
      <Emerge>
        <button type="button" @click="open = true">Open modal</button>
        <div v-if="open" class="modal" @click="open = false">The modal covers the whole window. Click to close.</div>
      </Emerge>
    </section>
  </main>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const open = ref(false);
</script>

<style>
  body {
    font-family: system-ui, sans-serif;
    margin: 0;
    overflow-x: hidden;
  }
  main {
    max-width: 720px;
    margin: 0 auto;
    padding: 1rem;
  }
  section {
    margin-top: 100vh;
  }
  .card {
    padding: 1.5rem;
    background: #f3f4f6;
    border-left: 4px solid #2563eb;
    border-radius: 4px;
  }
  .list {
    display: grid;
    gap: 0.5rem;
  }
  #container {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #ccc;
  }
  .row {
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }
  .modal {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgb(0 0 0 / 60%);
    color: #fff;
  }
</style>
