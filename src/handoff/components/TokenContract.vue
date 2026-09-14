<script setup>
/**
 * TokenContract — per-component token consumption, resolved live for the
 * active theme, with a store switcher (like the component library) plus a
 * "resolved across every store" table per component. See ComponentStage.vue
 * for why the live render only ever shows one theme at a time — resolved
 * VALUES compare across all stores at once (cheap: reads only), the live
 * RENDER does not (needs a real theme flip to repaint correctly).
 */
import { computed, onMounted, onBeforeUnmount } from 'vue'
import ComponentStage from './ComponentStage.vue'
import { TokenChip } from '@coda/harness-kit/vue'
import { useTheme } from '../../composables/useTheme.js'
import { resolveTokensAcrossThemes } from '../resolve.js'
import { useInspector, getConfig, setConfig } from '@coda/inspect-kit/vue'

const props = defineProps({ flow: { type: Object, default: null } })

const { theme, themes, setTheme } = useTheme()
const { active: inspecting, toggle: toggleInspect, close: closeInspect } = useInspector()

const rows = computed(() => {
  if (!props.flow) return []
  return props.flow.components.map(c => ({
    ...c,
    byTheme: resolveTokensAcrossThemes(c.tokens || [], themes.map(t => t.value)),
  }))
})
// The inspect toggle only makes sense when at least one component here has a
// live ComponentStage to hover — an inline-block entry with no `component`
// (see ComponentStage's `v-if="c.component"`) has nothing on stage to point it at.
const hasStage = computed(() => rows.value.some(c => c.component))

// Retarget the SAME global inspector (normally screenRoot='.device__screen',
// pointed at the live storefront) at this tab's ComponentStage instead, for
// as long as this tab stays mounted. Safe because the handoff surface and the
// live storefront are never visible at once — see config.js's comment on why
// a later partial setConfig() doesn't clobber the host's other options, and
// main.js's chromeSelectors entry keeping this tab's own nav clickable while
// inspecting. Restores the prior screenRoot (and turns inspecting off) on
// unmount so leaving this tab doesn't leave the live storefront's inspector
// pointed at a stage that no longer exists.
const previousScreenRoot = getConfig().screenRoot
onMounted(() => { setConfig({ screenRoot: '.cstage__screen' }) })
onBeforeUnmount(() => {
  closeInspect()
  setConfig({ screenRoot: previousScreenRoot })
})
</script>

<template>
  <div class="tcontract">
    <p v-if="!flow" class="tcontract__empty">Select a flow to see its component contracts.</p>

    <template v-else>
      <div class="tcontract__theme-picker">
        <span class="tcontract__theme-label text-style-utility-micro-uppercase">Live render theme</span>
        <button
          v-for="t in themes"
          :key="t.value"
          type="button"
          class="tcontract__theme-btn"
          :class="{ 'tcontract__theme-btn--active': t.value === theme }"
          @click="setTheme(t.value)"
        >{{ t.label }}</button>

        <button
          v-if="hasStage"
          type="button"
          class="tcontract__inspect-btn"
          :class="{ 'tcontract__inspect-btn--active': inspecting }"
          @click="toggleInspect()"
        >{{ inspecting ? 'Inspecting…' : 'Inspect' }}</button>
        <span v-if="hasStage && inspecting" class="tcontract__inspect-hint text-style-utility-micro-uppercase">
          Hover a staged component below · hold Alt over a sibling to measure the gap between them
        </span>
      </div>

      <section v-for="c in rows" :key="c.id" class="tcontract__component">
        <h4 class="tcontract__title text-style-heading-card">{{ c.id }}</h4>
        <p v-if="c.notes" class="tcontract__notes text-style-paragraph-small">{{ c.notes }}</p>
        <p v-if="c.source" class="tcontract__source"><code>{{ c.source }}</code></p>

        <ComponentStage
          v-if="c.component"
          :component="c.component"
          :component-props="c.props || {}"
          :width="c.width"
          :height="c.height"
          :on-stage="c.onStage"
          :off-stage="c.offStage"
        />

        <table v-if="c.tokens?.length" class="tcontract__table">
          <thead>
            <tr>
              <th>Token</th>
              <th v-for="t in themes" :key="t.value">{{ t.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="name in c.tokens" :key="name">
              <td><code>{{ name }}</code></td>
              <td v-for="t in themes" :key="t.value">
                <TokenChip :name="name" :value="c.byTheme[t.value]?.[name] || '—'" />
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </div>
</template>

<style scoped>
.tcontract__empty { padding: var(--x-pad-surface-l); color: var(--x-text-body-subtle); text-align: center; }

.tcontract__theme-picker {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--x-gap-content-tight);
  margin-bottom: var(--x-gap-content-loose);
}
.tcontract__theme-label { color: var(--x-text-body-subtle); margin-right: var(--x-gap-content-narrow); }
.tcontract__theme-btn {
  padding: var(--x-pad-surface-xxs) var(--x-pad-surface-s);
  border-radius: var(--x-radius-badge-s);
  border: var(--border-weight-default) solid var(--x-border-card-default);
  background: var(--x-bg-card-default);
  color: var(--x-text-body-soft);
  font-size: var(--x-sys-size-body-s);
  cursor: pointer;
}
.tcontract__theme-btn--active { border-color: var(--x-border-card-selected); color: var(--x-text-body-default); font-weight: var(--x-sys-weight-bold); }

.tcontract__inspect-btn {
  margin-left: auto;
  padding: var(--x-pad-surface-xxs) var(--x-pad-surface-s);
  border-radius: var(--x-radius-badge-s);
  border: var(--border-weight-default) solid #ff2d55;
  background: transparent;
  color: #ff2d55;
  font-size: var(--x-sys-size-body-s);
  font-weight: var(--x-sys-weight-bold);
  cursor: pointer;
}
.tcontract__inspect-btn--active { background: #ff2d55; color: #fff; }
.tcontract__inspect-hint { flex-basis: 100%; color: var(--x-text-body-subtle); }

.tcontract__component {
  border: var(--border-weight-default) solid var(--x-border-card-default);
  border-radius: var(--x-radius-container-m);
  padding: var(--x-pad-surface-l);
  margin-bottom: var(--x-gap-content-loose);
  background: var(--x-bg-card-default);
}
.tcontract__title { margin: 0 0 var(--x-gap-content-tight); }
.tcontract__notes { margin: 0 0 var(--x-gap-content-narrow); color: var(--x-text-body-soft); }
.tcontract__source { margin: 0 0 var(--x-gap-content-default); color: var(--x-text-body-subtle); font-size: var(--x-sys-size-body-s); }
.tcontract__source code { font-family: monospace; }

.tcontract__table { width: 100%; border-collapse: collapse; font-size: var(--x-sys-size-body-s); margin-top: var(--x-gap-content-default); }
.tcontract__table th, .tcontract__table td {
  padding: var(--x-pad-surface-xs) var(--x-pad-surface-s);
  border-bottom: var(--border-weight-default) solid var(--x-border-card-default);
  text-align: left;
}
.tcontract__table code { color: var(--x-text-hyperlink-default); font-family: monospace; }
</style>
