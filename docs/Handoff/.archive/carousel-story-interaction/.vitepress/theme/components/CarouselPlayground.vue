<script setup>
import { computed, ref } from 'vue'
import StoryCarousel from './StoryCarousel.vue'

// Vendored slide art (imported so Vite resolves + hashes the URLs).
import kujiPortrait from '../../../vendor/img/slide-kui-ji-portrait.jpg'
import kujiLandscape from '../../../vendor/img/slide-kui-ji-landscape.jpg'
import boysPortrait from '../../../vendor/img/slide-the-boys-portrait.jpg'
import boysLandscape from '../../../vendor/img/slide-the-boys-landscape.jpg'

const slides = [
  { portrait: kujiPortrait, landscape: kujiLandscape, heading: 'Kui Ji Operator', ctaLabel: 'View bundle', ctaTarget: 'demo' },
  { portrait: boysPortrait, landscape: boysLandscape, heading: 'The Boys Crossover', ctaLabel: 'Shop now', ctaTarget: 'demo' },
]

const autoplay = ref(true)
const reduceMotion = ref(false)
const frame = ref('portrait') // 'portrait' (1:1, <801px) | 'landscape' (2.6:1, ≥801px)
const lastCta = ref('')

const stageStyle = computed(() => ({
  width: frame.value === 'landscape' ? '900px' : '360px',
  maxWidth: '100%',
}))

function onCta(slide) {
  lastCta.value = slide.ctaLabel
  setTimeout(() => { if (lastCta.value === slide.ctaLabel) lastCta.value = '' }, 2000)
}
</script>

<template>
  <!-- TokenSandbox owns token overrides, provides tokenRoot, renders sliders/selects/chips/reset.
       values['--motion-sku-story'] is a Number (ms) — used directly as the interval prop. -->
  <TokenSandbox title="Live carousel">
    <template #default="{ values }">
      <!-- Stage carries container-type so the carousel's @container (min-width:801px)
           landscape rule fires off THIS width, not the viewport. The frame toggle
           crosses the 801px line to swap portrait↔landscape. -->
      <div :style="stageStyle" style="container-type:inline-size;transition:width 0.3s ease;">
        <StoryCarousel
          :key="`${autoplay}-${reduceMotion}`"
          :slides="slides"
          :interval="values['--motion-sku-story'] ?? 5000"
          :autoplay="autoplay"
          :force-reduce-motion="reduceMotion"
          :base-delay="0"
          @cta="onCta"
        />
      </div>
      <p v-if="lastCta" style="text-align:center;font-size:12px;color:var(--vp-c-text-2);margin:8px 0 0;">
        CTA fired → <strong>{{ lastCta }}</strong> (emits <code>@cta</code>)
      </p>
    </template>

    <template #controls>
      <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;">
        <input type="checkbox" v-model="autoplay" /> autoplay
      </label>
      <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;">
        <input type="checkbox" v-model="reduceMotion" /> prefers-reduced-motion
      </label>
      <span style="display:inline-flex;border:1px solid var(--vp-c-divider);border-radius:6px;overflow:hidden;">
        <button
          type="button"
          :style="{ padding:'6px 12px', background: frame==='portrait' ? 'var(--vp-c-brand-1)' : 'transparent', border:0, color: frame==='portrait' ? '#111' : 'var(--vp-c-text-2)', fontWeight: frame==='portrait' ? 600 : 400, fontSize:'12px', cursor:'pointer' }"
          @click="frame = 'portrait'"
        >Portrait · 1:1</button>
        <button
          type="button"
          :style="{ padding:'6px 12px', background: frame==='landscape' ? 'var(--vp-c-brand-1)' : 'transparent', border:0, color: frame==='landscape' ? '#111' : 'var(--vp-c-text-2)', fontWeight: frame==='landscape' ? 600 : 400, fontSize:'12px', cursor:'pointer' }"
          @click="frame = 'landscape'"
        >Landscape · 2.6:1</button>
      </span>
    </template>

    <template #hint>
      Tap the left/right half to navigate · press &amp; hold to pause the fill ·
      the <code>prefers-reduced-motion</code> toggle is a handoff-only prop shim
      (the real component reads the OS setting).
    </template>
  </TokenSandbox>
</template>
