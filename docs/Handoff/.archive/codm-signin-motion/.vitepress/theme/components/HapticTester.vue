<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const HAPTICS = {
  press: 10,
  chip: 10,
  select: 20,
  confirm: 35,
  success: [10, 40, 20],
  error: [20, 30, 20],
}

const shimActive = ref(false)
const logs = ref([])
const originalVibrate = ref(null)

function installShim() {
  if (typeof navigator === 'undefined') return
  if (!originalVibrate.value) {
    originalVibrate.value = navigator.vibrate?.bind(navigator) ?? null
  }
  navigator.vibrate = (pattern) => {
    const entry = { time: new Date().toLocaleTimeString(), pattern }
    logs.value = [entry, ...logs.value].slice(0, 12)
    console.log('%c[haptic]', 'color:#ffe700;font-weight:bold', pattern)
    return true
  }
  shimActive.value = true
}

function removeShim() {
  if (typeof navigator === 'undefined') return
  if (originalVibrate.value) {
    navigator.vibrate = originalVibrate.value
  } else {
    delete navigator.vibrate
  }
  shimActive.value = false
}

function fire(token) {
  if (!shimActive.value) installShim()
  const pattern = HAPTICS[token]
  navigator.vibrate?.(pattern)
}

function formatPattern(p) {
  return Array.isArray(p) ? `[${p.join(', ')}]` : String(p)
}

onMounted(() => {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate !== 'function') {
    installShim()
  }
})

onUnmounted(removeShim)
</script>

<template>
  <div class="haptic-tester">
    <div class="haptic-tester__header">
      <strong>Haptic Tester</strong>
      <span class="haptic-tester__status" :class="{ 'haptic-tester__status--on': shimActive }">
        {{ shimActive ? 'Shim active' : 'Shim off' }}
      </span>
      <button type="button" class="haptic-tester__btn" @click="shimActive ? removeShim() : installShim()">
        {{ shimActive ? 'Remove shim' : 'Install shim' }}
      </button>
    </div>

    <p class="haptic-tester__note">
      Desktop has no Vibration API. The shim logs patterns to the console and the feed below —
      same workflow documented in <code>haptic-tokens.md</code>.
    </p>

    <div class="haptic-tester__grid">
      <button
        v-for="(pattern, token) in HAPTICS"
        :key="token"
        type="button"
        class="haptic-tester__token-btn"
        @click="fire(token)"
      >
        <code>{{ token }}</code>
        <span>{{ formatPattern(pattern) }}</span>
      </button>
    </div>

    <div v-if="logs.length" class="haptic-tester__log">
      <div v-for="(entry, i) in logs" :key="i" class="haptic-tester__log-row">
        <time>{{ entry.time }}</time>
        <code>{{ formatPattern(entry.pattern) }}</code>
      </div>
    </div>
    <p v-else class="haptic-tester__empty">Tap a token to see the pattern log.</p>
  </div>
</template>

<style scoped>
.haptic-tester {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 16px;
  margin: 16px 0;
  background: var(--vp-c-bg-soft);
}
.haptic-tester__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.haptic-tester__status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
}
.haptic-tester__status--on {
  color: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
}
.haptic-tester__btn {
  margin-left: auto;
  padding: 4px 10px;
  font-size: 11px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  cursor: pointer;
  color: var(--vp-c-text-1);
}
.haptic-tester__note {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin: 0 0 14px;
}
.haptic-tester__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
  margin-bottom: 14px;
}
.haptic-tester__token-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s;
}
.haptic-tester__token-btn:hover {
  border-color: var(--vp-c-brand-1);
}
.haptic-tester__token-btn code {
  color: var(--vp-c-brand-1);
  font-size: 12px;
}
.haptic-tester__token-btn span {
  font-size: 11px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
}
.haptic-tester__log {
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 12px;
  display: grid;
  gap: 6px;
}
.haptic-tester__log-row {
  display: flex;
  gap: 12px;
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
}
.haptic-tester__log-row time {
  color: var(--vp-c-text-3);
  min-width: 72px;
}
.haptic-tester__empty {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin: 0;
}
</style>
