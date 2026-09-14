<script setup>
/**
 * TokenLibrary — base tokens + every registered store's theme override, side
 * by side, resolved LIVE (never transcribed). Filterable to just the tokens
 * a given flow touches.
 *
 * "Base" here means the value the token computes to with no [data-theme]
 * override winning — i.e. under the store currently active when /handoff was
 * opened, before this component samples other themes. Comparing across
 * themes below is what shows what each store actually overrides.
 */
import { computed, ref } from 'vue'
import { TokenChip } from '@coda/harness-kit/vue'
import { useTheme } from '../../composables/useTheme.js'
import { resolveTokensAcrossThemes } from '../resolve.js'
import { affectedTokens } from '../flow.js'

const props = defineProps({
  flow: { type: Object, default: null }, // null = show nothing filtered (whole-catalog mode not wired yet)
})

const { themes, theme: activeTheme } = useTheme()

const tokenNames = computed(() => (props.flow ? affectedTokens(props.flow) : []))
const selectedThemes = ref(themes.map(t => t.value))

// Re-sampled whenever the token set or the theme selection changes.
const table = computed(() => {
  if (!tokenNames.value.length) return {}
  return resolveTokensAcrossThemes(tokenNames.value, selectedThemes.value)
})

function toggleTheme (key) {
  const i = selectedThemes.value.indexOf(key)
  if (i === -1) selectedThemes.value = [...selectedThemes.value, key]
  else selectedThemes.value = selectedThemes.value.filter(k => k !== key)
}

// A token row where every selected theme resolves to the same value has no
// override — flag rows that DO differ, since that's what a whitelabel review needs.
function rowDiffers (name) {
  const vals = selectedThemes.value.map(t => table.value[t]?.[name])
  return new Set(vals).size > 1
}
</script>

<template>
  <div class="token-lib">
    <p v-if="!flow" class="token-lib__empty">Select a flow to see its token contract.</p>

    <template v-else>
      <div class="token-lib__theme-picker">
        <button
          v-for="t in themes"
          :key="t.value"
          type="button"
          class="token-lib__theme-btn"
          :class="{ 'token-lib__theme-btn--active': selectedThemes.includes(t.value), 'token-lib__theme-btn--current': t.value === activeTheme }"
          @click="toggleTheme(t.value)"
        >{{ t.label }}</button>
      </div>

      <div v-if="!tokenNames.length" class="token-lib__empty">This flow declares no tokens yet.</div>

      <table v-else class="token-lib__table">
        <thead>
          <tr>
            <th>Token</th>
            <th v-for="t in selectedThemes" :key="t">{{ themes.find(x => x.value === t)?.label || t }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="name in tokenNames" :key="name" :class="{ 'token-lib__row--diff': rowDiffers(name) }">
            <td><code>{{ name }}</code></td>
            <td v-for="t in selectedThemes" :key="t">
              <TokenChip :name="name" :value="table[t]?.[name] || '—'" />
            </td>
          </tr>
        </tbody>
      </table>

      <p class="token-lib__hint text-style-utility-default-regular">
        Highlighted rows resolve to different values across the selected stores —
        those are this flow's actual whitelabel surface area.
      </p>
    </template>
  </div>
</template>

<style scoped>
.token-lib__empty {
  padding: var(--x-pad-surface-l);
  color: var(--x-text-body-subtle);
  text-align: center;
}
.token-lib__theme-picker {
  display: flex;
  flex-wrap: wrap;
  gap: var(--x-gap-content-tight);
  margin-bottom: var(--x-gap-content-default);
}
.token-lib__theme-btn {
  padding: var(--x-pad-surface-xxs) var(--x-pad-surface-s);
  border-radius: var(--x-radius-badge-s);
  border: var(--border-weight-default) solid var(--x-border-card-default);
  background: var(--x-bg-card-default);
  color: var(--x-text-body-soft);
  font-size: var(--x-sys-size-body-s);
  cursor: pointer;
}
.token-lib__theme-btn--active { border-color: var(--x-border-card-selected); color: var(--x-text-body-default); }
.token-lib__theme-btn--current { font-weight: var(--x-sys-weight-bold); }

.token-lib__table { width: 100%; border-collapse: collapse; font-size: var(--x-sys-size-body-s); }
.token-lib__table th, .token-lib__table td {
  padding: var(--x-pad-surface-xs) var(--x-pad-surface-s);
  border-bottom: var(--border-weight-default) solid var(--x-border-card-default);
  text-align: left;
  vertical-align: top;
}
.token-lib__table code { color: var(--x-text-hyperlink-default); font-family: monospace; }
.token-lib__row--diff { background: var(--x-bg-card-highlighted); }

.token-lib__hint { margin-top: var(--x-gap-content-default); color: var(--x-text-body-subtle); }
</style>
