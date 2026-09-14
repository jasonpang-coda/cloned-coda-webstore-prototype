<script setup>
/**
 * Tabbed editor for one managed store: Config / Strings / Assets / Catalog,
 * each tab driven by the schema (tools/cms/schema/*) rather than bespoke
 * per-field UI. Unmanaged stores (the 10 hand-authored ones, no
 * store.config.json) render read-only — the CMS never regenerates them
 * unless a definition explicitly opts in with "managed": true.
 */
import { ref, reactive, computed, watch } from 'vue'
import { api } from '../api.js'
import DynamicForm from './DynamicForm.vue'
import PublishPanel from './PublishPanel.vue'

const props = defineProps({
  storeKey: { type: String, required: true },
  managed: { type: Boolean, required: true },
})
const emit = defineEmits(['saved'])

const schema = ref(null)
const definition = ref(null)
const loading = ref(true)
const notFound = ref(false)
const tab = ref('config')
const saving = ref(false)
const saveError = ref(null)
const saveOk = ref(false)

async function load () {
  loading.value = true
  notFound.value = false
  saveOk.value = false
  saveError.value = null
  try {
    schema.value = await api.schema()
  } catch (e) {
    saveError.value = e.message
  }
  try {
    definition.value = await api.getStore(props.storeKey)
  } catch (e) {
    notFound.value = true
    definition.value = null
  }
  loading.value = false
}

watch(() => props.storeKey, load, { immediate: true })

// Flatten STRINGS_SCHEMA's grouped shape into the flat { path, type, default,
// help }[] DynamicForm expects, so the Strings tab reuses the same renderer
// as Config instead of a bespoke component.
const stringsFields = computed(() => {
  if (!schema.value) return []
  const out = []
  for (const [groupName, group] of Object.entries(schema.value.strings.groups)) {
    for (const [fieldName, field] of Object.entries(group.fields)) {
      out.push({
        path: `${groupName}.${fieldName}`,
        type: field.type === 'array' ? 'stringArray' : (field.richText ? 'string' : 'string'),
        default: field.default,
        required: !field.optional,
        help: field.help,
      })
    }
  }
  return out
})

const catalogText = ref('')
watch(definition, def => {
  catalogText.value = def?.catalog ? JSON.stringify(def.catalog, null, 2) : ''
}, { immediate: true })

function updateConfig (next) { definition.value = { ...definition.value, config: next } }
function updateStrings (next) { definition.value = { ...definition.value, strings: next } }

async function save () {
  saving.value = true
  saveError.value = null
  saveOk.value = false
  try {
    let catalog = definition.value.catalog
    if (definition.value.config?.catalog?.mode === 'filter') {
      catalog = catalogText.value.trim() ? JSON.parse(catalogText.value) : null
    }
    await api.updateStore(props.storeKey, { ...definition.value, catalog })
    saveOk.value = true
    emit('saved', props.storeKey)
  } catch (e) {
    saveError.value = e.message
  } finally {
    saving.value = false
  }
}

async function onAssetFile (slot, key, event) {
  const file = event.target.files[0]
  if (!file) return
  const buf = await file.arrayBuffer()
  const dataBase64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
  const { path } = await api.uploadAsset(props.storeKey, { slot, name: file.name, dataBase64 })
  definition.value = {
    ...definition.value,
    assets: {
      ...definition.value.assets,
      [slot]: { ...definition.value.assets[slot], [key]: path },
    },
  }
}
</script>

<template>
  <div class="editor">
    <div v-if="loading" class="editor__empty">Loading…</div>

    <div v-else-if="notFound" class="editor__empty">
      <p><strong>{{ storeKey }}</strong> has no <code>store.config.json</code> — it's an
      unmanaged, hand-authored store. The CMS never regenerates existing stores unless their
      definition explicitly sets <code>"managed": true</code>.</p>
    </div>

    <template v-else>
      <nav class="editor__tabs">
        <button v-for="t in ['config', 'strings', 'assets', 'catalog', 'publish']" :key="t"
                :class="{ active: tab === t }" @click="tab = t">{{ t }}</button>
        <span class="editor__spacer" />
        <button class="editor__save" :disabled="saving" @click="save">
          {{ saving ? 'Saving…' : 'Save & regenerate' }}
        </button>
      </nav>

      <p v-if="saveError" class="editor__error">{{ saveError }}</p>
      <p v-if="saveOk" class="editor__ok">Saved — regenerated store.js / theme.css.</p>

      <div class="editor__body">
        <DynamicForm v-if="tab === 'config'" :fields="schema.config" v-model="definition.config" @update:modelValue="updateConfig" />
        <DynamicForm v-else-if="tab === 'strings'" :fields="stringsFields" v-model="definition.strings" @update:modelValue="updateStrings" />

        <div v-else-if="tab === 'assets'" class="editor__assets">
          <div v-for="slot in ['brand', 'content']" :key="slot" class="editor__asset-slot">
            <h3>{{ slot }}</h3>
            <div v-for="key in Object.keys(schema.assets[slot] ?? {})" :key="key" class="editor__asset-row">
              <span class="editor__asset-key">{{ key }}</span>
              <span class="editor__asset-path">{{ definition.assets?.[slot]?.[key] ?? '(none)' }}</span>
              <input type="file" @change="onAssetFile(slot, key, $event)" />
            </div>
          </div>
        </div>

        <div v-else-if="tab === 'catalog'" class="editor__catalog">
          <p v-if="definition.config?.catalog?.mode !== 'filter'">
            This store's catalog model is <code>{{ definition.config?.catalog?.mode }}</code> — the
            category-tree editor only applies to <code>filter</code>-mode stores. Page-mode SKU
            sections are edited via <code>skus</code> in the raw definition for now.
          </p>
          <textarea v-else v-model="catalogText" class="editor__json" rows="20" spellcheck="false" />
        </div>

        <PublishPanel v-else-if="tab === 'publish'" :store-key="storeKey" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.editor { display: flex; flex-direction: column; height: 100%; }
.editor__empty { margin: auto; padding: 2rem; max-width: 30rem; opacity: 0.8; }
.editor__tabs { display: flex; gap: 0.25rem; padding: 0.5rem; border-bottom: 1px solid var(--cms-border, #2a2a2e); align-items: center; }
.editor__tabs button { padding: 0.4rem 0.8rem; background: transparent; border: 1px solid transparent; border-radius: 4px; color: inherit; cursor: pointer; text-transform: capitalize; }
.editor__tabs button.active { background: var(--cms-input-bg, #1a1a1e); border-color: var(--cms-border, #2a2a2e); }
.editor__spacer { flex: 1; }
.editor__save { background: #3d7eff !important; color: white; font-weight: 600; }
.editor__body { flex: 1; overflow: auto; padding: 1rem; }
.editor__error { color: #ff6b6b; padding: 0 1rem; }
.editor__ok { color: #4caf50; padding: 0 1rem; }
.editor__asset-row { display: grid; grid-template-columns: 180px 1fr auto; gap: 0.5rem; align-items: center; padding: 0.35rem 0; font-size: 0.85rem; }
.editor__asset-key { font-family: monospace; }
.editor__asset-path { opacity: 0.7; font-family: monospace; font-size: 0.78rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.editor__json { width: 100%; font-family: monospace; font-size: 0.8rem; background: var(--cms-input-bg, #1a1a1e); color: inherit; border: 1px solid var(--cms-border, #2a2a2e); border-radius: 4px; padding: 0.5rem; }
</style>
