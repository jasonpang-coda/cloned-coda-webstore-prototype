<script setup>
/**
 * Choreography — beat timeline + easing curve viewer for a flow's
 * choreography[]. One beat per manifest entry, each citing the duration/
 * easing token driving it (resolved live, not transcribed).
 */
import { computed } from 'vue'
import { BeatTimeline, EasingCurve, FlowDiagram, getToken, parseDuration } from '@coda/harness-kit/vue'

const props = defineProps({ flow: { type: Object, default: null } })

const beats = computed(() => {
  if (!props.flow) return []
  return props.flow.choreography.map(b => ({ ms: b.delayMs, label: b.beat }))
})

const range = computed(() => {
  if (!props.flow?.choreography?.length) return 1000
  const last = props.flow.choreography[props.flow.choreography.length - 1]
  const dur = parseDuration(getToken(last.duration)) || 0
  return Math.max(last.delayMs + dur, 100)
})

const easingTokens = computed(() => {
  if (!props.flow) return []
  return [...new Set(props.flow.choreography.map(b => b.easing).filter(Boolean))]
})
</script>

<template>
  <div class="choreo">
    <p v-if="!flow" class="choreo__empty">Select a flow to see its choreography.</p>

    <template v-else-if="flow.choreography.length">
      <FlowDiagram v-if="flow.flowChart" :chart="flow.flowChart" />

      <BeatTimeline :beats="beats" :range="range">
        <template #default="{ ms }">
          <component
            :is="flow.choreographyStage.component"
            v-if="flow.choreographyStage"
            :ms="ms"
            :range="range"
            v-bind="flow.choreographyStage.props || {}"
          />
          <p class="choreo__scrub-hint">t = {{ Math.round(ms) }}ms</p>
        </template>
      </BeatTimeline>

      <table class="choreo__table">
        <thead>
          <tr><th>Beat</th><th>Delay</th><th>Duration token</th><th>Easing token</th><th>Target</th></tr>
        </thead>
        <tbody>
          <tr v-for="(b, i) in flow.choreography" :key="i">
            <td>{{ b.beat }}</td>
            <td>{{ b.delayMs }}ms</td>
            <td><code>{{ b.duration }}</code></td>
            <td><code>{{ b.easing }}</code></td>
            <td>{{ b.target || '—' }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="easingTokens.length" class="choreo__easings">
        <EasingCurve v-for="t in easingTokens" :key="t" :token="t" />
      </div>
    </template>

    <p v-else class="choreo__empty">This flow declares no choreography yet.</p>
  </div>
</template>

<style scoped>
.choreo__empty { padding: var(--x-pad-surface-l); color: var(--x-text-body-subtle); text-align: center; }
.choreo__scrub-hint { text-align: center; color: var(--x-text-body-subtle); font-family: monospace; margin: 0; }

.choreo__table { width: 100%; border-collapse: collapse; font-size: var(--x-sys-size-body-s); margin: var(--x-gap-content-loose) 0; }
.choreo__table th, .choreo__table td {
  padding: var(--x-pad-surface-xs) var(--x-pad-surface-s);
  border-bottom: var(--border-weight-default) solid var(--x-border-card-default);
  text-align: left;
}
.choreo__table code { color: var(--x-text-hyperlink-default); font-family: monospace; }

.choreo__easings {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--x-gap-content-default);
}
</style>
