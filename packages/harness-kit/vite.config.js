import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  build: {
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
