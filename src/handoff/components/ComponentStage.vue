<script setup>
/**
 * ComponentStage — live-render host for one flow component. Mirrors
 * src/library/StoryStage.vue's container-query + page-backdrop setup (same
 * reasons: @container must resolve exactly as it does inside the real
 * DeviceFrame, and `position: fixed` overlay descendants must stay trapped
 * inside the stage) but takes a bare component reference instead of a
 * library story, since a flow's components[] are plain { id, component,
 * tokens } entries, not story/variant objects.
 *
 * NOTE on theming: store themes are selected via `html[data-theme="…"]` — a
 * selector that only matches the <html> element itself, never a nested
 * attribute. So this stage always renders under whatever theme is globally
 * active (useTheme().setTheme) — there is no way to render two themes
 * side-by-side live without a second document (e.g. an iframe per theme),
 * which this framework does not attempt. "Compare across stores" for a
 * component means flipping the toolbar's theme switcher and re-rendering,
 * exactly like the existing component library does; comparing RESOLVED TOKEN
 * VALUES across every theme at once (no re-render needed) is what
 * TokenLibrary/TokenContract do instead, since that only requires reading
 * getComputedStyle, not repainting a themed subtree.
 */
import { computed, onBeforeUnmount, watch } from 'vue'
import { useStoreAssets } from '../../composables/useStoreAssets.js'

const props = defineProps({
  component: { type: Object, required: true },
  componentProps: { type: Object, default: () => ({}) },
  width: { type: String, default: '390px' },
  // Fixed stage height override — needed only for a component whose content
  // sizes itself via `position: absolute; inset: 0` against this stage (e.g.
  // a BaseSheet mounted here for a composed preview) rather than in normal
  // flow, since an out-of-flow child contributes nothing to the parent's
  // intrinsic height and .cstage__screen would otherwise stay pinned at its
  // 200px min-height regardless of how much content the sheet actually has.
  height: { type: String, default: null },
  // Optional priming hooks, same shape as src/library/story.js's
  // setup()/teardown() — needed for components (like the locale sheets) that
  // read their open/visible state from a singleton composable rather than a
  // prop, so simply mounting the component renders nothing.
  onStage: { type: Function, default: null },
  offStage: { type: Function, default: null },
})

const assets = useStoreAssets()

function runOnStage () { try { props.onStage?.() } catch (e) { console.warn('[handoff] onStage threw', e) } }
function runOffStage () { try { props.offStage?.() } catch { /* noop */ } }

watch(() => props.component, () => { runOffStage(); runOnStage() }, { immediate: true })
onBeforeUnmount(runOffStage)

const screenStyle = computed(() => {
  const bg = assets.value?.brand?.bg
  return {
    width: props.width,
    ...(props.height ? { height: props.height } : {}),
    ...(bg ? { '--page-bg-image': `url(${bg})` } : {}),
  }
})
</script>

<template>
  <div class="cstage">
    <div class="cstage__screen" :style="screenStyle">
      <component :is="component" v-bind="componentProps" />
    </div>
  </div>
</template>

<style scoped>
/* Dev chrome — mirrors StoryStage.vue's backdrop treatment; layout values are
   intentionally ad-hoc, only the staged component uses the token system. */
.cstage {
  display: flex;
  justify-content: center;
  padding: var(--x-pad-surface-l);
}
.cstage__screen {
  position: relative;
  container-type: inline-size;
  max-width: 100%;
  min-height: 200px;
  border-radius: var(--x-radius-container-m);
  background-color: #0c0e16;
  background-image: var(--page-bg-image, none), linear-gradient(var(--x-bg-page, #0c0e16), var(--x-bg-page, #0c0e16));
  background-size: cover, auto;
  background-position: center top, 0 0;
  background-repeat: no-repeat, repeat;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08), 0 24px 60px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}
</style>
