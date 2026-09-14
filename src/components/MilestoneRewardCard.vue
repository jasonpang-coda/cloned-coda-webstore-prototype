<script setup>
import { computed, ref } from 'vue'
import { useStoreAssets } from '../composables/useStoreAssets.js'
import { useStoreConfig } from '../composables/useStoreConfig.js'
import { useGiftClaim } from '../composables/useGiftClaim.js'
import { useHaptics } from '../composables/useHaptics.js'
import { formatNumber } from '../utils/formatNumber.js'
import genericLoyaltyIcon from '@material-symbols/svg-400/rounded/stars.svg?url'

/**
 * MilestoneRewardCard — one reward tile in the Milestone Rewards rail.
 * Layout adapted from the PvZ3 "SKU Box" reward card reference (Figma
 * woddrskgFphghfZ87d3H9S, node 5131:261345): title → divider → subtitle →
 * reward art, all centred, then the CTA pinned to the bottom. Three states:
 *
 *  'claimable' — reward is unlocked; shows a bright CLAIM button. Tapping
 *                the card opens the shared gift-claim sheet (useGiftClaim —
 *                the same one FCM's Gifts tab uses), CLAIM label.
 *  'locked'    — reward is still being earned; shows a dim button with
 *                `progress`/`threshold` MP (Loyalty Points) and the MP icon.
 *                Not tappable.
 *  'claimed'   — reward has already been collected; dims the art (mirrors
 *                GiftSkuCard's static claimed treatment) and shows a dim
 *                CLAIMED label with no fraction/icon. Not tappable.
 *
 * `isFinalTier` (the Champion/10th reward) swaps the card's flat
 * `--bg-sku-card-default` fill for a muted blue gradient while
 * locked/claimable — the campaign's headline prize reads as special even
 * before it's earned. Once claimed it drops back to the standard fill,
 * same as every other reward — the special treatment marks "not yet
 * collected", not "this is tier 10" forever.
 *
 * Once the claim is confirmed in the sheet, `useGiftClaim().isClaimed(id)`
 * flips true — `displayState` below overrides the derived `'claimable'`
 * prop to `'claimed'` immediately, without waiting for the parent's
 * currentMp-driven state to change (it never will; claiming doesn't earn
 * more MP, it just collects what's already been reached).
 *
 * Interaction states (hover lift, press scale, selected ring) mirror
 * SkuCard.vue's exact recipe/tokens so this card feels like the rest of the
 * storefront rather than a bespoke one-off.
 */
const props = defineProps({
  /** Stable claim identity (keys the confirmed-claim state) */
  id:        { type: String, required: true },
  image:     { type: String, required: true },
  title:     { type: String, required: true },
  subtitle:  { type: String, default: null },
  /** 'claimable' | 'locked' | 'claimed' */
  state:     { type: String, default: 'locked' },
  /** MP earned so far toward `threshold` — only shown when state === 'locked' */
  progress:  { type: Number, default: null },
  /** MP required to unlock — only shown when state === 'locked' */
  threshold: { type: Number, default: null },
  ctaLabel:     { type: String, default: 'CLAIM' },
  claimedLabel: { type: String, default: 'CLAIMED' },
  /** The last/headline tier (Champion) — special background while not yet claimed. */
  isFinalTier: { type: Boolean, default: false },
  /** Per-card stagger delay in ms */
  baseDelay: { type: Number, default: 0 },
})

const cardStyle = computed(() => ({ animationDelay: props.baseDelay + 'ms' }))

// MP (Match Points) is FCM's existing loyalty programme — Loyalty Points in
// this campaign IS MP, so the icon/gate reuse the shared loyalty assets.
// Guard on config.checkout.loyalty (not the asset) per the loyalty-icon rule.
const config = useStoreConfig()
const assets = useStoreAssets()
const loyaltyIconUrl = computed(() => assets.value.brand.loyaltyIcon || genericLoyaltyIcon)

// ── Claim wiring — same shared sheet/composable as FCM's Gifts tab ──────────
const { openGiftClaim, isClaimed, claimSheetOpen, selectedGift } = useGiftClaim()
const { haptic } = useHaptics()

// Real claim overrides the derived 'claimable' state; a 'locked' tier can
// never be claimed (openGiftClaim is gated below), so this only ever flips
// 'claimable' → 'claimed'.
const displayState = computed(() => isClaimed(props.id) ? 'claimed' : props.state)
const showLoyalty = computed(() => config.value.checkout?.loyalty != null && displayState.value === 'locked')
const isSelected = computed(() => claimSheetOpen.value && selectedGift.value?.id === props.id)

const isPressed = ref(false)

function onTap() {
  if (displayState.value !== 'claimable') return
  const opened = openGiftClaim({
    id: props.id,
    title: props.title,
    subtitle: props.subtitle,
    image: props.image,
  })
  if (opened) haptic('select')
}
</script>

<template>
  <!-- Bloom shell — a plain sizing wrapper for every card, only bloom-active
       for the headline tier (mirrors HeroSkuCard/BestSellerCard's fx-bloom
       usage). It has to sit OUTSIDE .milestone-reward rather than on that
       element directly: .milestone-reward carries v-ripple, and .fx-ripple
       sets its own overflow:hidden on the same node, which would clip the
       bloom's ::after halo before it ever bled past the card's edge. -->
  <div
    class="milestone-reward-shell"
    :class="{ 'milestone-reward-shell--bloom fx-bloom': isFinalTier && displayState !== 'claimed' }"
  >
  <div
    v-ripple
    class="milestone-reward"
    :style="cardStyle"
    :class="{
      'milestone-reward--interactive': displayState === 'claimable',
      'milestone-reward--pressed': isPressed,
      'milestone-reward--selected': isSelected,
    }"
    :data-poi="displayState === 'claimable' ? 'milestone-claim' : null"
    @click="onTap"
    @mousedown="isPressed = true"
    @mouseup="isPressed = false"
    @mouseleave="isPressed = false"
    @touchstart.passive="isPressed = true"
    @touchend.passive="isPressed = false"
  >
    <div
      class="milestone-reward__bg"
      :class="{ 'milestone-reward__bg--special': isFinalTier && displayState !== 'claimed' }"
      aria-hidden="true"
    />

    <div class="milestone-reward__body">
      <div class="milestone-reward__text">
        <p class="milestone-reward__title text-style-heading-banner">{{ title }}</p>
        <div class="milestone-reward__divider" aria-hidden="true" />
        <p v-if="subtitle" class="milestone-reward__subtitle text-style-utility-label-regular">{{ subtitle }}</p>
      </div>

      <!-- Claimed — dim the art (mirrors GiftSkuCard's :style="{ opacity: claimed ? 0.3 : 1 }"). -->
      <div class="milestone-reward__art" :style="{ opacity: displayState === 'claimed' ? 0.3 : 1 }">
        <img :src="image" alt="" class="milestone-reward__img" />
      </div>
    </div>

    <button
      type="button"
      class="milestone-reward__cta"
      :class="`milestone-reward__cta--${displayState}`"
      :disabled="displayState !== 'claimable'"
      tabindex="-1"
    >
      <template v-if="displayState === 'claimable'">
        <span class="milestone-reward__cta-label text-style-utility-action-uppercase">{{ ctaLabel }}</span>
      </template>
      <template v-else-if="displayState === 'claimed'">
        <span class="milestone-reward__cta-label text-style-utility-action-uppercase">{{ claimedLabel }}</span>
      </template>
      <template v-else>
        <span class="milestone-reward__cta-label text-style-utility-action-uppercase">{{ formatNumber(progress) }}/{{ formatNumber(threshold) }}</span>
        <span
          v-if="showLoyalty"
          class="milestone-reward__loyalty-icon"
          aria-hidden="true"
          :style="{ '--loyalty-icon-url': `url(${loyaltyIconUrl})` }"
        />
      </template>
    </button>
  </div>
  </div>
</template>

<style scoped>
/* Sizing pass-through — see the template comment above for why the bloom
   lives on this outer shell instead of .milestone-reward itself. Takes over
   the "fill remaining height of .milestone-rail__item" job .milestone-reward
   used to do alone; .milestone-reward now just fills ITS parent instead. */
.milestone-reward-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
}
/* Headline (Champion) reward's ambient glow — bleeds outside the card, same
   fx-bloom recipe (effects.css) as HeroSkuCard/BestSellerCard. Uses a full-
   strength (non-alpha) version of the muted-blue hue, NOT the card's own
   --x-fx-gradient-muted-blue token directly — that token is already
   translucent (0.36 alpha, tuned for the card's own glass fill), and the
   shared .fx-bloom keyframe (bloom-pulse) already dims the whole halo to
   0.12–0.22 opacity on its own; stacking both made the glow all but
   invisible. HeroSkuCard/BestSellerCard's own bloom colours are opaque for
   the same reason — the keyframe is the only dimming factor by design. */
.milestone-reward-shell--bloom {
  --x-fx-bloom-image: linear-gradient(180deg, oklch(0.55 0.08 250) 0%, oklch(0.30 0.03 255) 100%);
}
.milestone-reward-shell--bloom::after {
  inset: -16%;
  filter: blur(32px) brightness(1.15) saturate(1.3);
}

.milestone-reward {
  position: relative;
  display: flex;
  flex-direction: column;
  /* Fills the shell above, which fills the remaining height of
     `.milestone-rail__item` (a flex column whose row parent stretches every
     item to the tallest one) — this is what keeps every card the same
     height regardless of content length. */
  flex: 1;
  padding: var(--x-pad-surface-m) var(--x-pad-surface-s) var(--x-pad-surface-l);
  gap: var(--x-gap-content-default);
  border: 0;
  border-radius: var(--x-radius-container-s);
  backdrop-filter: blur(var(--x-blur-container, 32px));
  -webkit-backdrop-filter: blur(var(--x-blur-container, 32px));
  box-shadow: var(--x-shadow-card);
  overflow: hidden;
  cursor: default;

  /* Entrance — animation LONGHANDS (shorthand + comma-easing var is invalid). */
  animation-name: sku-enter;
  animation-duration: var(--x-motion-sys-duration-slow);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: both;

  /* Hover-out / resting transition — controls return from hover, same
     recipe as SkuCard.vue. */
  transition:
    transform var(--x-motion-sku-hover),
    border-color var(--x-motion-sku-hover),
    box-shadow var(--x-motion-sku-hover);
}

/* Only the claimable (tappable) state gets the pointer + hover/press
   affordances — locked/claimed cards aren't interactive. */
.milestone-reward--interactive {
  cursor: pointer;
}
.milestone-reward--interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--x-shadow-card-hover);
  transition:
    transform var(--x-motion-sku-hover-in),
    border-color var(--x-motion-sku-hover-in),
    box-shadow var(--x-motion-sku-hover-in);
}
.milestone-reward--interactive:hover::before {
  background: var(--x-border-sku-card-hover);
}
.milestone-reward--pressed {
  transform: scale(var(--x-motion-sku-press-scale)) !important;
  transition:
    transform var(--x-motion-sku-press),
    border-color var(--x-motion-sku-press);
}
.milestone-reward--selected {
  box-shadow: var(--x-shadow-card-selected);
  transition:
    border-color var(--x-motion-sku-select),
    box-shadow var(--x-motion-sku-select);
}
.milestone-reward--selected::before {
  background: var(--x-border-sku-card-selected);
  padding: var(--border-weight-selected);
}

/* Ripple wave sits above the background but below the content/ring, same
   layering as SkuCard.vue. */
.milestone-reward :deep(.fx-ripple__wave) {
  z-index: 1;
}

/* Tokenised gradient border ring — same mask-composite idiom as SkuCard. */
.milestone-reward::before {
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
  z-index: 2;
  transition: background var(--x-motion-sku-hover);
}

.milestone-reward__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  background: var(--x-bg-sku-card-default);
  transition: background var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate);
}
.milestone-reward--selected .milestone-reward__bg {
  background: var(--x-bg-card-selected);
}
/* Headline (Champion) reward — flagged special while not yet claimed. Uses
   a dedicated muted-blue extension token (--x-fx-gradient-muted-blue), not
   the shared --x-rarity-gradient-rare — that token is reused by every
   rarity-tagged item across the app, and its full saturation clashed with
   the bright CTA sitting on top of this card. Same frosted-glass blur
   recipe (--x-blur-container) the card root itself already uses elsewhere
   in this file — applied here too so the special background reads as a
   glass pane, not a flat matte gradient like the other 9 cards. */
.milestone-reward__bg--special {
  background: var(--x-fx-gradient-muted-blue);
  backdrop-filter: blur(var(--x-blur-container, 32px));
  -webkit-backdrop-filter: blur(var(--x-blur-container, 32px));
}

/* Body fills the space above the CTA and centres its content vertically —
   this, plus the title's reserved 2-line height below, is what keeps every
   card the same height regardless of how long a tier's name or subtitle is. */
.milestone-reward__body {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--x-gap-content-default);
  min-height: 0;
}

.milestone-reward__text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-tight);
  width: 100%;
}
.milestone-reward__title {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Reserves 2 lines regardless of the actual tier-name length, so a
     one-line title ("Champion") and a two-line one ("Qualifier Round 1")
     both leave the same amount of room above the divider. */
  min-height: 2.4em;
  width: 100%;
  text-align: center;
  color: var(--x-text-header-default);
  transform-origin: center center;
}
.milestone-reward__divider {
  width: 100%;
  height: var(--border-weight-default);
  background: var(--x-border-divider);
}
.milestone-reward__subtitle {
  margin: 0;
  /* .milestone-reward__text's flex `gap` (--x-gap-content-tight) already
     spaces every child, including divider→subtitle — this top-ups JUST
     that one edge to --x-gap-content-default (8px) without touching the
     title→divider spacing above it. */
  margin-top: calc(var(--x-gap-content-default) - var(--x-gap-content-tight));
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  color: var(--x-text-body-default);
  transform-origin: center center;
}

.milestone-reward__art {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-standard);
}
.milestone-reward__img {
  width: var(--x-size-img-xxl);
  height: var(--x-size-img-xxl);
  object-fit: contain;
  pointer-events: none;
}

.milestone-reward__cta {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--x-gap-content-tight);
  flex-shrink: 0;
  height: var(--x-size-control-m, 35px);
  padding: 0 var(--x-pad-surface-s);
  border: 0;
  border-radius: var(--x-radius-control-full);
  cursor: inherit;
  pointer-events: none;
}
.milestone-reward__cta-label {
  color: inherit;
  white-space: nowrap;
  transform-origin: center center;
}

/* Claimable — bright brand fill, matches the storefront's primary CTA. */
.milestone-reward__cta--claimable {
  background: var(--x-bg-action-primary);
  color: var(--x-text-on-primary);
}

/* Locked — dim secondary fill; shows progress instead of a CTA. */
.milestone-reward__cta--locked {
  background: var(--x-bg-action-secondary);
  color: var(--x-text-body-soft);
}

/* Claimed — same dim fill as locked; no fraction/icon, just the label. */
.milestone-reward__cta--claimed {
  background: var(--x-bg-action-secondary);
  color: var(--x-text-body-soft);
}

.milestone-reward__loyalty-icon {
  display: inline-block;
  width: var(--x-size-icon-xs);
  height: var(--x-size-icon-xs);
  flex-shrink: 0;
  background-color: currentColor;
  -webkit-mask: var(--loyalty-icon-url) center / contain no-repeat;
  mask: var(--loyalty-icon-url) center / contain no-repeat;
}
</style>
