import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { cmsApiPlugin } from './server/api.mjs'

// The store CMS's own tiny Vite app — separate from the storefront's
// vite.config.js at the repo root. Lives under tools/cms/ so it never touches
// src/ and is never imported by any store bundle (see Part 3 of the plan for
// why this sits in-repo rather than as a separate project).
export default defineConfig({
  root: resolve(__dirname),
  plugins: [vue(), cmsApiPlugin()],
  server: {
    port: 5199,
    strictPort: false,
  },
  resolve: {
    alias: [
      { find: '@cms', replacement: resolve(__dirname, 'src') },
    ],
  },
})
