<script setup>
import Grid from '../Grid.vue'
import Span from '../Span.vue'
import StoryCarousel from '../StoryCarousel.vue'
import FilterTabs from './FilterTabs.vue'
import TitleGrid from './TitleGrid.vue'
import TitleRail from './TitleRail.vue'
import HomePromoTiles from './HomePromoTiles.vue'
import HomeCategoryCards from './HomeCategoryCards.vue'
import HomePublisherSpotlight from './HomePublisherSpotlight.vue'
import HomeStatBand from './HomeStatBand.vue'
import HomeSteps from './HomeSteps.vue'
import HomeReviewRail from './HomeReviewRail.vue'
import HomePayments from './HomePayments.vue'
import HomeFaq from './HomeFaq.vue'
import HomeNewsletter from './HomeNewsletter.vue'

/**
 * HomeStandard — the default Codashop homepage: full editorial parity with
 * the PM's mock (hero → promos → trending titles → categories → picked for
 * you → trust → steps → reviews → payments → FAQ → newsletter).
 * Same content/props contract as HomeVisual — see HomeView.vue.
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
</script>

<template>
  <div class="home-standard">
    <!-- Hero -->
    <section class="section section--flush-top">
      <Grid>
        <Span size="carousel">
          <div class="home-standard__hero">
            <StoryCarousel
              :slides="heroSlides.map(s => ({ image: s.image, heading: s.heading, ctaLabel: s.ctaLabel }))"
              :aspect-ratio="heroAspect"
            />
          </div>
        </Span>
      </Grid>
    </section>

    <!-- Secondary promos -->
    <section class="section">
      <Grid>
        <Span size="carousel">
          <HomePromoTiles :tiles="promoTiles" />
        </Span>
      </Grid>
    </section>

    <!-- Trending titles -->
    <section class="section">
      <Grid>
        <Span size="content">
          <div class="home-standard__head">
            <div>
              <h2 class="text-style-heading-section">{{ trendingHeading }}</h2>
              <p class="text-style-paragraph-small">{{ trendingSub }}</p>
            </div>
          </div>
          <FilterTabs
            :tabs="trendingTabs"
            :active="activeFilter"
            class="home-standard__tabs"
            @update:active="$emit('update:active-filter', $event)"
          />
          <TitleGrid :titles="trendingTitles" @open-title="$emit('open-title')" />
        </Span>
      </Grid>
    </section>

    <!-- Publisher spotlight — "sellable slot" merchandising panel -->
    <section class="section">
      <Grid>
        <Span size="content">
          <HomePublisherSpotlight
            :heading="spotlightHeading"
            :sub="spotlightSub"
            :logo="spotlightLogo"
            :logo-alt="spotlightLogoAlt"
            :titles="spotlightTitles"
            @open-title="$emit('open-title')"
          />
        </Span>
      </Grid>
    </section>

    <!-- Shop by category -->
    <section class="section">
      <Grid>
        <Span size="content">
          <div class="home-standard__head">
            <div>
              <h2 class="text-style-heading-section">{{ categoriesHeading }}</h2>
              <p class="text-style-paragraph-small">{{ categoriesSub }}</p>
            </div>
          </div>
          <HomeCategoryCards
            :categories="categoryCards"
            :active="activeCategory"
            @select="$emit('update:active-category', $event)"
          />
          <div v-if="activeCategory" class="home-standard__category-titles">
            <TitleGrid :titles="categoryTitles" variant="standard" @open-title="$emit('open-title')" />
          </div>
        </Span>
      </Grid>
    </section>

    <!-- Picked for you -->
    <section class="section">
      <Grid>
        <Span size="content">
          <div class="home-standard__head">
            <div>
              <h2 class="text-style-heading-section">{{ pickedHeading }}</h2>
              <p class="text-style-paragraph-small">{{ pickedSub }}</p>
            </div>
          </div>
        </Span>
        <Span size="carousel">
          <TitleRail :titles="pickedTitles" @open-title="$emit('open-title')" />
        </Span>
      </Grid>
    </section>

    <!-- Trust band -->
    <section class="section">
      <Grid>
        <Span size="content">
          <HomeStatBand :stats="trustStats" />
        </Span>
      </Grid>
    </section>

    <!-- How it works -->
    <section class="section">
      <Grid>
        <Span size="content">
          <div class="home-standard__head">
            <div>
              <h2 class="text-style-heading-section">{{ stepsHeading }}</h2>
              <p class="text-style-paragraph-small">{{ stepsSub }}</p>
            </div>
          </div>
          <HomeSteps :steps="steps" />
        </Span>
      </Grid>
    </section>

    <!-- Reviews -->
    <section class="section">
      <Grid>
        <Span size="content">
          <div class="home-standard__head">
            <div>
              <h2 class="text-style-heading-section">{{ reviewsHeading }}</h2>
              <p class="text-style-paragraph-small">{{ reviewsSub }}</p>
            </div>
          </div>
        </Span>
        <Span size="carousel">
          <HomeReviewRail :reviews="reviews" />
        </Span>
      </Grid>
    </section>

    <!-- Payments -->
    <section class="section">
      <Grid>
        <Span size="content">
          <HomePayments :heading="paymentsHeading" :sub="paymentsSub" />
        </Span>
      </Grid>
    </section>

    <!-- FAQ -->
    <section class="section">
      <Grid>
        <Span size="content">
          <div class="home-standard__head">
            <div>
              <h2 class="text-style-heading-section">{{ faqHeading }}</h2>
              <p class="text-style-paragraph-small">{{ faqSub }}</p>
            </div>
          </div>
          <HomeFaq :faq="faq" />
        </Span>
      </Grid>
    </section>

    <!-- Newsletter -->
    <section class="section">
      <Grid>
        <Span size="content">
          <HomeNewsletter :heading="newsletterHeading" :body="newsletterBody" :cta="newsletterCta" :social-icons="socialIcons" />
        </Span>
      </Grid>
    </section>
  </div>
</template>

<style scoped>
.home-standard { width: 100%; }

/* Homepage-only override — Span's own `content`/`carousel` M/L width
   (8-of-12 columns, capped at 960px) is the app-wide default used
   everywhere else; the homepage wants a wider 3/4-of-screen column at M and
   up instead. Scoped to `.home-standard` so no other Span consumer in the
   app is affected. `grid-column: 1/-1` + a percentage `max-width` (rather
   than trying to express "75%" as an exact column span — 9 of 12 columns
   can't be centred symmetrically) is what makes the percentage resolve
   against the full grid width instead of Span's own narrower column
   allocation. */
@container (min-width: 801px) {
  .home-standard :deep(.ce-span--content),
  .home-standard :deep(.ce-span--carousel) {
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
.section--flush-top {
  padding-top: 0;
}

.home-standard__head {
  margin-bottom: var(--x-gap-content-default);
}
/* .text-style-* classes are display:inline-block (needed for the condense
   scaleX transform) — without an explicit block override here, a short
   heading + short description can end up side-by-side once the container is
   wide enough to fit both on one line (M+), instead of always stacking. */
.home-standard__head h2 {
  display: block;
  margin: 0;
  color: var(--x-text-header-default);
}
.home-standard__head p {
  display: block;
  margin: 2px 0 0;
  color: var(--x-text-body-default);
}
.home-standard__tabs {
  margin-bottom: var(--x-gap-content-default);
}
.home-standard__category-titles {
  margin-top: var(--x-gap-content-loose);
}
</style>
