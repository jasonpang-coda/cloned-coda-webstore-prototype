<script setup>
import { computed, watch } from 'vue'
import Grid from './Grid.vue'
import Span from './Span.vue'
import MilestoneRewardsRail from './MilestoneRewardsRail.vue'
import { useFeatureFlags } from '../composables/useFeatureFlags.js'
import { useStoreAssets } from '../composables/useStoreAssets.js'
import { useStoreConfig } from '../composables/useStoreConfig.js'
import { useAuth } from '../composables/useAuth.js'
import { formatNumber } from '../utils/formatNumber.js'
import { deriveRewardsState, deriveProgressionSummary } from '../utils/milestoneRewards.js'
import genericLoyaltyIcon from '@material-symbols/svg-400/rounded/stars.svg?url'

/**
 * MilestoneRewards — the "Milestone Rewards" tab content, shared by every
 * store with a milestone/loyalty campaign (FCM's MP-based ladder; COD:M's
 * Armory-Point ladder). Figma reference: FCM node 2094:251 overall /
 * 2094:260 progression / 2094:267 rewards; the rail's connected step track
 * is adapted from the PvZ3 reference — see MilestoneRewardsRail.vue.
 * Store-agnostic: campaign copy + `tiers` come from useStoreMilestone()
 * (src/stores/<store>/milestone.js); the derivation logic itself lives in
 * ../utils/milestoneRewards.js so this component never imports one store's
 * module directly.
 *
 * The player's current point total is either a dev-toolbar enum flag
 * (`data.scenarioFlag`, FCM's fcmMilestoneScenario — a stand-in for the real
 * signed-in balance) or, for a store with no scenario flag, a fixed
 * `data.demoPoints` value. Combined with the static tier data HERE, the same
 * two-gate-style split App.vue uses for its own capability+flag computeds —
 * milestone.js itself stays a plain, non-reactive data module.
 *
 * Six parts, top to bottom: header, hero banner, campaign description, the
 * progression summary (level label + "Next Level: X/Y" — text only, no bar;
 * see Figma 2094:260), the rewards rail (which owns the connected progress
 * track above the cards), then a full-width secondary "Earn Milestone
 * Points" CTA back to the Store tab (emits 'go-to-store' — App.vue owns the
 * active-section state this needs).
 */
const props = defineProps({
  data: { type: Object, required: true },
})

/** Emitted when the "Earn Points" CTA is tapped — App.vue switches the
    active L1 tab back to the Store section (this component has no access
    to that state). */
const emit = defineEmits(['go-to-store'])

const { flagValue } = useFeatureFlags()
const currentPoints = computed(() =>
  props.data.scenarioFlag ? Number(flagValue(props.data.scenarioFlag)) : (props.data.demoPoints ?? 0),
)
const rewards = computed(() => deriveRewardsState(props.data.tiers, currentPoints.value))
const summary = computed(() => deriveProgressionSummary(props.data.tiers, currentPoints.value))

// Preview convenience (scenario-flag stores only): the 750/5,000 MP
// scenarios represent a returning player who has already earned rewards, so
// switching to either signs the demo account in (matching the
// claimed/claimable states those scenarios show); 0 MP represents a fresh,
// unearned player, so it signs back out (which also clears useGiftClaim's
// claimedIds — see its own signedIn watcher — so a prior demo claim doesn't
// linger into the reset state). Only fires on a scenario CHANGE, not
// continuously, so it doesn't fight a manual sign-in/out done afterward.
const { signedIn } = useAuth()
watch(currentPoints, (points) => {
  if (!props.data.scenarioFlag) return
  signedIn.value = points === 750 || points === 5000
}, { immediate: true })

// Loyalty icon for the progression summary's "Next Level: X/Y" line — same
// asset/gate as MilestoneRewardCard's locked-state icon (MP IS this
// campaign's Loyalty Points; never duplicate the gating logic differently).
const config = useStoreConfig()
const assets = useStoreAssets()
const showLoyalty = computed(() => config.value.checkout?.loyalty != null)
const loyaltyIconUrl = computed(() => assets.value.brand.loyaltyIcon || genericLoyaltyIcon)
</script>

<template>
  <div class="milestone">
    <Grid>
      <Span size="content">
        <div class="milestone__content">
          <h2 class="milestone__heading text-style-heading-section">{{ data.header }}</h2>

          <!-- Hero banner: background photo, the Champion reward's real SKU
               art on the left, tag/title text on the right. -->
          <!-- Bloom shell — sits OUTSIDE .milestone__hero (which needs its own
               overflow:hidden to clip the art) so the halo can bleed past the
               banner's edges. Coloured by the hero art itself (not a fixed
               token) via a blurred cover-fit copy of the same image, so the
               glow always follows whatever art data.hero.image points to. -->
          <div
            class="milestone__hero-bloom fx-bloom"
            :style="{ '--x-fx-bloom-image': `url(${data.hero.image}) center / cover no-repeat` }"
          >
          <div class="milestone__hero">
            <img :src="data.hero.image" alt="" class="milestone__hero-img" />
            <div class="milestone__hero-overlay" aria-hidden="true" />
            <div class="milestone__hero-content">
              <img v-if="data.hero.badgeImage" :src="data.hero.badgeImage" alt="" class="milestone__hero-badge" />
              <div class="milestone__hero-text">
                <span class="milestone__hero-tag text-style-utility-micro-uppercase">{{ data.hero.tagLabel }}</span>
                <p class="milestone__hero-title text-style-heading-banner">{{ data.hero.title }}</p>
              </div>
            </div>
          </div>
          </div>

          <p class="milestone__description text-style-paragraph-regular">
            {{ data.description }}
            <a v-if="data.learnMoreUrl" :href="data.learnMoreUrl" class="milestone__learn-more">{{ data.learnMoreLabel }}</a>
          </p>

          <!-- Progression summary (Figma 2094:260, text only — the rail's
               step track is the progress bar now). -->
          <div class="milestone__progression">
            <p class="milestone__level text-style-heading-sku-title">{{ summary.levelLabel }}</p>
            <p v-if="summary.nextThreshold != null" class="milestone__status text-style-utility-default-regular">
              Next Level: <strong>{{ formatNumber(currentPoints) }}</strong>/{{ formatNumber(summary.nextThreshold) }}
              <span
                v-if="showLoyalty"
                class="milestone__status-icon"
                aria-hidden="true"
                :style="{ '--loyalty-icon-url': `url(${loyaltyIconUrl})` }"
              />
            </p>
          </div>
        </div>
      </Span>
    </Grid>

    <Grid>
      <Span size="carousel" class="milestone__rail-span">
        <MilestoneRewardsRail :rewards="rewards" :current-mp="currentPoints" :points-unit="data.pointsUnit ?? 'MP'" />
      </Span>
    </Grid>

    <Grid>
      <Span size="content">
        <!-- Secondary CTA back to the Store — same outlined/frosted pill
             StoryCarousel's own slide CTAs use (.story__cta), not a
             bespoke button style. Sits after the rail/track, full width. -->
        <button
          v-ripple
          v-haptic
          type="button"
          class="milestone__earn-cta"
          @click="emit('go-to-store')"
        >
          <span class="milestone__earn-cta-label text-style-utility-action-uppercase">Earn Milestone Points</span>
        </button>
      </Span>
    </Grid>
  </div>
</template>

<style scoped>
.milestone {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
  width: 100%;
}

.milestone__content {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
  width: 100%;
}

.milestone__heading {
  margin: 0;
  display: block;
  text-transform: uppercase;
  color: var(--x-text-header-default);
}

/* Hero banner */
/* Ambient glow behind the hero banner — .fx-bloom (effects.css) reads
   --x-fx-bloom-image from the inline style above; overridden here (default
   inset is only -2%) for a more visible bleed past the banner's own edges,
   matching HeroSkuCard's own inset/filter override for the same reason. */
.milestone__hero-bloom {
  position: relative;
  isolation: isolate;
}
.milestone__hero-bloom::after {
  inset: -18%;
  border-radius: var(--x-radius-container-s);
  filter: blur(44px) brightness(1.25) saturate(1.6);
}

.milestone__hero {
  position: relative;
  border-radius: var(--x-radius-container-s);
  overflow: hidden;
}
.milestone__hero-img {
  display: block;
  width: 100%;
  aspect-ratio: 336 / 116;
  object-fit: cover;
}
.milestone__hero-overlay {
  position: absolute;
  inset: 0;
  background: var(--x-gradient-scroll-fade-bottom);
}
.milestone__hero-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  padding: var(--x-pad-surface-m);
}
.milestone__hero-badge {
  flex-shrink: 0;
  width: var(--x-size-img-xxl);
  height: var(--x-size-img-xxl);
  object-fit: contain;
}
.milestone__hero-text {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-tight);
  min-width: 0;
}
.milestone__hero-tag {
  align-self: flex-start;
  color: var(--x-text-header-default);
  transform-origin: left center;
}
.milestone__hero-title {
  margin: 0;
  display: block;
  color: var(--x-text-header-default);
  transform-origin: left center;
}

/* Description */
.milestone__description {
  margin: 0;
  color: var(--x-text-body-default);
}
.milestone__learn-more {
  color: var(--x-text-hyperlink-default);
  text-decoration: underline;
}

/* Progression summary */
.milestone__progression {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-tight);
}
.milestone__level {
  margin: 0;
  display: block;
  color: var(--x-text-header-default);
  transform-origin: left center;
}
.milestone__status {
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-tight);
  color: var(--x-text-body-default);
  transform-origin: left center;
}
.milestone__status-icon {
  display: inline-block;
  width: var(--x-size-icon-xs);
  height: var(--x-size-icon-xs);
  flex-shrink: 0;
  background-color: currentColor;
  -webkit-mask: var(--loyalty-icon-url) center / contain no-repeat;
  mask: var(--loyalty-icon-url) center / contain no-repeat;
}

/* Secondary CTA — same outlined/frosted pill recipe as StoryCarousel's
   .story__cta (border + frosted fill, hyperlink-coloured text), not a
   bespoke button style. Full width on mobile — a closing CTA after the
   track, not an inline aside — but capped at half width and centred on
   M/L, where a full-bleed pill this wide reads oversized. */
.milestone__earn-cta {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--x-pad-surface-m) var(--x-pad-surface-s);
  border: var(--border-weight-action) solid var(--x-text-hyperlink-default);
  border-radius: var(--x-radius-control-full);
  background: var(--x-surface-frost);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--x-text-hyperlink-default);
  cursor: pointer;
  transition: background-color var(--x-motion-sku-hover);
}
.milestone__earn-cta:hover {
  background: var(--x-surface-frost-hover);
}
@container (min-width: 801px) {
  .milestone__earn-cta {
    max-width: 50%;
    margin-inline: auto;
  }
}
.milestone__earn-cta-label {
  transform-origin: center center;
}

/* Rewards rail: full width in responsive — Span's default "carousel" size
   centres + caps at 960px (max-width:content) at ≥801px, same as every other
   carousel section. This rail should instead use the full available grid
   width there, so it overrides just that breakpoint's centring/cap while
   leaving the XS/S full-bleed behaviour (the negative-margin edge-to-edge
   peek scroll) untouched. */
@container (min-width: 801px) {
  :deep(.milestone__rail-span) {
    grid-column: 1 / -1;
    max-width: none;
    justify-self: stretch;
  }
}
</style>
