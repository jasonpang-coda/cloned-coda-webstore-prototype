<script setup>
import { computed, onMounted, ref } from 'vue'
import { getToken, parseDuration } from '../utils/tokens.js'
import kujiPortrait from '../../../vendor/img/slide-kui-ji-portrait.jpg'
import boysPortrait from '../../../vendor/img/slide-the-boys-portrait.jpg'

const INTERVAL = ref(5000) // --motion-sku-story
const FADE = ref(350)      // --motion-sku-story-fade

const range = computed(() => INTERVAL.value + FADE.value)

const beats = computed(() => [
  { ms: 0, label: 'Active segment starts filling (linear)' },
  { ms: INTERVAL.value, label: 'Fill complete → animationend fires → advance + crossfade begins' },
  { ms: range.value, label: 'Crossfade done — next slide active' },
])

// Stage visuals as pure functions of ms (passed from BeatTimeline slot).
function fillPct(ms) { return Math.min(ms / INTERVAL.value, 1) * 100 }
function crossfadeT(ms) { return Math.max(0, Math.min((ms - INTERVAL.value) / FADE.value, 1)) }
function slideAOpacity(ms) { return ms > INTERVAL.value ? 1 - crossfadeT(ms) : 1 }
function slideBOpacity(ms) { return ms > INTERVAL.value ? crossfadeT(ms) : 0 }

onMounted(() => {
  INTERVAL.value = parseDuration(getToken('--motion-sku-story')) || 5000
  FADE.value = parseDuration(getToken('--motion-sku-story-fade')) || 350
})
</script>

<template>
  <!-- BeatTimeline owns RAF scrub/play/speed chrome. The default slot renders the
       stage as a pure function of { ms } with no local state. -->
  <BeatTimeline :beats="beats" :range="range">
    <template #default="{ ms }">
      <div class="sct__frame">
        <img :src="kujiPortrait" alt="" class="sct__img" :style="{ opacity: slideAOpacity(ms) }" />
        <img :src="boysPortrait" alt="" class="sct__img" :style="{ opacity: slideBOpacity(ms) }" />
        <div class="sct__pagination">
          <div class="sct__seg"><div class="sct__seg-fill" :style="{ width: `${fillPct(ms)}%` }" /></div>
          <div class="sct__seg"><div class="sct__seg-fill" style="width: 0%" /></div>
        </div>
      </div>
    </template>
  </BeatTimeline>
</template>

<style scoped>
.sct__frame {
  position: relative;
  width: 240px;
  max-width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 4px;
  overflow: hidden;
  background: #14110f;
}
.sct__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.sct__pagination {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 2;
  display: flex;
  gap: 4px;
  padding: 8px 12px;
}
.sct__seg { flex: 1 1 0; height: 4px; border-radius: 999px; background: rgba(255, 255, 255, 0.3); overflow: hidden; }
.sct__seg-fill { height: 100%; border-radius: 999px; background: var(--vp-c-brand-1); }
</style>
