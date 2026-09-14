<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import MaterialIcon from './MaterialIcon.vue'
import InfoTag from './InfoTag.vue'
import { useStoreAssets } from '../composables/useStoreAssets.js'
import { useStoreConfig } from '../composables/useStoreConfig.js'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { useCountUp } from '../composables/useCountUp.js'
import { cssTimeToMs } from '../composables/useCssTimeMs.js'

/**
 * TrustBar — four-card trust-signal row (partner publishers, gamer count,
 * delivery speed, payment methods). Codashop only, gated in App.vue on
 * config.trustBar. Adapted from a PM-supplied reference mockup
 * (codashop-trust-bar.html / codashop-mobile-trustrow.html) into the repo's
 * own Grid/Span + design-token + motion-token system — not a literal port.
 *
 * Layout: 4-up with column dividers at L (≥1280px), 2×2 at M (801–1279px),
 * a swipeable one-card peek carousel with dot indicators at XS/S (<801px)
 * (mirrors the mobile reference's own more deliberate treatment there,
 * rather than just stacking to 1 column like the desktop reference's own
 * small-viewport fallback).
 */
const config = useStoreConfig()
const strings = useStoreStrings()
const assets = useStoreAssets()

const stats = computed(() => config.value.trustBar?.stats ?? {})
const t = computed(() => strings.value.trustBar ?? {})

const { value: gamersValue } = useCountUp(computed(() => stats.value.gamers))
const { value: deliveryValue } = useCountUp(computed(() => stats.value.deliveryRate))

// ── Publisher logo rotator — crossfades between logo pairs on a timer.
//    Real game-publisher logos (assets.content.publisherLogos), chunked into
//    pairs to match the reference's 2-logos-per-slot rotator. ──────────────
const publisherLogoGroups = computed(() => {
  const logos = assets.value.content.publisherLogos ?? []
  const groups = []
  for (let i = 0; i < logos.length; i += 2) groups.push(logos.slice(i, i + 2))
  return groups
})

const pubIndex = ref(0)
const reduceMotion = ref(false)
let mq = null
let pubTimer = null

function onMq(e) { reduceMotion.value = e.matches }

function startPubRotator() {
  stopPubRotator()
  if (reduceMotion.value || publisherLogoGroups.value.length < 2) return
  const interval = cssTimeToMs(
    getComputedStyle(document.documentElement).getPropertyValue('--x-motion-trust-rotate-interval'),
    2600,
  )
  pubTimer = setInterval(() => {
    pubIndex.value = (pubIndex.value + 1) % publisherLogoGroups.value.length
  }, interval)
}
function stopPubRotator() {
  if (pubTimer) { clearInterval(pubTimer); pubTimer = null }
}

// ── Mobile peek-carousel — dot nav + auto-advance + drag-to-swipe ──────────
const cardCount = 4
const activeCard = ref(0)
let carouselTimer = null

function goToCard(i) {
  activeCard.value = Math.max(0, Math.min(cardCount - 1, i))
  resetCarouselTimer()
}
function nextCard() { goToCard((activeCard.value + 1) % cardCount) }
function resetCarouselTimer() {
  stopCarouselTimer()
  if (reduceMotion.value) return
  const interval = cssTimeToMs(
    getComputedStyle(document.documentElement).getPropertyValue('--x-motion-trust-carousel-interval'),
    5000,
  )
  carouselTimer = setInterval(nextCard, interval)
}
function stopCarouselTimer() {
  if (carouselTimer) { clearInterval(carouselTimer); carouselTimer = null }
}

// Drag-to-swipe — only meaningful in the XS/S peek-carousel (at M/L the CSS
// `transform: none` override makes --drag inert). Percentage-based (not the
// px math useDragScroll.js uses for native scrollLeft) since the carousel's
// position is itself expressed as a percentage of the track's own width.
const trackRef = ref(null)
const isDragging = ref(false)
const dragPx = ref(0)
let dragStartX = 0
let dragPointerId = null

function onPointerDown(e) {
  if (e.button != null && e.button !== 0) return
  isDragging.value = true
  dragStartX = e.clientX
  dragPx.value = 0
  dragPointerId = e.pointerId
  trackRef.value?.setPointerCapture?.(dragPointerId)
  stopCarouselTimer()
}
function onPointerMove(e) {
  if (!isDragging.value || e.pointerId !== dragPointerId) return
  dragPx.value = e.clientX - dragStartX
}
function onPointerUp(e) {
  if (!isDragging.value || e.pointerId !== dragPointerId) return
  isDragging.value = false
  const width = trackRef.value?.clientWidth || 1
  const threshold = width * 0.15 // 15% of the card's own width
  if (dragPx.value < -threshold) goToCard(activeCard.value + 1)
  else if (dragPx.value > threshold) goToCard(activeCard.value - 1)
  else resetCarouselTimer()
  dragPx.value = 0
  dragPointerId = null
}

onMounted(() => {
  if (typeof matchMedia !== 'undefined') {
    mq = matchMedia('(prefers-reduced-motion: reduce)')
    reduceMotion.value = mq.matches
    mq.addEventListener?.('change', onMq)
  }
  startPubRotator()
  resetCarouselTimer()
})
onBeforeUnmount(() => {
  mq?.removeEventListener?.('change', onMq)
  stopPubRotator()
  stopCarouselTimer()
})

// XS/S peek-carousel: crossfade in addition to the slide — the outgoing
// card's opacity animates to 0 as the incoming one animates to 1, both over
// --x-motion-trust-slide. Inert at M/L (all cards forced back to opacity: 1
// there — see the container query override).
function cardOpacity(i) {
  return activeCard.value === i ? 1 : 0
}

const paymentIcons = computed(() => [
  { logo: assets.value.pc.googleApple, label: 'Google Pay / Apple Pay' },
  { logo: assets.value.pc.creditCard,  label: 'Credit Card' },
  { logo: assets.value.pc.paypalVenmo, label: 'PayPal' },
  { logo: assets.value.pc.cashApp,     label: 'Cash App' },
])
</script>

<template>
  <div class="trust-bar" data-component="trust-bar">
    <div
      ref="trackRef"
      class="trust-bar__track"
      :class="{ 'trust-bar__track--dragging': isDragging }"
      :data-state="isDragging ? 'dragging' : 'idle'"
      :style="{ '--active': activeCard, '--drag': `${dragPx}px` }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <!-- 1 · Officially partnered -->
      <div class="trust-bar__card" :style="{ opacity: cardOpacity(0) }">
        <div class="trust-bar__icon"><MaterialIcon name="verified_user" variant="round" :size="22" /></div>
        <div class="trust-bar__body">
          <p class="trust-bar__title text-style-utility-action-bold">{{ t.partnerTitle }}</p>
          <p class="trust-bar__sub text-style-paragraph-small">{{ t.partnerSub }}</p>
          <Transition name="trust-chip-fade" mode="out-in">
            <div
              v-if="publisherLogoGroups.length"
              :key="pubIndex"
              class="trust-bar__logos"
              :data-state="publisherLogoGroups.length < 2 ? 'static' : (reduceMotion ? 'static' : 'rotating')"
            >
              <span v-for="logo in publisherLogoGroups[pubIndex]" :key="logo.alt" class="trust-bar__logo-tile">
                <img :src="logo.src" :alt="logo.alt" class="trust-bar__logo-img" />
              </span>
            </div>
          </Transition>
        </div>
      </div>

      <!-- 2 · Trusted by millions -->
      <div class="trust-bar__card" :style="{ opacity: cardOpacity(1) }">
        <div class="trust-bar__icon"><MaterialIcon name="groups" variant="round" :size="22" /></div>
        <div class="trust-bar__body">
          <p class="trust-bar__stat text-style-heading-page-title">{{ gamersValue }}{{ t.gamersUnit }}</p>
          <p class="trust-bar__title text-style-utility-action-bold">{{ t.gamersLabel }}</p>
          <p class="trust-bar__sub text-style-paragraph-small">{{ t.gamersSub }}</p>
        </div>
      </div>

      <!-- 3 · Fast delivery -->
      <div class="trust-bar__card" :style="{ opacity: cardOpacity(2) }">
        <div class="trust-bar__icon"><MaterialIcon name="bolt" variant="round" :size="22" /></div>
        <div class="trust-bar__body">
          <p class="trust-bar__stat text-style-heading-page-title">{{ deliveryValue }}%</p>
          <p class="trust-bar__title text-style-utility-action-bold">{{ t.deliveryLabel }}</p>
          <InfoTag icon="verified_user" variant="success" :label="t.deliveryBadge" />
        </div>
      </div>

      <!-- 4 · Pay your way -->
      <div class="trust-bar__card" :style="{ opacity: cardOpacity(3) }">
        <div class="trust-bar__icon"><MaterialIcon name="credit_card" variant="round" :size="22" /></div>
        <div class="trust-bar__body">
          <p class="trust-bar__title text-style-utility-action-bold">{{ t.paymentTitle }}</p>
          <p class="trust-bar__sub text-style-paragraph-small">{{ t.paymentSub }}</p>
          <div class="trust-bar__payments">
            <img v-for="pm in paymentIcons" :key="pm.label" :src="pm.logo" :alt="pm.label" class="trust-bar__payment-icon" />
          </div>
        </div>
      </div>
    </div>

    <!-- Dot nav — XS/S only (peek-carousel) -->
    <div class="trust-bar__dots" role="tablist" aria-label="Trust highlights">
      <button
        v-for="i in cardCount"
        :key="i"
        type="button"
        class="trust-bar__dot"
        :class="{ 'trust-bar__dot--active': activeCard === i - 1 }"
        role="tab"
        :aria-selected="activeCard === i - 1"
        :aria-label="`Show highlight ${i}`"
        @click="goToCard(i - 1)"
      />
    </div>
  </div>
</template>

<style scoped>
.trust-bar {
  /* A neutral panel sitting directly on the dark page — not a light "card"
     (this isn't a floating white surface like SkuCard) and not tinted
     primary either. --x-bg-navbar already resolves to the same dark neutral
     (surface-inverse) this repo uses for the page's other dark chrome, so
     it's reused here rather than introducing a new override; --x-border-navbar
     pairs with it the same way. */
  background: var(--x-bg-navbar);
  border: var(--border-weight-default) solid var(--x-border-navbar);
  border-radius: var(--x-radius-container-m);
  /* The single clip boundary for the mobile peek-carousel. */
  overflow: hidden;
  /* Self-scoped container: TrustBar now sits in App.vue's sticky lead rail
     (~4/12 columns, always narrower than the M/L breakpoints below), not the
     full-width main column. The app's other @container rules are anonymous
     and bind to .device__screen (screen width) — that would still force the
     2x2/4-up grid states here even though this component's own box never
     reaches 801px in the rail. Naming this container makes the breakpoints
     below measure .trust-bar's own rendered width instead, so it correctly
     stays in carousel mode inside the rail while remaining unchanged in the
     single-column layout (where its box width already tracked the screen). */
  container-type: inline-size;
  container-name: trust-bar;
}

.trust-bar__track {
  /* display:flex (not grid) is what actually lets each card wrap its text
     properly here. A grid container's own box stays block-width (100% of
     .trust-bar) regardless of its (percentage) track sizes, so a `grid-auto-
     columns` track needed a manual `width: max-content` to avoid clipping
     cards 2-4 — but that intrinsic width also makes percentage column
     tracks resolve against themselves (circular), so they fall back to
     sizing off their own content instead of 100% of the visible area,
     letting long titles/descriptions run out to their full single-line
     width instead of wrapping. A flex container's box stays a normal,
     definite 100% of .trust-bar regardless of children, and flex-basis
     percentages resolve against that fixed, already-known width — so cards
     overflow it (correctly clipped by .trust-bar) *and* wrap text at a real
     100%-of-viewport size, with no circularity. No gap between cards — each
     one fills the full width, so there's no adjacent-slide sliver to peek. */
  display: flex;
  transition: transform var(--x-motion-trust-slide);
  transform: translateX(calc(-1 * var(--active, 0) * 100% + var(--drag, 0px)));
}
.trust-bar__track--dragging {
  transition: none;
}

.trust-bar__card {
  /* Full width — no peek of the next/previous slide. */
  flex: 0 0 100%;
  display: flex;
  align-items: flex-start;
  /* Icon-to-content gap. */
  gap: var(--x-gap-content-default);
  /* top / sides / bottom — 12 / 12 / 16px via the space-scale tokens
     (pad-surface-m / -m / -l), not the previous flat pad-surface-xl. */
  padding: var(--x-pad-surface-m) var(--x-pad-surface-m) var(--x-pad-surface-l);
  position: relative;
  min-width: 0;
  /* Fixed floor so the container doesn't reflow — between cards of differing
     content length (the publisher-logo row, the payment-icon row) and across
     the logo rotator's out-in transition, which briefly unmounts its content.
     No dedicated semantic "card min-height" token exists yet; --x-sys-size-xxxl
     is the primitive scale's nearest fit. */
  min-height: var(--x-sys-size-xxxl);
  /* Crossfade companion to the track's slide — the outgoing card's inline
     opacity (bound in the template, see cardOpacity()) animates to 0 as the
     incoming one animates to 1, over the same duration/easing as the slide. */
  transition: opacity var(--x-motion-trust-slide);
}

/* Column dividers — a new pattern for this repo (no other Grid/Span consumer
   needs them); inset top/bottom like the reference's own divider treatment.
   Off by default (the XS/S peek-carousel shows one card at a time, so a
   divider would just be a stray line poking off-screen); each container
   query below turns dividers on for its own layout only. */
.trust-bar__card::before {
  content: none;
  position: absolute;
  top: var(--x-pad-surface-l);
  bottom: var(--x-pad-surface-l);
  width: var(--border-weight-default);
  background: var(--x-border-navbar);
}

.trust-bar__icon {
  flex: 0 0 auto;
  width: var(--x-size-control-m);
  height: var(--x-size-control-m);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--x-radius-control-full);
  background: var(--x-bg-indicator-brand-subtle);
  /* Reuses the brand-indicator bg token for the icon fill colour too — no
     dedicated --text/--icon-indicator-brand token exists in this repo yet. */
  color: var(--x-bg-indicator-brand-default);
}

.trust-bar__body {
  display: flex;
  flex-direction: column;
  /* Was --x-gap-content-tight (2px) — far too tight between the description
     and whatever follows it (the delivery badge, the payment-icon row, the
     publisher-logo row). 8px minimum. */
  gap: var(--x-gap-content-default);
  min-width: 0;
}

.trust-bar__title {
  margin: 0;
  color: var(--x-text-header-inverse);
}

.trust-bar__sub {
  margin: 0;
  color: var(--x-text-body-inverse);
}

.trust-bar__stat {
  /* Whole "80M+" figure in one colour — no separate accent on the unit. */
  margin: 0;
  color: var(--x-text-header-inverse);
}
/* The stat reads as a compound heading with the title right after it (e.g.
   "99%" / "of orders fulfilled…") — tighter than .trust-bar__body's general
   8px gap. Negative margin trims it to 4px without touching the gap used
   between every other pair in the body (title→sub, sub→badge/logos/payments). */
.trust-bar__stat + .trust-bar__title {
  margin-top: calc(var(--x-gap-content-narrow) - var(--x-gap-content-default));
}

.trust-bar__logos {
  /* No margin-top of its own — .trust-bar__body's gap (8px) already
     separates this row from the description above it. */
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  flex-wrap: wrap;
}
.trust-bar__logo-tile {
  /* A solid light tile behind every logo, regardless of the source mark's
     own colour (one of the real logos here is a near-black wordmark that
     would be invisible directly on this dark panel) — same idea as the
     payment icons row, just with an explicit backing since publisher
     logos aren't guaranteed to already be light-on-dark polarity. */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--x-pad-surface-xxs) var(--x-pad-surface-s);
  border-radius: var(--x-radius-container-xs);
  background: var(--x-bg-card-default);
}
.trust-bar__logo-img {
  /* Matches the payment-icons row's size. */
  height: var(--x-size-icon-m);
  width: auto;
  object-fit: contain;
}
.trust-chip-fade-enter-active,
.trust-chip-fade-leave-active {
  transition: opacity var(--x-motion-trust-rotate-fade);
}
.trust-chip-fade-enter-from,
.trust-chip-fade-leave-to {
  opacity: 0;
}

.trust-bar__payments {
  /* No margin-top of its own — .trust-bar__body's gap (8px) already
     separates this row from the description above it. */
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--x-gap-content-default);
}
.trust-bar__payment-icon {
  /* --x-size-icon-l (48px) was too tall for all 4 marks to fit one row inside
     an 84%-wide mobile card — they'd overflow past the card's own edge and
     get clipped by .trust-bar's overflow:hidden. -m (20px) plus flex-wrap
     above as a safety net keeps every icon visible at any card width. */
  height: var(--x-size-icon-m);
  width: auto;
  object-fit: contain;
}

/* Dots — XS/S only (peek-carousel); hidden at M/L in the container queries below. */
.trust-bar__dots {
  display: flex;
  justify-content: center;
  gap: var(--x-gap-content-narrow);
  padding-bottom: var(--x-pad-surface-l);
}
.trust-bar__dot {
  /* Pagination = the indicator token family, not a border/brand token —
     neutral for the resting state, selected for the active one. */
  width: 6px;
  height: 6px;
  padding: 0;
  border: 0;
  border-radius: var(--x-radius-badge-full);
  background: var(--x-bg-indicator-neutral-default);
  cursor: pointer;
  transition: width var(--x-motion-sys-duration-fast), background-color var(--x-motion-sys-duration-fast);
}
.trust-bar__dot--active {
  width: 18px;
  border-radius: var(--x-radius-container-xs);
  background: var(--x-bg-indicator-selected-default);
}

/* M — 2×2 grid, dividers right (odd columns) + bottom (top row) */
@container trust-bar (min-width: 801px) {
  .trust-bar__track {
    display: grid;
    grid-auto-flow: row;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--x-gap-content-loose);
    transform: none;
  }
  .trust-bar__dots { display: none; }
  /* The XS/S carousel's inline per-card opacity is meant only for that
     breakpoint's crossfade — every card must show at M/L regardless of
     `activeCard`. A stylesheet !important is the one thing that can still
     beat that inline style (both target the same element/property). */
  .trust-bar__card {
    opacity: 1 !important;
  }
  .trust-bar__card:nth-child(odd)::before {
    content: '';
    left: auto;
    right: 0;
  }
  .trust-bar__card:nth-child(-n+2) {
    border-bottom: var(--border-weight-default) solid var(--x-border-navbar);
  }
}

/* L — full 4-up row, vertical dividers between every card */
@container trust-bar (min-width: 1280px) {
  .trust-bar__track {
    grid-template-columns: repeat(4, 1fr);
  }
  .trust-bar__card:nth-child(-n+2) {
    border-bottom: none;
  }
  .trust-bar__card:nth-child(odd)::before {
    content: none;
  }
  .trust-bar__card:not(:first-child)::before {
    content: '';
    left: 0;
    right: auto;
  }
}
</style>
