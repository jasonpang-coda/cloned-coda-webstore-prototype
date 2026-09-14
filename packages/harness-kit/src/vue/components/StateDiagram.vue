<script setup>
/**
 * StateDiagram — renders a flow's state-machine Mermaid `stateDiagram-v2`
 * block live, and doubles as an input control: clicking a node emits
 * 'select-state' so a sibling state selector can stay in sync (compose them
 * off the same `state` ref). Ported from the standalone handoff kit.
 *
 * Props:
 *   chart       — mermaid source, verbatim from the flow manifest's stateChart.
 *   activeState — current state id; highlighted in the rendered diagram.
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { applyActiveHighlight, bindNodeClicks, extractNodeIds, loadMermaid } from '../utils/mermaid.js'

const props = defineProps({
  chart: { type: String, required: true },
  activeState: { type: String, default: '' },
})
const emit = defineEmits(['select-state'])

const containerRef = ref(null)
const renderId = `state-diagram-${Math.random().toString(36).slice(2)}`
let unbindClicks = null

// Structure (the chart itself) only needs a real mermaid re-render when the
// CHART changes — highlighting the active node is a cheap DOM class toggle
// (see applyActiveHighlight), not a reason to tear down and rebuild the SVG.
// Re-rendering on every activeState change (the old approach) is exactly
// what caused a visible flash on every select/deselect.
async function render () {
  const mermaid = await loadMermaid()
  if (!mermaid || !containerRef.value) return

  const { svg } = await mermaid.render(renderId, props.chart)
  containerRef.value.innerHTML = svg

  unbindClicks?.()
  unbindClicks = bindNodeClicks(containerRef.value, extractNodeIds(props.chart), (id) => emit('select-state', id))
  applyActiveHighlight(containerRef.value, extractNodeIds(props.chart), props.activeState)
}

onMounted(render)
watch(() => props.chart, render)
watch(() => props.activeState, (id) => applyActiveHighlight(containerRef.value, extractNodeIds(props.chart), id))
onBeforeUnmount(() => unbindClicks?.())
</script>

<template>
  <div ref="containerRef" class="state-diagram" role="img" aria-label="State diagram" />
</template>

<style scoped>
.state-diagram {
  border: var(--border-weight-default) solid var(--x-border-card-default);
  border-radius: var(--x-radius-container-s);
  padding: var(--x-pad-surface-m);
  background: var(--x-bg-card-default);
  overflow-x: auto;
}
.state-diagram :deep(svg) { max-width: 100%; height: auto; }
.state-diagram :deep(.node) { cursor: pointer; }
/* Active-node highlight — a DOM class toggle, not a mermaid re-render (see
   applyActiveHighlight in utils/mermaid.js). !important beats mermaid's own
   inline fill/stroke styles on the node shape. */
.state-diagram :deep(.node.is-active-state) rect,
.state-diagram :deep(.node.is-active-state) polygon,
.state-diagram :deep(.node.is-active-state) circle {
  fill: #f7b955 !important;
  stroke: #7a5b00 !important;
  stroke-width: 2px !important;
}
.state-diagram :deep(.node.is-active-state) .label,
.state-diagram :deep(.node.is-active-state) text {
  fill: #111 !important;
  color: #111 !important;
}
</style>
