<script setup>
import { ref } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  value: { type: String, default: '' },
})

const copied = ref(false)

async function copy() {
  const text = `${props.name}: ${props.value}`
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch {
    /* clipboard unavailable */
  }
}
</script>

<template>
  <button type="button" class="token-chip" :class="{ 'token-chip--copied': copied }" @click="copy">
    <code class="token-chip__name">{{ name }}</code>
    <span class="token-chip__value">{{ value || '—' }}</span>
    <span class="token-chip__hint">{{ copied ? 'Copied' : 'Copy' }}</span>
  </button>
</template>

<style scoped>
.token-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.token-chip:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
}
.token-chip--copied {
  border-color: var(--vp-c-brand-1);
}
.token-chip__name {
  color: var(--vp-c-brand-1);
  font-family: var(--vp-font-family-mono);
}
.token-chip__value {
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.token-chip__hint {
  color: var(--vp-c-text-3);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
