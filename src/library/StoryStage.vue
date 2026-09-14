<script setup>
/**
 * StoryStage adapter — delegates to @coda/harness-kit/vue's StoryStage,
 * injecting host-app store context (assets, config, strings, theme).
 */
import { ref } from 'vue'
import { StoryStage } from '@coda/harness-kit/vue'
// The package's own scoped CSS — never auto-injected by importing the
// component alone. Without this, .stage-host__screen has no
// `container-type`/`position: relative`/`overflow: hidden`, so it neither
// looks like a stage nor traps `position: fixed`/`absolute` overlay
// components (Snackbar, sheets, drawers) — they escape to the real page.
import '@coda/harness-kit/vue/style.css'
import { computed } from 'vue'
import { useStoreAssets, assetsFor } from '../composables/useStoreAssets.js'
import { useStoreConfig, configFor } from '../composables/useStoreConfig.js'
import { useStoreStrings, stringsFor } from '../composables/useStoreStrings.js'
import { useTheme } from '../composables/useTheme.js'
import { useLocale } from '../composables/useLocale.js'

const props = defineProps({
  story:        { type: Object, default: null },
  variantIndex: { type: Number, default: 0 },
  width:        { type: String, default: 'iphone' },
  // Renders as this store instead of the app's single global active theme —
  // for the library viewer's theme-grid mode (every store rendered at once,
  // each cell needing its OWN fixed theme regardless of what's globally
  // active). Every other consumer of this adapter leaves it unset and gets
  // the normal reactive-to-the-global-theme behavior, unchanged.
  themeOverride: { type: String, default: null },
})

const assets  = useStoreAssets()
const config  = useStoreConfig()
const strings = useStoreStrings()
const { theme } = useTheme()
const { language } = useLocale()

const hostContext = computed(() => props.themeOverride
  ? {
      assets: assetsFor(props.themeOverride),
      config: configFor(props.themeOverride),
      strings: stringsFor(props.themeOverride, language.value),
      theme: props.themeOverride,
    }
  : {
      assets: assets.value,
      config: config.value,
      strings: strings.value,
      theme: theme.value,
    })

// A <script setup> component is closed by default — nothing on it is
// visible to a parent's `ref` unless explicitly re-exposed here, even
// though the TEMPLATE below renders the real @coda/harness-kit StoryStage
// (which itself calls defineExpose({ componentEl })). Without this
// forwarding, LibraryViewer.vue's `stageRef.value.componentEl` is
// undefined, and every state-simulation call (hover/focus/pressed/
// disabled — applyState() in LibraryViewer.vue) throws
// "componentEl is not a function", caught nowhere, so the whole state
// tab UI has been silently cosmetic: `activeState` still flips (it's set
// before the throwing line), so the tab visibly highlights, but the DOM
// is never actually touched. Found while wiring up the new `focus` state
// (see plans/tickets/done/design-quality-gates.md Gate 3) — this bug predates it and
// affected hover/pressed/disabled identically.
const innerStage = ref(null)
defineExpose({ componentEl: () => innerStage.value?.componentEl() })
</script>

<template>
  <StoryStage
    ref="innerStage"
    :story="story"
    :variant-index="variantIndex"
    :width="width"
    :context="hostContext"
  />
</template>
