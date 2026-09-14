<script setup>
// GENERIC kit component — renders the spec's §1.a Mermaid `flowchart` (the
// user-flow/journey diagram) live. Meant to be composed next to a
// <BeatTimeline>: pass the surface the timeline is currently scrubbed to as
// `activeSurface` so scrubbing visibly moves a highlight across the flow, and
// listen for 'select-surface' to jump the timeline the other way (call the
// BeatTimeline's exposed `jumpTo(ms)` from a surface→ms lookup you own — see
// SKILL.md Phase 3b).
//
// Props:
//   chart         — the §1.a mermaid source verbatim, copied from the spec.
//   activeSurface — current surface node id; highlighted in the diagram.
import { onMounted, ref, watch } from 'vue'
import { extractNodeIds, loadMermaid, withActiveClass } from '../utils/mermaid.js'

const props = defineProps({
  chart: { type: String, required: true },
  activeSurface: { type: String, default: '' },
})
const emit = defineEmits(['select-surface'])

const containerRef = ref(null)
const renderId = `flow-diagram-${Math.random().toString(36).slice(2)}`
let callbackName = null

async function render() {
  const mermaid = await loadMermaid()
  if (!mermaid || !containerRef.value) return

  if (!callbackName) {
    callbackName = `__handoffFlowSelect_${Math.random().toString(36).slice(2)}`
    window[callbackName] = (id) => emit('select-surface', id)
  }

  const clickLines = extractNodeIds(props.chart)
    .map((id) => `click ${id} call ${callbackName}("${id}")`)
    .join('\n')
  const source = `${withActiveClass(props.chart, props.activeSurface)}\n${clickLines}`

  const { svg } = await mermaid.render(renderId, source)
  containerRef.value.innerHTML = svg
}

onMounted(render)
watch(() => [props.chart, props.activeSurface], render)
</script>

<template>
  <div ref="containerRef" class="flow-diagram" role="img" aria-label="User flow diagram" />
</template>

<style scoped>
.flow-diagram {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 16px;
  margin: 16px 0;
  background: var(--vp-c-bg-soft);
  overflow-x: auto;
}
.flow-diagram :deep(svg) { max-width: 100%; height: auto; }
.flow-diagram :deep(.node) { cursor: pointer; }
</style>
