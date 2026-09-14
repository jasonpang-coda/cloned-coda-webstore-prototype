<script setup>
/**
 * TokenChip — a copyable "name: value" pill (ported from the standalone
 * handoff kit, reskinned onto the prototype's own DS tokens instead of
 * VitePress theme vars — this is dev chrome mounted inside the running app,
 * so it must look at home in whichever store theme is active).
 */
import { ref } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  value: { type: String, default: '' },
})

const copied = ref(false)

async function copy () {
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
    <span class="token-chip__hint text-style-utility-micro-uppercase">{{ copied ? 'Copied' : 'Copy' }}</span>
  </button>
</template>

<style scoped>
.token-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--x-gap-content-tight);
  padding: var(--x-pad-surface-xxs) var(--x-pad-surface-s);
  border: var(--border-weight-default) solid var(--x-border-card-default);
  border-radius: var(--x-radius-container-xs);
  background: var(--x-bg-card-default);
  font-family: monospace;
  font-size: var(--x-sys-size-body-s);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.token-chip:hover {
  border-color: var(--x-border-card-hover);
}
.token-chip--copied {
  border-color: var(--x-border-card-selected);
}
.token-chip__name {
  color: var(--x-text-hyperlink-default);
  font-family: monospace;
}
.token-chip__value {
  color: var(--x-text-body-soft);
  font-family: monospace;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.token-chip__hint {
  color: var(--x-text-body-subtle);
}
</style>
