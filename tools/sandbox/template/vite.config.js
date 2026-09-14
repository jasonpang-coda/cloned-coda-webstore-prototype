import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// This bundle is single-store (vendored at export time), so there's no
// multi-store virtual-module plugin to write — @active-stores just aliases
// straight to the one generated file. See vendor/active-stores.js.
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, 'vendor') },
      { find: '@active-stores', replacement: resolve(__dirname, 'vendor/active-stores.js') },
    ],
  },
})
