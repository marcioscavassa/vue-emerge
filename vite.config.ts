import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { copyFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import { URL, fileURLToPath } from 'node:url';

const src = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url));

/**
 * Publishes the stylesheet as dist/style.css (for apps that cannot inject styles at runtime, e.g. strict CSP)
 * and a CommonJS copy of the UMD build.
 */
const emitExtraFiles = (): Plugin => ({
  name: 'vue-emerge:emit-extra-files',
  // Written after the bundle because the CSS injection plugin removes CSS assets from it.
  writeBundle(options, bundle) {
    const dir = options.dir ?? 'dist';
    copyFileSync(src('style.css'), `${dir}/style.css`);
    // The package is "type": "module", so Node parses .js files as ESM and `require('vue-emerge')`
    // returned an empty object. A .cjs copy of the UMD build gives CommonJS consumers a working entry.
    if (options.format === 'umd' && 'vue-emerge.umd.js' in bundle) {
      copyFileSync(`${dir}/vue-emerge.umd.js`, `${dir}/vue-emerge.umd.cjs`);
    }
  },
});

// Two builds share this file:
//  - default: dist/vue-emerge.es.js + dist/vue-emerge.umd.js (styles injected at runtime) + types + style.css
//  - `vite build --mode no-css`: dist/no-css.es.js (no style injection)
export default defineConfig(({ mode }) => {
  const isNoCss = mode === 'no-css';
  return {
    plugins: isNoCss ? [vue()] : [vue(), dts({ include: ['src'], tsconfigPath: './tsconfig.json' }), cssInjectedByJsPlugin(), emitExtraFiles()],
    build: {
      emptyOutDir: !isNoCss,
      cssCodeSplit: false,
      lib: isNoCss
        ? { entry: src('no-css.ts'), formats: ['es'], fileName: () => 'no-css.es.js' }
        : {
            entry: src('index.ts'),
            name: 'VueEmerge',
            formats: ['es', 'umd'],
            fileName: (format) => `vue-emerge.${format}.js`,
          },
      rollupOptions: {
        external: ['vue'],
        output: {
          globals: { vue: 'Vue' },
          // Keep the UMD shape used so far: the plugin stays at `VueEmerge.default`.
          exports: 'named',
        },
      },
    },
  };
});
