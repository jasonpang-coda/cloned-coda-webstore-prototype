<script setup>
/**
 * FlowDiagram — renders a flow manifest's user-flow Mermaid `flowchart` live.
 * Meant to be composed next to a <BeatTimeline>: pass the surface the
 * timeline is currently scrubbed to as `activeSurface` so scrubbing visibly
 * moves a highlight across the flow, and listen for 'select-surface' to jump
 * the timeline the other way (call the BeatTimeline's exposed `jumpTo(ms)`
 * from a surface→ms lookup). Ported from the standalone handoff kit.
 *
 * Props:
 *   chart         — mermaid source, verbatim from the flow manifest's flowChart.
 *   activeSurface — current surface node id; highlighted in the diagram.
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { applyActiveHighlight, bindNodeClicks, extractNodeIds, loadMermaid } from '../utils/mermaid.js'

const props = defineProps({
  chart: { type: String, required: true },
  activeSurface: { type: String, default: '' },
})
const emit = defineEmits(['select-surface'])

const containerRef = ref(null)
const renderId = `flow-diagram-${Math.random().toString(36).slice(2)}`
let unbindClicks = null

// Structure (the chart itself) only needs a real mermaid re-render when the
// CHART changes — highlighting the active surface is a cheap DOM class
// toggle (see applyActiveHighlight), not a reason to tear down and rebuild
// the SVG on every scrub frame.
async function render () {
  const mermaid = await loadMermaid()
  if (!mermaid || !containerRef.value) return

  const { svg } = await mermaid.render(renderId, props.chart)
  containerRef.value.innerHTML = svg

  unbindClicks?.()
  unbindClicks = bindNodeClicks(containerRef.value, extractNodeIds(props.chart), (id) => emit('select-surface', id))
  applyActiveHighlight(containerRef.value, extractNodeIds(props.chart), props.activeSurface)
}

onMounted(render)
watch(() => props.chart, render)
watch(() => props.activeSurface, (id) => applyActiveHighlight(containerRef.value, extractNodeIds(props.chart), id))
onBeforeUnmount(() => unbindClicks?.())
</script>

<template>
  <div ref="containerRef" class="flow-diagram" role="img" aria-label="User flow diagram" />
</template>

<style scoped>
.flow-diagram {
  border: var(--border-weight-default) solid var(--x-border-card-default);
  border-radius: var(--x-radius-container-s);
  padding: var(--x-pad-surface-m);
  background: var(--x-bg-card-default);
  overflow-x: auto;
}
.flow-diagram :deep(svg) { max-width: 100%; height: auto; }
.flow-diagram :deep(.node) { cursor: pointer; }
/* Active-surface highlight — a DOM class toggle, not a mermaid re-render
   (see applyActiveHighlight in utils/mermaid.js). !important beats
   mermaid's own inline fill/stroke styles on the node shape. */
.flow-diagram :deep(.node.is-active-state) rect,
.flow-diagram :deep(.node.is-active-state) polygon,
.flow-diagram :deep(.node.is-active-state) circle {
  fill: #f7b955 !important;
  stroke: #7a5b00 !important;
  stroke-width: 2px !important;
}
.flow-diagram :deep(.node.is-active-state) .label,
.flow-diagram :deep(.node.is-active-state) text {
  fill: #111 !important;
  color: #111 !important;
}
</style>
