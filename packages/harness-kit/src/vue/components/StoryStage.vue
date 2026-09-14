<script setup>
/**
 * StoryStage — the render host for one story variant (dev chrome).
 *
 * Wraps the live component in a div with `container-type: inline-size` set to a
 * chosen device width, so the prototype's `@container` layouts resolve exactly
 * as they do inside the real DeviceFrame's `.device__screen`. `container-type`
 * alone only establishes the containing block for `position: absolute`
 * descendants (layout containment) — trapping `position: fixed` ones (the
 * actual overlay-component case: sheets, drawers, Snackbar's responsive mode)
 * needs `contain: paint` too, which the stage also sets, so overlay components
 * stay trapped inside the stage instead of escaping to the real viewport.
 *
 * Variant props may be a plain object or a function of the live store context
 * ({ assets, strings, config, theme }); the function form is re-evaluated on
 * every theme switch so imagery/copy track the active store. Each variant may
 * also declare setup()/teardown() to prime + reset singleton state (e.g. opening
 * the checkout sheet for CheckoutSheet).
 */
import { computed, inject, ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  story:        { type: Object, default: null },
  variantIndex: { type: Number, default: 0 },
  // 'iphone' | 'samsung' | 'responsive'
  width:        { type: String, default: 'iphone' },
  context:      { type: Object, default: null },
})

const injectedContext = inject('harnessContext', null)
const ctx = computed(() => {
  if (props.context) return props.context
  if (injectedContext) return (typeof injectedContext === 'function' ? injectedContext() : (injectedContext.value || injectedContext))
  return {
    assets: {},
    strings: {},
    config: {},
    theme: 'codm',
  }
})

// Content widths matching the device screens the prototype targets; 'responsive'
// fills the available stage column.
const WIDTHS = { iphone: '390px', samsung: '384px', responsive: '100%' }
const hostWidth = computed(() => WIDTHS[props.width] || WIDTHS.iphone)

// Reproduce the store's real page backdrop on the stage screen. Mirrors App.vue's
// bgImageStyle (storeAssets.brand.bg → --page-bg-image): stores that paint a fixed
// page-bg image (YGODL, efootball) render faithfully here. Combined with the
// opaque base colour in CSS, the screen is never transparent even when a theme
// sets --x-bg-page to `transparent` (the YGODL case).
const screenStyle = computed(() => {
  const bg = ctx.value?.assets?.brand?.bg
  return {
    width: hostWidth.value,
    ...(bg ? { '--page-bg-image': `url(${bg})` } : {}),
  }
})

const variant = computed(() => props.story?.variants?.[props.variantIndex] || null)

const resolvedProps = computed(() => {
  const p = variant.value?.props
  if (typeof p === 'function') {
    try { return p(ctx.value) || {} }
    catch (e) { console.warn('[library] variant props() threw', e); return {} }
  }
  return p || {}
})

// Remount the component on every story/variant/theme change so entrance motion
// re-fires and setup-primed state is rebuilt cleanly.
const renderKey = computed(() =>
  `${props.story?.id}:${props.variantIndex}:${ctx.value?.theme}`
)

// ── setup / teardown hooks ──────────────────────────────────────────────────
let activeTeardown = null
function runTeardown () {
  if (activeTeardown) { try { activeTeardown() } catch { /* noop */ } activeTeardown = null }
}
watch(
  () => [props.story?.id, props.variantIndex],
  () => {
    runTeardown()
    const v = variant.value
    if (v?.setup) { try { v.setup(); activeTeardown = v.teardown || null } catch (e) { console.warn('[library] variant setup() threw', e) } }
  },
  { immediate: true }
)
onBeforeUnmount(runTeardown)

// Expose the rendered component's root element for the inspector deep-link.
const slotRef = ref(null)
function componentEl () {
  return slotRef.value?.firstElementChild || slotRef.value || null
}
defineExpose({ componentEl })
</script>

<template>
  <div class="stage-host" :class="{ 'stage-host--overlay': story && story.overlay }">
    <div
      ref="slotRef"
      class="stage-host__screen"
      :style="screenStyle"
    >
      <component
        :is="story.component"
        v-if="story && variant"
        :key="renderKey"
        v-bind="resolvedProps"
      />
    </div>
  </div>
</template>

<style scoped>
/* The stage host centres the device-width screen and provides the page backdrop.
   Dev chrome — uses store tokens only for the backdrop so the staged component
   sits on its real page colour; layout values are intentionally ad-hoc. */
.stage-host {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  min-height: 100%;
  padding: 32px 24px;
  box-sizing: border-box;
}

.stage-host__screen {
  position: relative;
  /* Establishes @container context (layout containment traps position:absolute,
     but NOT position:fixed — a fixed descendant's containing block is only the
     nearest ancestor with contain:paint, a transform, or similar, per the CSS
     containing-block spec). */
  container-type: inline-size;
  /* The line that actually traps position:fixed overlay descendants (sheets,
     drawers, Snackbar's responsive mode) inside the stage instead of the real
     viewport (mirrors .device__screen). Safe/redundant with overflow:hidden
     below — paint containment implies the same clipping. */
  contain: paint;
  max-width: 100%;
  min-height: 200px;
  border-radius: 12px;
  /* Faithful store page backdrop that can never go transparent. Layers (top→base):
       1. --page-bg-image — the store's fixed page art (YGODL/efootball), if any;
       2. the store page colour (--x-bg-page) — for solid-colour stores;
       3. background-color #0c0e16 — opaque base, so a `transparent` --x-bg-page
          (YGODL) reveals this dev fallback rather than the chrome behind it. */
  background-color: #0c0e16;
  background-image:
    var(--page-bg-image, none),
    linear-gradient(var(--x-bg-page, #0c0e16), var(--x-bg-page, #0c0e16));
  background-size: cover, auto;
  background-position: center top, 0 0;
  background-repeat: no-repeat, repeat;
  /* Subtle frame so the component's own edges read against the chrome. */
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08), 0 24px 60px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}

/* Overlay stories (sheets/drawers) need a tall stage so the trapped fixed
   surface has room to sit over a representative page height. */
.stage-host--overlay .stage-host__screen {
  min-height: 640px;
}
</style>
