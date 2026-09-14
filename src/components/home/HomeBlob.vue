<script setup>
import { computed } from 'vue'
import Grid from '../Grid.vue'
import Span from '../Span.vue'
import StoryCarousel from '../StoryCarousel.vue'
import HomeBlobSection from './HomeBlobSection.vue'
import HomeBlobSpotlight from './HomeBlobSpotlight.vue'
import HomeBlobPicked from './HomeBlobPicked.vue'
import HomeBlobHighlights from './HomeBlobHighlights.vue'
import HomeBlobGenreRail from './HomeBlobGenreRail.vue'
import HomeBlobStats from './HomeBlobStats.vue'
import HomeBlobSteps from './HomeBlobSteps.vue'
import HomeReviewRail from './HomeReviewRail.vue'
import HomePayments from './HomePayments.vue'
import HomeFaq from './HomeFaq.vue'
import HomeNewsletter from './HomeNewsletter.vue'

/**
 * HomeBlob — the acrylic / organic-blob Codashop homepage (Figma frame
 * node 4108:34), the DEFAULT `homepageLayout` option (see
 * useFeatureFlags.js). Same content/props contract as HomeStandard/
 * HomeVisual — see HomeView.vue.
 *
 * Figma only mocked 4 sections (hero → Publisher Spotlight → Highlighted
 * Titles → Genres/Category); per the current design pass this shell now
 * ALSO inserts a "Picked for you" blob section (adopting the same rail
 * pattern as Genres, no Figma mock of its own) right after Publisher
 * Spotlight.
 *
 * Each blob-background section is a HomeBlobSection (full-bleed blob,
 * `full` prop controls only the INNER content width) wrapping that
 * section's own content-only component.
 *
 * Below Genres/Category, the same editorial tail HomeStandard/HomeVisual
 * show (trust stats, steps, reviews, payments, FAQ, newsletter) is mostly
 * reused as-is: the `--x-home-surface-*` custom properties they already read
 * (see HomeVisual.vue's identical mechanism) are repointed from the generic
 * system card to Home Blob's own dark card + rounder radius, right where the
 * tail starts below. These sections sit on the plain page background between
 * blob shapes, not inside one, so their headings stay on the page's own
 * default (light) ink rather than a blob-specific hue.
 *
 * Trust stats and steps are the two exceptions — HomeBlobStats/HomeBlobSteps
 * are bespoke components, not a reskin of the shared HomeStatBand/HomeSteps,
 * because both read as flat, low-personality lists with no tie to this
 * layout's own colourful, playful identity (and HomeSteps' shared row, once
 * reskinned to this layout's rounder radius, read as a stadium pill rather
 * than a squircle purely from its own short/wide proportions). Both get an
 * icon per item and the purple/teal/gold blob-palette hues Spotlight/
 * Highlights/Genres already use, plus their own horizontal-rail-on-mobile
 * treatment matching every other Home Blob section.
 */
const props = defineProps({
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
  /** Name-keyed { [title.name]: tileUrl } override — Highlighted Titles
   * only, see store.js's own `home.highlightsArt` comment. */
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

// Blob geometry — lifted verbatim from the Figma export's own "BG"/
// "background" layers (see HomeBlobShape.vue for why path, not fill, is
// what's reused).
// Figma's own bottom edge is a dead-straight line (H89.9472) between the two
// corner curves — reads fine on desktop's wide/short box but looks flat next
// to the top's genuine curvature, especially on mobile's taller box (a
// straight segment stays straight under any non-uniform stretch, so it's
// not an aspect-ratio artifact — it's just how the edge was authored).
// Replaced with a shallow symmetric bulge (endpoints unchanged, so it still
// meets the untouched corner curves exactly) dipping 24px past the original
// 378.169 baseline; view-box-height below is bumped by that same 24px
// (378.169 → 402.169) so the bulge has room without clipping at the
// viewBox edge — HomeBlobShape's preserveAspectRatio="none" only cares
// about the ratio, so this doesn't change the section's actual rendered
// size, just the shape's internal proportions.
const SPOTLIGHT_PATH = 'M0 288.222C0 251.809 21.7159 219.125 55.7057 206.065C197.475 151.589 580.327 13.9039 857.5 1.89941C932.249 -1.33801 969.623 -2.95671 998.323 18.75C1004.24 23.2225 1010.35 29.0747 1015.07 34.789C1038 62.5226 1038 102.491 1038 182.428V187.428C1038 272.737 1038 315.392 1013.66 343.555C1010.49 347.225 1007.06 350.659 1003.39 353.83C975.223 378.169 932.568 378.169 847.259 378.169C594.822 410.169 342.384 410.169 89.9472 378.169C40.2708 378.169 0 337.898 0 288.222Z'
const HIGHLIGHTS_PATH = 'M0 200C0 105.719 0 58.5787 29.2893 29.2893C58.5786 6.63102e-06 105.704 5.6403e-06 199.955 3.65885e-06C396.127 -4.65308e-07 686.634 -3.65513e-06 834 8.89425e-06C1034.75 2.59896e-05 1224.49 504.448 1269.8 633.677C1274.71 647.67 1277.16 654.667 1278.58 662.998C1280 671.33 1280 679.302 1280 695.247V1262.99C1280 1357.27 1280 1404.41 1250.71 1433.7C1221.42 1462.99 1174.28 1462.99 1080 1462.99H200C105.719 1462.99 58.5786 1462.99 29.2893 1433.7C0 1404.41 0 1357.27 0 1262.99V200Z'
// Figma's own export had an asymmetric top: the top-right rounded corner
// spans 206.5px (1073.5→1280) but the top-left corner only spanned 122px
// (0→122) — a visibly tighter curve on the left. Corrected here by mirroring
// the top-right corner's exact curve across the shape's vertical centre
// (x=640) instead of reusing Figma's narrower left curve, so both top
// corners now share the same 206.5px span/curvature. Bottom corners were
// already symmetric and are untouched.
const GENRES_PATH = 'M206.5 0C206.5 0 838.5 0.009248 1073.5 0C1080 -0.000255171 1280 1.59564e-05 1280 180.03C1280 255.053 1280 292.565 1260.89 318.857C1254.73 327.333 1247.27 334.787 1238.8 340.948C1212.5 360.06 1174.99 360.06 1099.97 360.06H180.03C105.007 360.06 67.495 360.06 41.2025 340.948C32.7272 334.787 25.2728 327.333 19.1121 318.857C0 292.565 0 255.053 0 180.03C0 -0.000255171 200 1.59564e-05 206.5 0Z'
// Picked for you now reuses Publisher Spotlight's own silhouette, mirrored
// horizontally (every x → 1038−x, y untouched — Spotlight's own viewBox is
// 1038 wide) per the latest design pass, rather than a bespoke shape — the
// two sections sit back-to-back and read as a matched pair this way. Still
// all cubic beziers (mirroring just negates/offsets each x term, so affine-
// safety under HomeBlobShape's preserveAspectRatio="none" stretch carries
// over unchanged from SPOTLIGHT_PATH). Same bottom-edge bulge as Spotlight
// for the same reason (see its comment) — mirrored, same 24px dip.
const PICKED_PATH = 'M1038 288.222C1038 251.809 1016.2841 219.125 982.2943 206.065C840.525 151.589 457.673 13.9039 180.5 1.89941C105.751 -1.33801 68.377 -2.95671 39.677 18.75C33.76 23.2225 27.65 29.0747 22.93 34.789C0 62.5226 0 102.491 0 182.428V187.428C0 272.737 0 315.392 24.34 343.555C27.51 347.225 30.94 350.659 34.61 353.83C62.777 378.169 105.432 378.169 190.741 378.169C443.178 410.169 695.616 410.169 948.0528 378.169C997.7292 378.169 1038 337.898 1038 288.222Z'

// Highlighted Titles' own art override, applied ONLY to what's passed into
// <HomeBlobHighlights> below — trendingTitles itself (shared with Standard/
// Visual/Genres/Picked for you via HomeView.vue) is never mutated, so every
// other consumer keeps the generic square ref art regardless of this.
const highlightedTitles = computed(() =>
  props.trendingTitles.map(t => (props.highlightsArt[t.name] ? { ...t, tile: props.highlightsArt[t.name] } : t)),
)
</script>

<template>
  <div class="home-blob">
    <!-- Hero carousel -->
    <section class="section section--flush-top">
      <Grid>
        <Span size="carousel">
          <div class="home-blob__hero">
            <StoryCarousel
              :slides="heroSlides.map(s => ({ image: s.image, heading: s.heading, ctaLabel: s.ctaLabel }))"
              :aspect-ratio="heroAspect ?? '2.6 / 1'"
            />
          </div>
        </Span>
      </Grid>
    </section>

    <!-- Publisher Spotlight -->
    <HomeBlobSection :view-box-width="1038" :view-box-height="402.169" :path="SPOTLIGHT_PATH" fill="var(--x-home-blob-fill-spotlight)">
      <HomeBlobSpotlight
        :heading="spotlightHeading"
        :logo="spotlightLogo"
        :logo-alt="spotlightLogoAlt"
        :titles="spotlightTitles"
        @open-title="$emit('open-title')"
      />
    </HomeBlobSection>

    <!-- Picked for you (no Figma mock — Spotlight's own blob, mirrored) -->
    <HomeBlobSection :view-box-width="1038" :view-box-height="402.169" :path="PICKED_PATH" fill="var(--x-home-blob-fill-picked)">
      <HomeBlobPicked
        :heading="pickedHeading"
        :titles="pickedTitles"
        @open-title="$emit('open-title')"
      />
    </HomeBlobSection>

    <!-- Highlighted Titles — blob bleeds full width, cards stay centred -->
    <HomeBlobSection :view-box-width="1280" :view-box-height="1462.99" :path="HIGHLIGHTS_PATH" fill="var(--x-home-blob-fill-highlights)" blob-full>
      <HomeBlobHighlights
        :tabs="trendingTabs"
        :active="activeFilter"
        :titles="highlightedTitles"
        @update:active="$emit('update:active-filter', $event)"
        @open-title="$emit('open-title')"
      />
    </HomeBlobSection>

    <!-- Genres / Category rail — blob AND content full width -->
    <HomeBlobSection :view-box-width="1280" :view-box-height="360.06" :path="GENRES_PATH" fill="var(--x-home-blob-fill-genres)" blob-full full>
      <HomeBlobGenreRail
        :categories="categoryCards"
        :active="activeCategory"
        :titles="activeCategory ? categoryTitles : pickedTitles"
        @select="$emit('update:active-category', $event)"
        @open-title="$emit('open-title')"
      />
    </HomeBlobSection>

    <!-- Trust band -->
    <section class="section">
      <Grid>
        <Span size="content">
          <HomeBlobStats :stats="trustStats" />
        </Span>
      </Grid>
    </section>

    <!-- How it works -->
    <section class="section">
      <Grid>
        <Span size="content">
          <div class="home-blob__head">
            <div>
              <h2 class="text-style-heading-section">{{ stepsHeading }}</h2>
              <p class="text-style-paragraph-small">{{ stepsSub }}</p>
            </div>
          </div>
          <HomeBlobSteps :steps="steps" />
        </Span>
      </Grid>
    </section>

    <!-- Reviews -->
    <section class="section">
      <Grid>
        <Span size="content">
          <div class="home-blob__head">
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
          <div class="home-blob__head">
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
.home-blob {
  width: 100%;
  /* Reskins the editorial tail's remaining shared components (HomeReviewRail,
     HomePayments, HomeFaq, HomeNewsletter — NOT trust stats or steps, which
     are HomeBlobStats/HomeBlobSteps, bespoke components with their own
     gradients, not a reskin) from the generic system card to Home Blob's own
     dark squircle-card palette, the same custom-property mechanism
     HomeVisual.vue uses for its frosted-dark look — plain CSS custom
     properties, not a :deep() override, so this works regardless of Vue's
     scoped-style injection order. --x-home-surface-* is the fallback chain
     those components already use when unset (see HomeFaq.vue), so the
     text/bg pairing here is what those components would render as raw
     values anyway, just repointed. */
  /* Dark mode pass: was neutral-0 (white) + -inverse (dark ink) text, matching
     HomeBlobCard's own identical dark-mode change so the editorial tail's
     cards and the original 4 sections' cards read as the same surface. */
  --x-home-surface-bg: var(--x-palette-home-blob-neutral-900, #1a0038);
  --x-home-surface-border: transparent;
  /* -default is the light neutral ink on this theme (see .home-blob__head's
     comment below) — correct now that the card itself is dark. */
  --x-home-surface-text: var(--x-text-header-default);
  --x-home-surface-text-sub: var(--x-text-body-default);
  --x-home-surface-blur: none;
  /* These components hardcode --x-radius-container-s for their own card
     shell (no --x-home-surface-radius indirection to hook into), so it's
     repointed directly at Home Blob's own (smaller) rail-card radius —
     safe to scope here since no other Home Blob content reads this token. */
  --x-radius-container-s: var(--x-radius-home-blob-rail-card);
  /* FAQ accordion chevron — AccordionHeader.vue's own --ah-chevron-motion
     override hook, instead of the plain --x-motion-accordion every other
     accordion in the app (ItemSummary, PromoCode, and FAQ on Standard/
     Visual) uses. NOT the shared --x-motion-home-blob-ease-elastic (used
     for card hover/press elsewhere) — that curve's negative first control
     point creates a brief anticipation dip (the shape moves slightly
     backwards before its main motion), which reads as a stutter/pause on a
     rotation rather than a bounce. --faq-ease-back below starts moving
     immediately and only overshoots at the END, settling — snappy start,
     bouncy finish, no pause. Custom properties inherit through scoped-style
     boundaries, so this needs no :deep(). */
  --faq-ease-back: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ah-chevron-motion: var(--x-motion-sys-duration-base) var(--faq-ease-back);
}
/* FAQ accordion row hover/press. NOT set on .home-blob's own root (tried
   that first — no effect) — HomeFaq.vue already sets --ah-bg-hover/
   --ah-active-transform directly on .home-faq__q itself (its hover resolves
   through --x-home-surface-border, which this file already points at
   transparent, and its press is a barely-there scale(0.99)), and for CSS
   custom properties, the declaration closest to the actual element wins
   regardless of ancestor source order — a root-level value on .home-blob
   never reaches an element that redeclares the same property on itself.
   Overriding the same .home-faq__q class directly here wins on specificity
   instead (extra .home-blob ancestor class): a real acrylic hover highlight
   and a more noticeable press scale, matching the rest of this layout. */
.home-blob :deep(.home-faq__q) {
  --ah-bg-hover: color-mix(in oklch, var(--x-palette-home-blob-neutral-0, #fff8fc) 8%, transparent);
  --ah-active-transform: scale(0.98);
}
/* AccordionHeader's own `.ah:active` rule only ever sets `transform` — no
   background hook exists for the pressed state at all, unlike hover. The
   button's own background is transparent at rest (see .ah's base rule), so
   with only a transform, pressing just nudges the label/chevron text 2%
   toward centre while the visible card surface behind it (.home-faq__item)
   never changes — reads as "the press effect doesn't cover the accordion"
   because, visually, it doesn't: on touch (no :hover state to fall back on)
   nothing distinguishes pressed from idle beyond that barely-visible text
   shrink. AccordionHeader has no --ah-bg-active-style hook to reuse, so this
   sets `background` directly on `:active` — stronger than the hover fill so
   a press reads as a clear, deliberate state change edge-to-edge across the
   whole row (clipped to HomeFaq's own rounded card by its overflow:hidden). */
.home-blob :deep(.home-faq__q:active) {
  background: color-mix(in oklch, var(--x-palette-home-blob-neutral-0, #fff8fc) 16%, transparent);
}
/* FAQ accordion panel — AccordionPanel.vue hardcodes its grid-template-rows
   transition straight to --x-motion-accordion with no override hook (unlike
   the chevron above), so this needs an actual :deep() override. Scoped to
   .home-blob, so ItemSummaryAccordion/PromoCode elsewhere and FAQ on
   Standard/Visual keep the plain accordion motion.
   grid-template-rows alone can't actually overshoot here — a single-row
   `Nfr` track always equals exactly the container's own auto height
   (there's no larger "available space" for a bigger fr value to claim), so
   an elastic curve on it just changes velocity, not size — no visible
   bounce. The real bounce comes from a second, layered transform on the
   content itself: pre-scaled down while closed, animating past 1 and
   settling back on open — a plain transform genuinely overshoots.
   Uses --faq-ease-back (see the chevron override above), not the
   two-sided --x-motion-home-blob-ease-elastic — that curve's anticipation
   dip made the reveal visibly pause/shrink for a beat before expanding,
   which read as laggy rather than bouncy. --faq-ease-back moves
   immediately in the right direction and only overshoots at the end. */
.home-blob :deep(.ap) {
  transition: grid-template-rows var(--x-motion-sys-duration-base) var(--faq-ease-back);
}
.home-blob :deep(.ap__pad) {
  transform-origin: top;
  transition: transform var(--x-motion-sys-duration-base) var(--faq-ease-back);
}
.home-blob :deep(.ap:not(.is-open) .ap__pad) {
  transform: scaleY(0.85);
}

/* Homepage-only override — see HomeStandard.vue's identical rule for why.
   :deep() compiles to a plain descendant selector, so this also reaches the
   Grid/Span HomeBlobSection.vue renders internally for its non-`full`
   sections (Spotlight, Picked for you, Highlighted Titles) — only the blob
   background itself stays edge-to-edge in those; this is what narrows their
   CARD content back down to the readable centred column. Genres' `full`
   section renders no Grid/Span at all, so it's untouched by this rule. */
@container (min-width: 801px) {
  .home-blob :deep(.ce-span--content),
  .home-blob :deep(.ce-span--carousel) {
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
/* Hero sits flush against the navbar on mobile (its own top:0), but reads
   as cramped once there's room to spare — pushed 32px lower starting at
   the M breakpoint only. */
@container (min-width: 801px) {
  .section--flush-top { padding-top: 32px; }
}

.home-blob__hero {
  border-radius: var(--x-radius-home-blob-card);
  corner-shape: var(--x-corner-shape-home-blob);
  overflow: hidden;
  /* Dark mode pass — same neutral-900 dark surface as HomeBlobCard. */
  border: 20px solid var(--x-palette-home-blob-neutral-900, #1a0038);
  box-shadow: var(--x-shadow-story-card);
}
/* Editorial tail section heads (Steps/Reviews/FAQ) — these sit on the plain
   dark page background between blob shapes, not inside one. On this theme
   --x-text-header/-body-*-default resolves to the light ink meant for that
   dark page (verified at runtime: default=oklch(1.000 ...), inverse=oklch
   (0.148 ...) — "inverse" here is the DARK ink used on light/bright
   surfaces, e.g. HomeBlobSpotlight's heading sitting on its bright blob
   fill — not the light-on-dark pairing its name suggests). Note this is the
   opposite of the pairing HomeStandard/HomeVisual's own identical heads use
   (they read as near-invisible against this same dark page background,
   which looks like a pre-existing contrast bug there, not something to
   mirror here). */
.home-blob__head { margin-bottom: var(--x-gap-content-default); }
.home-blob__head h2 {
  display: block;
  margin: 0;
  color: var(--x-text-header-default);
}
.home-blob__head p {
  display: block;
  margin: 2px 0 0;
  color: var(--x-text-body-default);
}

/* Newsletter — HomeNewsletter.vue hardcodes its own card background and CTA
   colours (no --x-home-surface-*-style override hook), so these need actual
   :deep() overrides. Scoped to .home-blob so Standard/Visual keep the
   original teal card + primary-action button. */
.home-blob :deep(.newsletter) {
  /* Same purple every other blob section already uses, instead of the
     fixed teal every layout otherwise shares. */
  background: var(--x-home-blob-fill-spotlight);
}
.home-blob :deep(.newsletter__cta) {
  /* The app's actual "secondary button" token pair (Button.vue's own
     secondary variant), replacing the primary-action styling — resolves
     against this theme's own primary ramp, so it stays in the same purple
     family as the card behind it. */
  background: var(--x-bg-action-secondary);
  color: var(--x-text-on-action-secondary);
}

/* Payments — HomePayments.vue hardcodes its heading/sub to -inverse (dark
   ink, its usual role on this theme's bright/light surfaces), but per
   design feedback this panel reads better with the white -default text
   instead. Scoped to .home-blob; the fixed coral/gold panel itself is
   intentionally the same across every layout (see HomePayments.vue's own
   comment), only the text colour changes here. */
.home-blob :deep(.home-payments__heading) {
  color: var(--x-text-header-default);
}
.home-blob :deep(.home-payments__sub) {
  color: var(--x-text-body-default);
}
</style>
