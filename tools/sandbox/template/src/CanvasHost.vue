<script setup>
import { useTheme } from '@/composables/useTheme.js'

/**
 * CanvasHost — the sandbox's stage. Real components need no context adapter
 * (unlike the design harness's StoryStage, which injects
 * {assets,config,strings,theme} to render ONE component in isolation outside
 * the real app tree) — every vendored composable already resolves against
 * whichever store(s) this bundle vendored via useTheme()'s shared ref. This
 * host provides:
 *   1. the visual stage — a real container-query root that traps
 *      `position: fixed` overlay descendants (see @coda/harness-kit's
 *      StoryStage CSS note) so a composed page behaves the same as it would
 *      mounted in the real App.vue.
 *   2. an optional store switcher — a plain <select> mirroring the real
 *      repo's own DeviceToolbar.vue switcher, shown only when this bundle
 *      vendored more than one store (`themes.length > 1`). A single-store
 *      bundle renders nothing here — same as Milestone 1.
 */
const { theme, themes, setTheme } = useTheme()
</script>

<template>
  <div class="canvas-host">
    <div v-if="themes.length > 1" class="canvas-host__switcher">
      <select :value="theme" @change="setTheme($event.target.value)">
        <option v-for="opt in themes" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.canvas-host {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  container-type: inline-size;
  background: var(--x-bg-page);
}
.canvas-host__switcher {
  position: fixed;
  top: var(--x-pad-surface-s);
  right: var(--x-pad-surface-s);
  z-index: 999;
}
.canvas-host__switcher select {
  padding: var(--x-pad-surface-xxs) var(--x-pad-surface-s);
  border-radius: var(--x-radius-container-xs);
  border: var(--border-weight-default) solid var(--x-border-sheet);
  background: var(--x-bg-sheet);
  color: var(--x-text-header-default);
}
</style>
