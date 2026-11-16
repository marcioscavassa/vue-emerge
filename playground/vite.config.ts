import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { URL, fileURLToPath } from 'node:url';

// Development playground: `npm run dev`. Imports the library straight from src/.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [vue()],
  resolve: {
    alias: { 'vue-emerge': fileURLToPath(new URL('../src/index.ts', import.meta.url)) },
  },
});
