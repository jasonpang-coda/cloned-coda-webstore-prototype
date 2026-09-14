import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  build: {
    // Absolute, not relative to `root` (which defaults to the CLI's cwd, not
    // this config file's directory, when built via `--config <path>` from
    // the monorepo root) — a relative outDir here would otherwise write to
    // <cwd>/dist instead of packages/inspect-kit/dist.
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.js'),
        vue: resolve(__dirname, 'src/vue/index.js'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ['vue'],
    },
  },
})
