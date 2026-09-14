<script setup>
// GENERIC kit component — renders the spec's §2.x.e Mermaid `stateDiagram-v2`
// block live, and doubles as an input control: clicking a node emits
// 'select-state' so a sibling <FeaturePlayground> state selector can stay in
// sync (compose them off the same `state` ref — see SKILL.md Phase 3b).
//
// Props:
//   chart       — the §2.x.e mermaid source verbatim, copied from the spec.
//   activeState — current state id; highlighted in the rendered diagram.
import { onMounted, ref, watch } from 'vue'
import { extractNodeIds, loadMermaid, withActiveClass } from '../utils/mermaid.js'

const props = defineProps({
  chart: { type: String, required: true },
  activeState: { type: String, default: '' },
})
const emit = defineEmits(['select-state'])

const containerRef = ref(null)
const renderId = `state-diagram-${Math.random().toString(36).slice(2)}`
let callbackName = null

async function render() {
  const mermaid = await loadMermaid()
  if (!mermaid || !containerRef.value) return

  if (!callbackName) {
    callbackName = `__handoffStateSelect_${Math.random().toString(36).slice(2)}`
    window[callbackName] = (id) => emit('select-state', id)
  }

  const clickLines = extractNodeIds(props.chart)
    .map((id) => `click ${id} call ${callbackName}("${id}")`)
    .join('\n')
  const source = `${withActiveClass(props.chart, props.activeState)}\n${clickLines}`

  const { svg } = await mermaid.render(renderId, source)
  containerRef.value.innerHTML = svg
}

onMounted(render)
watch(() => [props.chart, props.activeState], render)
</script>

<template>
  <div ref="containerRef" class="state-diagram" role="img" aria-label="State diagram" />
</template>

<style scoped>
.state-diagram {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 16px;
  margin: 16px 0;
  background: var(--vp-c-bg-soft);
  overflow-x: auto;
}
.state-diagram :deep(svg) { max-width: 100%; height: auto; }
.state-diagram :deep(.node) { cursor: pointer; }
</style>
