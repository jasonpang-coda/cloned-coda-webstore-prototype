<script setup>
/**
 * SkuCardsTimeline — scrubs the entrance cascade + price reveal as a PURE
 * function of ms (no RAF here; BeatTimeline owns playback). Models a SkuList of
 * six cards: card i enters at i·90ms over one --motion-sys-duration-slow, then
 * its price block fades in one more SLOW later (the README §1 two-beat reveal).
 */
import { computed, onMounted, ref } from 'vue'
import { getToken, parseDuration } from '../utils/tokens.js'

const STAGGER = 90              // ms — the shipped per-card stagger (lists pass index*90)
const COUNT = 6
const SLOW = ref(350)           // --motion-sys-duration-slow, read live on mount

onMounted(() => { SLOW.value = parseDuration(getToken('--motion-sys-duration-slow')) || 350 })

const range = computed(() => (COUNT - 1) * STAGGER + SLOW.value * 2)

const beats = computed(() => [
  { ms: 0, label: 'Card 0 enters' },
  { ms: SLOW.value, label: 'Card 0 settled · price 0 starts' },
  { ms: (COUNT - 1) * STAGGER, label: `Card ${COUNT - 1} enters (last)` },
  { ms: (COUNT - 1) * STAGGER + SLOW.value, label: 'Last card settled · its price starts' },
  { ms: range.value, label: 'All prices revealed' },
])

const clamp01 = (x) => Math.max(0, Math.min(1, x))
// decelerate-ish ease for the readout (visual approximation of the token curve)
const ease = (t) => 1 - Math.pow(1 - t, 3)

function cardStyle(i, ms) {
  const t = ease(clamp01((ms - i * STAGGER) / SLOW.value))
  return { opacity: t, transform: `translateY(${(1 - t) * 6}px)` }
}
function priceStyle(i, ms) {
  const t = ease(clamp01((ms - (i * STAGGER + SLOW.value)) / SLOW.value))
  return { opacity: t }
}
const cards = Array.from({ length: COUNT }, (_, i) => i)
</script>

<template>
  <BeatTimeline :beats="beats" :range="range" :step="10">
    <template #default="{ ms }">
      <div class="tl-stage">
        <div v-for="i in cards" :key="i" class="tl-card" :style="cardStyle(i, ms)">
          <div class="tl-card__amount">{{ (i + 1) * 500 }}</div>
          <div class="tl-card__price" :style="priceStyle(i, ms)">${{ ((i + 1) * 4.99).toFixed(2) }}</div>
        </div>
      </div>
    </template>
  </BeatTimeline>
</template>

<style scoped>
.tl-stage {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
  max-width: 420px;
}
.tl-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 72px;
  padding: var(--pad-surface-s);
  border-radius: var(--radius-container-s);
  background: var(--bg-sku-card-default);
  border: 1px solid color-mix(in oklch, var(--text-body-default) 25%, transparent);
}
.tl-card__amount { color: var(--text-header-default); font-weight: 700; font-size: 16px; }
.tl-card__price { color: var(--text-hyperlink-default); font-weight: 700; text-align: right; }
</style>
