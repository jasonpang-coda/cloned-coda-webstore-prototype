<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Media from './Media.vue'
import SkuTag from './SkuTag.vue'
import MaterialIcon from './MaterialIcon.vue'
import { useGiftClaim } from '../composables/useGiftClaim.js'
import { useTaskGiftClaim } from '../composables/useTaskGiftClaim.js'
import { useHaptics } from '../composables/useHaptics.js'
import { useFeatureFlags } from '../composables/useFeatureFlags.js'

/**
 * GiftSkuCard — a free-gift offer card for the COD:M Gifts category. Shows the
 * gift's product art on a rarity-graded glow, a "FREE GIFT" tag, the gift title +
 * optional subtitle, a purchase limit, a "CLAIM GIFT" label, and a live countdown.
 * Mirrors Figma node 5357:10819.
 *
 * Tapping opens the gift-claim sheet (useGiftClaim) once the account is identified
 * (signed in or guest-verified) — a gated no-op otherwise. The claimed state is
 * driven by the shared composable, set once the claim is confirmed in the sheet.
 */
const props = defineProps({
  /** Stable claim identity (keys the confirmed-claim state) */
  id: { type: String, required: true },
  /** Square gift product art */
  image: { type: String, required: true },
  /** Top-left tag label */
  tagLabel: { type: String, default: 'FREE GIFT' },
  /** Gift title, e.g. "DAILY GIFT" */
  title: { type: String, required: true },
  /** Optional short description line below the title */
  subtitle: { type: String, default: null },
  /** Purchase-limit line, e.g. "Limit:1" */
  limitLabel: { type: String, default: null },
  /** Claim CTA label */
  ctaLabel: { type: String, default: 'CLAIM GIFT' },
  /** Task-gift only — CTA label once every step is done and the reward is
   *  actually ready to claim (e.g. once web push is on), replacing ctaLabel
   *  ("Learn More") for that one step. Unused for instant-claim gifts. */
  readyLabel: { type: String, default: 'Claim Gift' },
  /** Label shown in place of the CTA once claimed */
  claimedLabel: { type: String, default: 'CLAIMED' },
  /** Gift end time (ms epoch). When set, a live countdown is shown. */
  endsAt: { type: Number, default: null },
  /** Entrance delay (ms) */
  baseDelay: { type: Number, default: 0 },
  /** When true, countdown prefix switches "Ends:" → "Refreshes:" after claiming */
  refreshesOnClaim: { type: Boolean, default: false },
  /** Localised prefix for the resting-state countdown */
  endsLabel: { type: String, default: 'Ends:' },
  /** Localised prefix shown when claimed and refreshesOnClaim is true */
  refreshesLabel: { type: String, default: 'Refreshes:' },
  /** When true, tapping opens TaskGiftSheet (useTaskGiftClaim) instead of the
   *  instant-claim sheet — for the install+push task-gated reward gift. */
  taskGift: { type: Boolean, default: false },
})

const cardStyle = computed(() => ({ animationDelay: props.baseDelay + 'ms' }))

// ── Live countdown (ticks once a second; informational, runs regardless of
// prefers-reduced-motion). Drops the day segment when days === 0 so it reads
// "14h 48m" rather than "0d 14h 48m".
const now = ref(Date.now())
let timer = null
onMounted(() => {
  if (props.endsAt == null) return
  timer = setInterval(() => { now.value = Date.now() }, 1000)
})
onBeforeUnmount(() => { if (timer) clearInterval(timer) })

const countdown = computed(() => {
  if (props.endsAt == null) return null
  const ms = Math.max(0, props.endsAt - now.value)
  const totalMin = Math.floor(ms / 60000)
  const days = Math.floor(totalMin / 1440)
  const hours = Math.floor((totalMin % 1440) / 60)
  const mins = totalMin % 60
  const pad = (n) => String(n).padStart(2, '0')
  return days > 0
    ? `${days}d ${pad(hours)}h ${pad(mins)}m`
    : `${pad(hours)}h ${pad(mins)}m`
})

// ≥72h → default body colour; 24h–72h → warning; <24h → error
const countdownUrgency = computed(() => {
  if (props.endsAt == null) return 'default'
  const hoursLeft = (props.endsAt - now.value) / 3600000
  if (hoursLeft >= 72) return 'default'
  if (hoursLeft >= 24) return 'warning'
  return 'error'
})

const { openGiftClaim, isClaimed, claimSheetOpen, selectedGift, unclaimGift } = useGiftClaim()
const { openSheet: openTaskGiftSheet, claimed: taskGiftClaimed, step: taskGiftStep, sheetOpen: taskGiftSheetOpen, unclaim: unclaimTaskGift } = useTaskGiftClaim()
const { isEnabled } = useFeatureFlags()
const isSelected = computed(() =>
  props.taskGift
    ? taskGiftSheetOpen.value
    : claimSheetOpen.value && selectedGift.value?.id === props.id,
)
const { haptic } = useHaptics()

const isPressed = ref(false)

// CLAIMED state is shared — set once the claim is confirmed in the sheet.
// Task gifts read their own persisted composable instead of the per-id set.
const claimed = computed(() => props.taskGift ? taskGiftClaimed.value : isClaimed(props.id))

// Debug-only reset control (see the `allowGiftUnclaim` feature flag) — lets
// a claimed card be retested without clearing localStorage by hand.
const showUnclaim = computed(() => claimed.value && isEnabled('allowGiftUnclaim'))
function onUnclaim(e) {
  e.stopPropagation()
  if (props.taskGift) unclaimTaskGift()
  else unclaimGift(props.id)
}

function onClaim() {
  if (props.taskGift) {
    openTaskGiftSheet()
    haptic('select')
    return
  }
  // Fire the 'select' haptic only when the sheet actually opens (gated no-op stays silent).
  const opened = openGiftClaim({
    id: props.id,
    title: props.title,
    subtitle: props.subtitle,
    image: props.image,
  })
  if (opened) haptic('select')
}

const countdownPrefix = computed(() =>
  claimed.value && props.refreshesOnClaim ? props.refreshesLabel : props.endsLabel
)

// Task gift's CTA swaps to the "ready to claim" label once install + push
// are both done (web push on) but not yet claimed — otherwise it's still
// just pointing at instructions ("Learn More"). Instant-claim gifts are
// unaffected (taskGiftStep only ever applies while props.taskGift is true).
const ctaText = computed(() => {
  if (props.taskGift && !claimed.value && taskGiftStep.value === 'claim') return props.readyLabel
  return props.ctaLabel
})
</script>

<template>
  <div
    class="gift"
    :style="cardStyle"
    :class="{ 'gift--claimed': claimed, 'gift--selected': isSelected, 'gift--pressed': isPressed }"
    @click="onClaim"
    @mousedown="isPressed = true"
    @mouseup="isPressed = false"
    @mouseleave="isPressed = false"
    @touchstart.passive="isPressed = true"
    @touchend.passive="isPressed = false"
  >
    <!-- Gift art container; SkuTag overlaid at top-left, debug unclaim at top-right -->
    <div class="gift__media">
      <SkuTag v-if="tagLabel" class="gift__tag" :label="tagLabel" variant="value" />
      <button
        v-if="showUnclaim"
        v-ripple v-haptic
        type="button"
        class="gift__unclaim"
        aria-label="Reset claim (debug)"
        data-poi="gift-unclaim"
        @click="onUnclaim"
      >
        <MaterialIcon name="replay" variant="round" :size="16" />
      </button>
      <Media :src="image" class="gift__img" :style="{ opacity: claimed ? 0.3 : 1 }" />
    </div>

    <!-- Info: title + optional subtitle + limit, then CTA row -->
    <div class="gift__info">
      <div class="gift__text">
        <p class="gift__title text-style-heading-sku-title">{{ title }}</p>
        <p v-if="subtitle" class="gift__subtitle text-style-utility-label-regular">{{ subtitle }}</p>
        <p v-if="limitLabel" class="gift__limit text-style-utility-label-regular">{{ limitLabel }}</p>
      </div>

      <!-- CLAIM GIFT + countdown share a single row -->
      <div class="gift__action">
        <p class="gift__cta text-style-heading-sku-title" :class="{ 'gift__cta--claimed': claimed }">{{ claimed ? claimedLabel : ctaText }}</p>
        <span v-if="countdown" class="gift__countdown" :class="{ 'gift__countdown--claimed': claimed }" :data-urgency="claimed ? null : countdownUrgency">
          <MaterialIcon name="schedule" :size="14" class="gift__countdown-icon" />
          <span class="gift__countdown-text text-style-utility-label-regular">{{ countdownPrefix }} {{ countdown }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gift {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
  border-radius: var(--x-radius-container-s);
  background: var(--x-bg-sku-card-default);
  backdrop-filter: blur(var(--x-blur-container, 32px));
  -webkit-backdrop-filter: blur(var(--x-blur-container, 32px));
  overflow: hidden;
  cursor: pointer;
  animation-name: gift-enter;
  animation-duration: var(--x-motion-sys-duration-slow);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: both;
  transition: background var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate);
}

.gift--claimed { cursor: default; }

.gift--selected {
  background: var(--x-bg-card-selected);
  box-shadow: var(--x-shadow-card-selected);
  transition: box-shadow var(--x-motion-sku-select);
}
.gift--selected::before {
  background: var(--x-border-sku-card-selected);
  padding: var(--border-weight-selected);
}
.gift--pressed {
  transform: scale(var(--x-motion-sku-press-scale)) !important;
  transition:
    transform var(--x-motion-sku-press),
    border-color var(--x-motion-sku-press);
}

/* Tokenised gradient border ring (same mask-composite idiom as all other cards) */
.gift::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: var(--border-weight-default);
  background: var(--x-border-sku-card-default);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: destination-out;
  pointer-events: none;
  z-index: 3;
}

/* Gift art — height = image + 8px top/bottom padding only */
.gift__media {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--x-pad-surface-s) 0;
  border-radius: var(--x-radius-container-xs);
  overflow: hidden;
}

.gift__img {
  width: 160px;
  height: 160px;
  object-fit: contain;
  pointer-events: none;
  transition: opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-standard);
}

/* FREE GIFT tag — positioned absolute over the art at top-left.
   SkuTag handles all visual styling (bg, colour, padding, border-radius). */
.gift__tag {
  position: absolute;
  top: var(--x-pad-surface-xs);
  left: var(--x-pad-surface-xs);
  z-index: 2;
}

/* Debug-only unclaim control (see the `allowGiftUnclaim` feature flag) —
   mirrors .gift__tag's placement, opposite corner. Not present in Figma;
   only ever rendered behind the dev flag, so no light/dark or per-store
   design pass is needed here. */
.gift__unclaim {
  position: absolute;
  top: var(--x-pad-surface-xs);
  right: var(--x-pad-surface-xs);
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--x-size-icon-l);
  height: var(--x-size-icon-l);
  border: 0;
  border-radius: var(--x-radius-badge-full);
  background: var(--x-surface-ghost-5);
  color: var(--x-text-header-default);
  cursor: pointer;
}

/* Info block */
.gift__info {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: var(--x-gap-content-tight);
  padding: var(--x-pad-surface-s) var(--x-pad-surface-s) var(--x-pad-surface-m);
}

.gift__text {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-tight);
}

.gift__title {
  margin: 0;
  display: block;
  text-transform: uppercase;
  color: var(--x-text-header-default);
  transform-origin: left center;
}

.gift__subtitle {
  margin: 0;
  color: var(--x-text-body-default);
}

.gift__limit {
  margin: 0;
  color: var(--x-text-body-default);
}

/* CLAIM GIFT + countdown stacked vertically, centred across the card */
.gift__action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-narrow);
  margin-top: auto;
  padding-top: var(--x-pad-surface-s);
}

.gift__cta {
  margin: 0;
  display: block;
  text-align: center;
  color: var(--x-text-hyperlink-default);
  transform-origin: center center;
  transition: color var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-standard);
}

.gift__cta--claimed { color: var(--x-text-body-soft); }

.gift__countdown {
  position: relative;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}
.gift__countdown[data-urgency='default'] { color: var(--x-text-body-default); }
.gift__countdown[data-urgency='warning']  { color: var(--x-text-warning-default); }
.gift__countdown[data-urgency='error']    { color: var(--x-text-error-default); }
/* Claimed overrides urgency colour — rule order ensures it wins at equal specificity */
.gift__countdown--claimed { color: var(--x-text-body-subtle); }

/* Icon is pulled out of flow so only the text width is used for centering,
   aligning the timer text under the CTA above it. */
.gift__countdown-icon {
  position: absolute;
  right: calc(100% + var(--x-gap-content-tight));
  top: 50%;
  transform: translateY(-50%);
  flex-shrink: 0;
}

@keyframes gift-enter {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; }
}
</style>
