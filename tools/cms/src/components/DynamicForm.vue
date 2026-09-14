<script setup>
/**
 * Renders one form control per entry in a flat schema array (the shape used
 * by tools/cms/schema/config.js: { path, type, options, default, required,
 * help, note }), bound to a nested `modelValue` object via its dot path.
 *
 * This is what makes the Config tab "driven entirely by schema/" (per the
 * plan) rather than hand-built per field — a new config knob just needs one
 * new entry in schema/config.js, no dashboard code change.
 */
import { computed } from 'vue'

const props = defineProps({
  fields: { type: Array, required: true },
  modelValue: { type: Object, required: true },
})
const emit = defineEmits(['update:modelValue'])

function get (obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)
}

function setAt (obj, path, value) {
  const clone = structuredClone(obj)
  const keys = path.split('.')
  let node = clone
  for (let i = 0; i < keys.length - 1; i++) {
    if (node[keys[i]] == null || typeof node[keys[i]] !== 'object') node[keys[i]] = {}
    node = node[keys[i]]
  }
  node[keys[keys.length - 1]] = value
  return clone
}

function fieldValue (field) {
  const v = get(props.modelValue, field.path)
  return v === undefined ? field.default ?? null : v
}

function update (field, value) {
  emit('update:modelValue', setAt(props.modelValue, field.path, value))
}

function onStringArrayInput (field, text) {
  const arr = text.split(',').map(s => s.trim()).filter(Boolean)
  update(field, arr.length ? arr : null)
}

const rows = computed(() => props.fields.map(f => ({ field: f, value: fieldValue(f) })))
</script>

<template>
  <div class="dform">
    <div v-for="{ field, value } in rows" :key="field.path" class="dform__row">
      <label class="dform__label" :for="field.path">
        {{ field.path }}
        <span v-if="field.required" class="dform__required" title="Required for every managed store">*</span>
      </label>

      <div class="dform__control">
        <select v-if="field.type === 'enum'" :id="field.path"
                :value="value ?? ''" @change="update(field, $event.target.value || null)">
          <option v-for="opt in field.options" :key="String(opt)" :value="opt ?? ''">
            {{ opt === null ? '(none)' : opt }}
          </option>
        </select>

        <input v-else-if="field.type === 'boolean'" :id="field.path" type="checkbox"
               :checked="!!value" @change="update(field, $event.target.checked)" />

        <input v-else-if="field.type === 'number'" :id="field.path" type="number"
               :value="value" @input="update(field, $event.target.value === '' ? null : Number($event.target.value))" />

        <input v-else-if="field.type === 'stringArray'" :id="field.path" type="text"
               placeholder="comma, separated, values"
               :value="Array.isArray(value) ? value.join(', ') : ''"
               @input="onStringArrayInput(field, $event.target.value)" />

        <textarea v-else-if="field.type === 'object' || field.type === 'nullable' && value && typeof value === 'object'"
                  :id="field.path" rows="3" class="dform__json"
                  :value="JSON.stringify(value, null, 2)"
                  @change="update(field, JSON.parse($event.target.value || 'null'))" />

        <input v-else :id="field.path" type="text"
               :value="value ?? ''" @input="update(field, $event.target.value || null)" />
      </div>

      <p v-if="field.help" class="dform__help">{{ field.help }}</p>
      <p v-if="field.note" class="dform__note">⚠ {{ field.note }}</p>
    </div>
  </div>
</template>

<style scoped>
.dform__row { display: grid; grid-template-columns: 260px 1fr; gap: 0.5rem 1rem; padding: 0.5rem 0; border-bottom: 1px solid var(--cms-border, #2a2a2e); align-items: start; }
.dform__label { font-family: monospace; font-size: 0.85rem; opacity: 0.85; padding-top: 0.4rem; }
.dform__required { color: #ff6b6b; }
.dform__control { display: flex; }
.dform__control input[type="text"],
.dform__control input[type="number"],
.dform__control select,
.dform__json { width: 100%; padding: 0.35rem 0.5rem; background: var(--cms-input-bg, #1a1a1e); color: inherit; border: 1px solid var(--cms-border, #2a2a2e); border-radius: 4px; font: inherit; }
.dform__json { font-family: monospace; font-size: 0.8rem; }
.dform__help { grid-column: 2; font-size: 0.78rem; opacity: 0.65; margin: 0; }
.dform__note { grid-column: 2; font-size: 0.78rem; color: #e8a33d; margin: 0; }
</style>
