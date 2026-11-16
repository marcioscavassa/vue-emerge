import { URL, fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Tests import 'vue-emerge'. By default it points to the source; with TEST_DIST=1 it
// points to the built package, which is how the CI checks older Vue versions.
const target = process.env.TEST_DIST ? './dist/vue-emerge.es.js' : './src/index.ts';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { 'vue-emerge': fileURLToPath(new URL(target, import.meta.url)) },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'happy-dom',
          include: ['tests/unit/**/*.spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['tests/browser/**/*.spec.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
