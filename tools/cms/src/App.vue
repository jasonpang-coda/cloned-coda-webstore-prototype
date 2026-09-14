<script setup>
import { ref, onMounted } from 'vue'
import { api } from './api.js'
import StoreEditor from './components/StoreEditor.vue'
import NewStoreWizard from './components/NewStoreWizard.vue'
import PreviewPane from './components/PreviewPane.vue'

const stores = ref([])
const selected = ref(null)
const showWizard = ref(false)
const loadError = ref(null)

async function refresh () {
  try {
    stores.value = await api.listStores()
  } catch (e) {
    loadError.value = e.message
  }
}

onMounted(refresh)

function select (key) {
  selected.value = key
  showWizard.value = false
}

async function onCreated (key) {
  await refresh()
  select(key)
}
</script>

<template>
  <div class="app">
    <aside class="app__sidebar">
      <div class="app__sidebar-header">
        <h1>Store CMS</h1>
        <button @click="showWizard = true; selected = null">+ New store</button>
      </div>

      <p v-if="loadError" class="app__error">{{ loadError }}</p>

      <ul class="app__store-list">
        <li v-for="s in stores" :key="s.key"
            :class="{ active: selected === s.key, unmanaged: !s.managed }"
            @click="select(s.key)">
          <span class="app__store-label">{{ s.label }}</span>
          <span class="app__store-key">{{ s.key }}</span>
          <span v-if="!s.managed" class="app__badge" title="Hand-authored, read-only">read-only</span>
        </li>
      </ul>
    </aside>

    <main class="app__main">
      <NewStoreWizard v-if="showWizard" @created="onCreated" />
      <StoreEditor v-else-if="selected" :store-key="selected"
                   :managed="stores.find(s => s.key === selected)?.managed ?? false"
                   @saved="refresh" />
      <div v-else class="app__empty">Select a store, or create a new one.</div>
    </main>

    <section class="app__preview">
      <PreviewPane :store-key="selected" />
    </section>
  </div>
</template>

<style scoped>
.app { display: grid; grid-template-columns: 260px 1fr 1fr; height: 100vh; }
.app__sidebar { border-right: 1px solid var(--cms-border, #2a2a2e); display: flex; flex-direction: column; overflow: auto; }
.app__sidebar-header { padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
.app__sidebar-header h1 { font-size: 1rem; margin: 0; }
.app__sidebar-header button { padding: 0.5rem; background: #3d7eff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; }
.app__store-list { list-style: none; margin: 0; padding: 0; }
.app__store-list li { padding: 0.6rem 1rem; display: flex; flex-direction: column; gap: 0.15rem; cursor: pointer; border-left: 3px solid transparent; }
.app__store-list li:hover { background: var(--cms-input-bg, #1a1a1e); }
.app__store-list li.active { border-left-color: #3d7eff; background: var(--cms-input-bg, #1a1a1e); }
.app__store-list li.unmanaged { opacity: 0.6; }
.app__store-label { font-size: 0.9rem; }
.app__store-key { font-size: 0.72rem; font-family: monospace; opacity: 0.6; }
.app__badge { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.6; }
.app__main { overflow: auto; border-right: 1px solid var(--cms-border, #2a2a2e); }
.app__empty { display: flex; align-items: center; justify-content: center; height: 100%; opacity: 0.6; }
.app__error { color: #ff6b6b; padding: 0 1rem; font-size: 0.85rem; }
.app__preview { overflow: hidden; }
</style>
