<script setup>
/**
 * Live preview — iframes the real storefront's dev server with a `?theme=`
 * override (see src/composables/useTheme.js's resolveInitialTheme). The
 * storefront's origin is resolved via /api/preview-origin rather than a
 * hardcoded port, since 5173 is frequently already taken by another project
 * and `npm run cms` (scripts/cms.mjs) may fall back to a different port. This
 * is the "local now, hosted later" tradeoff from the plan — a hosted CMS
 * instead points this at the deployed internal build.
 */
import { ref, watch, onMounted } from 'vue'
import { api } from '../api.js'

const props = defineProps({ storeKey: { type: String, default: null } })

const origin = ref('http://localhost:5173')
const iframeRef = ref(null)
const reachable = ref(null) // null = unknown, true/false once checked
const live = ref(true) // false when CMS_PREVIEW_ORIGIN points at a static deployed build, not a dev server

const src = () => props.storeKey ? `${origin.value}/?theme=${props.storeKey}` : null

async function checkReachable () {
  try {
    const { origin: resolved, live: isLive } = await api.previewOrigin()
    origin.value = resolved
    live.value = isLive
  } catch {
    // /api/preview-origin itself failing means the CMS's own server is down —
    // keep the last-known origin and let the fetch below report unreachable.
  }
  try {
    await fetch(origin.value, { mode: 'no-cors' })
    reachable.value = true
  } catch {
    reachable.value = false
  }
}

onMounted(checkReachable)
watch(() => props.storeKey, checkReachable)
</script>

<template>
  <div class="preview">
    <div v-if="!storeKey" class="preview__empty">Select a store to preview it.</div>
    <div v-else-if="reachable === false" class="preview__empty">
      Can't reach the storefront dev server at <code>{{ origin }}</code>.
      Start it with <code>npm run cms</code> (starts both servers) or
      <code>npm run dev</code> separately, then retry.
      <button @click="checkReachable">Retry</button>
    </div>
    <template v-else>
      <p v-if="!live" class="preview__notice">
        Previewing the deployed build at <code>{{ origin }}</code> — this isn't a dev server, so
        edits here won't hot-reload. Redeploy to see changes.
      </p>
      <iframe ref="iframeRef" class="preview__frame" :src="src()" title="Store preview" />
    </template>
  </div>
</template>

<style scoped>
.preview { height: 100%; display: flex; flex-direction: column; }
.preview__empty { margin: auto; padding: 2rem; text-align: center; opacity: 0.7; max-width: 28rem; }
.preview__empty code { background: var(--cms-input-bg, #1a1a1e); padding: 0.1rem 0.35rem; border-radius: 3px; }
.preview__empty button { display: block; margin: 0.75rem auto 0; padding: 0.35rem 0.9rem; }
.preview__frame { flex: 1; width: 100%; border: none; background: #111; }
.preview__notice { margin: 0; padding: 0.5rem 0.75rem; font-size: 0.78rem; opacity: 0.75; background: var(--cms-input-bg, #1a1a1e); border-bottom: 1px solid var(--cms-border, #2a2a2e); }
.preview__notice code { background: rgba(255,255,255,0.08); padding: 0.1rem 0.35rem; border-radius: 3px; }
</style>
