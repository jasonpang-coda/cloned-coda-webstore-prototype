<script setup>
import { ref } from 'vue'
import Grid from '../Grid.vue'
import Span from '../Span.vue'
import StoryCarousel from '../StoryCarousel.vue'
import FilterTabs from './FilterTabs.vue'
import TitleGrid from './TitleGrid.vue'
import TitleRail from './TitleRail.vue'
import HomeCategoryCards from './HomeCategoryCards.vue'
import HomePublisherSpotlight from './HomePublisherSpotlight.vue'
import HomeStatBand from './HomeStatBand.vue'
import HomeSteps from './HomeSteps.vue'
import HomeReviewStack from './HomeReviewStack.vue'
import HomePayments from './HomePayments.vue'
import HomeFaq from './HomeFaq.vue'
import HomeNewsletter from './HomeNewsletter.vue'
import HomeParticles from './HomeParticles.vue'
import { useReveal } from '../../composables/useReveal.js'

/**
 * HomeVisual — the cinematic / game-art-forward Codashop homepage, behind
 * the `homepageLayout` flag. Same content/props contract as HomeStandard
 * (see HomeView.vue) — this shell differs only in presentation and motion:
 *  - a scroll-reactive particle field behind everything (HomeParticles)
 *  - a scroll-triggered reveal choreography on every section (useReveal)
 *  - a full-bleed hero with a stronger scrim
 *  - editorial sections (reviews/FAQ/newsletter/payments) kept but compact
 *    so the page stays impact-first, per the plan.
 */
defineProps({
  heroSlides: { type: Array, default: () => [] },
  heroAspect: { type: String, default: null },
  promoTiles: { type: Array, default: () => [] },
  trendingHeading: { type: String, default: '' },
  trendingSub: { type: String, default: '' },
  trendingTabs: { type: Array, default: () => [] },
  activeFilter: { type: String, default: 'all' },
  trendingTitles: { type: Array, default: () => [] },
  spotlightHeading: { type: String, default: '' },
  spotlightSub: { type: String, default: '' },
  spotlightLogo: { type: String, default: null },
  spotlightLogoAlt: { type: String, default: '' },
  spotlightTitles: { type: Array, default: () => [] },
  /** Home Blob layout only — declared here just so it doesn't fall through
   * as a stray DOM attribute; unused by this shell. */
  highlightsArt: { type: Object, default: () => ({}) },
  categoriesHeading: { type: String, default: '' },
  categoriesSub: { type: String, default: '' },
  categoryCards: { type: Array, default: () => [] },
  activeCategory: { type: String, default: null },
  categoryTitles: { type: Array, default: () => [] },
  pickedHeading: { type: String, default: '' },
  pickedSub: { type: String, default: '' },
  pickedTitles: { type: Array, default: () => [] },
  trustStats: { type: Array, default: () => [] },
  stepsHeading: { type: String, default: '' },
  stepsSub: { type: String, default: '' },
  steps: { type: Array, default: () => [] },
  reviewsHeading: { type: String, default: '' },
  reviewsSub: { type: String, default: '' },
  reviews: { type: Array, default: () => [] },
  paymentsHeading: { type: String, default: '' },
  paymentsSub: { type: String, default: '' },
  faqHeading: { type: String, default: '' },
  faqSub: { type: String, default: '' },
  faq: { type: Array, default: () => [] },
  newsletterHeading: { type: String, default: '' },
  newsletterBody: { type: String, default: '' },
  newsletterCta: { type: String, default: 'Join' },
  socialIcons: { type: Object, default: () => ({}) },
})
defineEmits(['open-title', 'update:active-filter', 'update:active-category'])

const rootRef = ref(null)
useReveal(rootRef)
</script>

<template>
  <div ref="rootRef" class="home-visual">
    <HomeParticles />

    <div class="home-visual__content">
      <!-- Cinematic hero -->
      <section class="section section--flush-top" data-reveal>
        <Grid>
          <Span size="carousel">
            <div class="home-visual__hero">
              <StoryCarousel
                :slides="heroSlides.map(s => ({ image: s.image, heading: s.heading, ctaLabel: s.ctaLabel }))"
                :aspect-ratio="heroAspect ?? '1.6 / 1'"
              />
            </div>
          </Span>
        </Grid>
      </section>

      <!-- Featured titles — immersive drag rail, glow-ring cards -->
      <section class="section">
        <Grid>
          <Span size="content">
            <div class="home-visual__head" data-reveal>
              <h2 class="text-style-heading-section">{{ trendingHeading }}</h2>
              <p class="text-style-paragraph-regular">{{ trendingSub }}</p>
            </div>
            <FilterTabs
              :tabs="trendingTabs"
              :active="activeFilter"
              class="home-visual__tabs"
              data-reveal
              @update:active="$emit('update:active-filter', $event)"
            />
          </Span>
          <Span size="carousel">
            <div class="home-visual__featured" data-reveal>
              <TitleRail :titles="trendingTitles" variant="visual" @open-title="$emit('open-title')" />
            </div>
          </Span>
        </Grid>
      </section>

      <!-- Publisher spotlight — "sellable slot" merchandising panel -->
      <section class="section">
        <Grid>
          <Span size="content">
            <div data-reveal>
              <HomePublisherSpotlight
                :heading="spotlightHeading"
                :sub="spotlightSub"
                :logo="spotlightLogo"
                :logo-alt="spotlightLogoAlt"
                :titles="spotlightTitles"
                @open-title="$emit('open-title')"
              />
            </div>
          </Span>
        </Grid>
      </section>

      <!-- Category mosaic -->
      <section class="section">
        <Grid>
          <Span size="content">
            <div class="home-visual__head" data-reveal>
              <h2 class="text-style-heading-section">{{ categoriesHeading }}</h2>
              <p class="text-style-paragraph-regular">{{ categoriesSub }}</p>
            </div>
            <div data-reveal>
              <HomeCategoryCards
                :categories="categoryCards"
                :active="activeCategory"
                @select="$emit('update:active-category', $event)"
              />
            </div>
            <!-- No data-reveal — this only enters the DOM after a click (a
                 category card is selected), well after useReveal's mount-time
                 IntersectionObserver pass, so it would never be marked
                 .is-in and stay invisible. -->
            <div v-if="activeCategory" class="home-visual__category-titles">
              <TitleGrid :titles="categoryTitles" variant="visual" @open-title="$emit('open-title')" />
            </div>
          </Span>
        </Grid>
      </section>

      <!-- Picked for you — full title wall, denser than standard -->
      <section class="section">
        <Grid>
          <!-- No data-reveal here (unlike every other section) — this grid
               already has its OWN per-tile entrance via TitleGrid's
               scroll-bloom (useScrollBloom.js). Wrapping it in the section-
               level IntersectionObserver fade-in too meant a tile could
               start blooming while its ancestor was still at opacity:0/
               translateY, or the section's own fade would mask/desync from
               the per-tile motion — two competing entrance animations for
               the one section that has a dedicated one already. -->
          <Span size="content">
            <div class="home-visual__head">
              <h2 class="text-style-heading-section">{{ pickedHeading }}</h2>
              <p class="text-style-paragraph-regular">{{ pickedSub }}</p>
            </div>
            <TitleGrid :titles="pickedTitles" variant="visual" scroll-bloom @open-title="$emit('open-title')" />
          </Span>
        </Grid>
      </section>

      <!-- Animated trust stats -->
      <section class="section">
        <Grid>
          <Span size="content">
            <div data-reveal>
              <HomeStatBand :stats="trustStats" />
            </div>
          </Span>
        </Grid>
      </section>

      <!-- How it works -->
      <section class="section">
        <Grid>
          <Span size="content">
            <div class="home-visual__head" data-reveal>
              <h2 class="text-style-heading-section">{{ stepsHeading }}</h2>
              <p class="text-style-paragraph-regular">{{ stepsSub }}</p>
            </div>
            <div data-reveal>
              <HomeSteps :steps="steps" />
            </div>
          </Span>
        </Grid>
      </section>

      <!-- Compact editorial tail: reviews, payments, app promo, FAQ, newsletter -->
      <section class="section">
        <Grid>
          <Span size="content">
            <div class="home-visual__head" data-reveal>
              <h2 class="text-style-heading-card">{{ reviewsHeading }}</h2>
            </div>
          </Span>
        </Grid>
        <Grid>
          <!-- Vertical 3D perspective stack (see HomeReviewStack.vue), not the
               horizontal drag-rail HomeStandard uses — needs the centred
               column width, not the carousel's full-bleed edge-to-edge. -->
          <Span size="content">
            <div data-reveal>
              <HomeReviewStack :reviews="reviews" />
            </div>
          </Span>
        </Grid>
      </section>

      <section class="section">
        <Grid>
          <Span size="content">
            <div data-reveal>
              <HomePayments :heading="paymentsHeading" :sub="paymentsSub" />
            </div>
          </Span>
        </Grid>
      </section>

      <section class="section">
        <Grid>
          <Span size="content">
            <div data-reveal>
              <HomeFaq :faq="faq" />
            </div>
          </Span>
        </Grid>
      </section>

      <section class="section">
        <Grid>
          <Span size="content">
            <div data-reveal>
              <HomeNewsletter :heading="newsletterHeading" :body="newsletterBody" :cta="newsletterCta" :social-icons="socialIcons" />
            </div>
          </Span>
        </Grid>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-visual {
  position: relative;
  width: 100%;
  /* Shared "card surface" tokens the leaf components (HomeStatBand, HomeFaq,
     HomeReviewRail, HomePayments, HomeCategoryCards) read via a fallback
     chain — e.g. var(--x-home-surface-bg, var(--x-bg-card-default)). Standard's
     opaque white L2 cards read as flat/mismatched against this layout's dark,
     particle-lit page, so Visual swaps them for a translucent frosted-dark
     surface — a white tint at low alpha over the dark page, so it reads dark,
     not light; text stays on the default (light-ink) token — everything else
     about those components (layout, tokens for spacing/radius/motion) stays
     identical between layouts. Plain CSS custom properties, not a :deep()
     override, so this works regardless of Vue's scoped-style injection order. */
  --x-home-surface-bg: var(--x-surface-ghost-4);
  --x-home-surface-border: var(--x-border-soft-2);
  --x-home-surface-text: var(--x-text-header-default);
  --x-home-surface-text-sub: var(--x-text-body-default);
  /* Frosted-glass finish for every translucent surface above — the 64px blur
     matches BestSellerCard's own info bar over its photo background;
     saturate(1.6) is the classic glassmorphism addition (a plain blur alone
     reads as a dirty smudge, not glass — boosting saturation of whatever's
     behind it is what sells the "glass", not the surface fill itself). */
  --x-home-surface-blur: blur(64px) saturate(1.6);
}

/* Content sits above the particle canvas (z-index:0). */
.home-visual__content {
  position: relative;
  z-index: 1;
}

/* Homepage-only override — see HomeStandard.vue's identical rule for why. */
@container (min-width: 801px) {
  .home-visual :deep(.ce-span--content),
  .home-visual :deep(.ce-span--carousel) {
    grid-column: 1 / -1;
    max-width: 75%;
    justify-self: center;
    width: 100%;
    margin-left: 0;
    margin-right: 0;
  }
}

.section {
  padding-top: var(--x-pad-surface-l);
  padding-bottom: var(--x-pad-surface-xl);
}
.section--flush-top { padding-top: 0; }

.home-visual__hero {
  border-radius: var(--x-radius-container-l);
  overflow: hidden;
  box-shadow: var(--x-shadow-story-card);
}
.home-visual__head { margin-bottom: var(--x-gap-content-default); }
/* See HomeStandard.vue's identical comment — .text-style-* is inline-block
   by default (for the condense transform), so headings/descriptions need an
   explicit block override to always stack, not just at narrow widths. */
.home-visual__head h2 {
  display: block;
  margin: 0;
  color: var(--x-text-header-default);
}
.home-visual__head p {
  display: block;
  margin: 4px 0 0;
  color: var(--x-text-body-default);
}
.home-visual__tabs { margin-bottom: var(--x-gap-content-default); }
.home-visual__category-titles { margin-top: var(--x-gap-content-loose); }

/* ── Scroll-reveal choreography ──────────────────────────────────────────
   [data-reveal] elements start slightly below + transparent, and settle in
   with a staggered delay (--reveal-index, set by useReveal.js) once the
   IntersectionObserver marks them .is-in. Ease-out on entrance per the
   motion-design skill; transform/opacity only (GPU-cheap). Reduced-motion:
   useReveal marks everything .is-in immediately with no observer, so this
   transition simply never has anything to animate from. */
[data-reveal] {
  opacity: 0;
  transform: translateY(var(--x-motion-sys-distance-md, 16px));
  transition:
    opacity var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-decelerate),
    transform var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-decelerate);
  transition-delay: calc(var(--reveal-index, 0) * var(--x-motion-sys-stagger-sm, 50ms));
}
[data-reveal].is-in {
  opacity: 1;
  transform: none;
}
</style>
