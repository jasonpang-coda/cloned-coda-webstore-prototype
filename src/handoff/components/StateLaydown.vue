<script setup>
/**
 * StateLaydown — every state of a flow laid out for review, plus an A→B diff
 * showing what changes across a transition (the tokens/props a matching
 * `transitions[]` entry names). Shares its `activeState` ref with StateDiagram
 * so clicking a diagram node and clicking a state card are the same action.
 */
import { computed, ref } from 'vue'
import { StateDiagram } from '@coda/harness-kit/vue'

const props = defineProps({ flow: { type: Object, default: null } })

const activeState = ref('')
const compareState = ref('')

function pickState (id) {
  // Clicking the active state again deselects it entirely (and any compare
  // alongside it — a compare only makes sense relative to an active state),
  // so there's always a way back to "nothing selected" to pick a fresh state.
  if (activeState.value === id) { activeState.value = ''; compareState.value = ''; return }
  if (!activeState.value) { activeState.value = id; return }
  // Clicking the current compare state again deselects just the compare,
  // leaving the active state picked.
  if (compareState.value === id) { compareState.value = ''; return }
  compareState.value = id
}
function clearCompare () { compareState.value = '' }

const transitionFor = computed(() => {
  if (!props.flow || !activeState.value || !compareState.value) return null
  return props.flow.transitions.find(t =>
    (t.from === activeState.value && t.to === compareState.value) ||
    (t.from === compareState.value && t.to === activeState.value),
  ) || null
})
</script>

<template>
  <div class="slay">
    <p v-if="!flow" class="slay__empty">Select a flow to see its state laydown.</p>

    <template v-else>
      <StateDiagram
        v-if="flow.stateChart"
        :chart="flow.stateChart"
        :active-state="activeState"
        @select-state="pickState"
      />

      <div class="slay__grid">
        <button
          v-for="s in flow.states"
          :key="s.id"
          type="button"
          class="slay__card"
          :class="{ 'slay__card--active': s.id === activeState, 'slay__card--compare': s.id === compareState }"
          @click="pickState(s.id)"
        >
          <span class="slay__card-id text-style-utility-label-bold">{{ s.id }}</span>
          <span v-if="s.desc" class="slay__card-desc text-style-paragraph-small">{{ s.desc }}</span>
          <span v-if="s.entry" class="slay__card-meta">Enter: {{ s.entry }}</span>
          <span v-if="s.exit" class="slay__card-meta">Exit: {{ s.exit }}</span>
        </button>
      </div>

      <div v-if="activeState && compareState" class="slay__diff">
        <div class="slay__diff-header">
          <span class="text-style-heading-card">{{ activeState }} → {{ compareState }}</span>
          <button type="button" class="slay__clear" @click="clearCompare">Clear</button>
        </div>
        <template v-if="transitionFor">
          <p v-if="transitionFor.trigger" class="slay__diff-row"><strong>Trigger:</strong> {{ transitionFor.trigger }}</p>
          <p v-if="transitionFor.motion?.length" class="slay__diff-row">
            <strong>Motion tokens:</strong>
            <code v-for="m in transitionFor.motion" :key="m">{{ m }}</code>
          </p>
          <p v-if="transitionFor.distance" class="slay__diff-row"><strong>Distance token:</strong> <code>{{ transitionFor.distance }}</code></p>
        </template>
        <p v-else class="slay__diff-row slay__diff-row--muted">
          No transition declared between these two states — check the flow manifest, or these states aren't directly reachable from one another.
        </p>
      </div>

      <p v-if="!flow.states.length" class="slay__empty">This flow declares no states yet.</p>
    </template>
  </div>
</template>

<style scoped>
.slay__empty { padding: var(--x-pad-surface-l); color: var(--x-text-body-subtle); text-align: center; }

.slay__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--x-gap-content-default);
  margin-top: var(--x-gap-content-default);
}
.slay__card {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-tight);
  align-items: flex-start;
  text-align: left;
  padding: var(--x-pad-surface-m);
  border: var(--border-weight-default) solid var(--x-border-card-default);
  border-radius: var(--x-radius-container-s);
  background: var(--x-bg-card-default);
  cursor: pointer;
}
.slay__card--active { border-color: var(--x-border-card-selected); }
.slay__card--compare { border-color: var(--x-border-card-highlighted); }
.slay__card-id { color: var(--x-text-body-default); }
.slay__card-desc { color: var(--x-text-body-soft); }
.slay__card-meta { font-size: var(--x-sys-size-body-s); color: var(--x-text-body-subtle); }

.slay__diff {
  margin-top: var(--x-gap-content-loose);
  padding: var(--x-pad-surface-l);
  border: var(--border-weight-default) solid var(--x-border-card-highlighted);
  border-radius: var(--x-radius-container-m);
  background: var(--x-bg-card-highlighted);
}
.slay__diff-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--x-gap-content-default); }
.slay__clear {
  border: none;
  background: transparent;
  color: var(--x-text-hyperlink-default);
  cursor: pointer;
  font-size: var(--x-sys-size-body-s);
}
.slay__diff-row { margin: 0 0 var(--x-gap-content-tight); color: var(--x-text-body-default); }
.slay__diff-row--muted { color: var(--x-text-body-subtle); }
.slay__diff-row code { color: var(--x-text-hyperlink-default); font-family: monospace; margin-left: var(--x-gap-content-tight); }
</style>
