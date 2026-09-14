<script setup>
/**
 * Custom — the three classes of component-declared custom property, kept
 * strictly separate (never lumped into one "custom tokens" count):
 *   minted          — looks like a design token, isn't (drift; D08)
 *   local override  — repoints a REAL token locally (legitimate; D08b)
 *   layout var      — un-prefixed local geometry/animation state (sanctioned; D08c)
 */
import { computed } from 'vue'
import StatCard from './StatCard.vue'
import { stat } from '../core/rollup.js'

const props = defineProps({ model: { type: Object, required: true } })

const total = computed(() => props.model.localDeclarations.length)
const minted = computed(() => props.model.localByKind.minted)
const localOverride = computed(() => props.model.localByKind.localOverride)
const layoutVar = computed(() => props.model.localByKind.layoutVar)
</script>

<template>
  <div class="custom">
    <p class="custom__def text-style-utility-label-regular">
      120 .vue components can declare their own CSS custom properties. Three different things, easy to conflate:
      a <strong>minted</strong> property that looks like a design token but lives nowhere in src/tokens (real drift);
      a <strong>local override</strong> of a real token, e.g. repointing an FX colour to a button's own brand fill (legitimate);
      and a plain <strong>layout var</strong> like <code>--px</code> or <code>--card-warp</code> (sanctioned instance state, never a token).
    </p>

    <div class="custom__grid">
      <StatCard label="Minted (drift)" v-bind="stat(minted.length, total)" tone="bad" />
      <StatCard label="Local override (legitimate)" v-bind="stat(localOverride.length, total)" tone="good" />
      <StatCard label="Layout var (sanctioned)" v-bind="stat(layoutVar.length, total)" />
    </div>

    <div class="custom__section">
      <h3 class="custom__title text-style-utility-label-bold">Minted pseudo-tokens ({{ minted.length }})</h3>
      <div class="custom__list">
        <div v-for="(d, i) in minted" :key="i" class="custom__row">
          <code class="custom__name">{{ d.name }}</code>
          <span class="custom__loc text-style-utility-micro-regular">{{ d.file }}:{{ d.line }}</span>
        </div>
        <p v-if="!minted.length" class="custom__empty text-style-utility-label-regular">None found.</p>
      </div>
    </div>

    <div class="custom__section">
      <h3 class="custom__title text-style-utility-label-bold">Local overrides ({{ localOverride.length }})</h3>
      <div class="custom__list">
        <div v-for="(d, i) in localOverride" :key="i" class="custom__row">
          <code class="custom__name">{{ d.name }}</code>
          <span class="custom__loc text-style-utility-micro-regular">{{ d.file }}:{{ d.line }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom { display: flex; flex-direction: column; gap: var(--x-gap-content-separation); max-width: 960px; }
.custom__def { color: var(--x-text-body-soft); line-height: 1.5; }
.custom__def code { font-family: monospace; }
.custom__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--x-gap-content-default); }
.custom__title { color: var(--x-text-header-default); margin: 0 0 var(--x-gap-content-default); }
.custom__list { display: flex; flex-direction: column; gap: var(--x-gap-content-tight); max-height: 280px; overflow-y: auto; }
.custom__row { display: flex; align-items: center; justify-content: space-between; gap: var(--x-gap-content-default); }
.custom__name { font-family: monospace; color: var(--x-text-hyperlink-default); }
.custom__loc { color: var(--x-text-body-subtle); flex-shrink: 0; }
.custom__empty { color: var(--x-text-body-subtle); }
</style>
