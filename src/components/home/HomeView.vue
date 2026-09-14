<script setup>
import { computed, ref } from 'vue'
import { useStoreHome } from '../../composables/useStoreHome.js'
import { useStoreStrings } from '../../composables/useStoreStrings.js'
import { useStoreConfig } from '../../composables/useStoreConfig.js'
import { useStoreAssets } from '../../composables/useStoreAssets.js'
import HomeStandard from './HomeStandard.vue'
import HomeVisual from './HomeVisual.vue'
import HomeBlob from './HomeBlob.vue'

const LAYOUT_SHELLS = { standard: HomeStandard, visual: HomeVisual, blob: HomeBlob }

/**
 * HomeView — orchestrator for the Codashop aggregator homepage (config.home).
 * Reads the store's homepage data/copy/art once, shapes it into the shared
 * prop contract all three layout shells (HomeStandard / HomeVisual / HomeBlob)
 * consume, and owns the interactive state they all share: the trending-titles
 * filter tab (activeFilter) and the shop-by-category card selection
 * (activeCategory — a separate id space, see below). All three shells render
 * the SAME content — they differ only in presentation and motion.
 */
const props = defineProps({
  /** 'standard' | 'visual' | 'blob' — the homepageLayout feature flag's value. */
  layout: { type: String, default: 'standard' },
})
const emit = defineEmits(['open-title'])

const home = useStoreHome()
const strings = computed(() => useStoreStrings().value.home ?? {})
const config = computed(() => useStoreConfig().value.home ?? {})
const assets = computed(() => useStoreAssets().value.home ?? {})

const activeFilter = ref('all')
// Which "Shop by category" card is picked — a SEPARATE selection from
// activeFilter above: category ids ('popular', 'social', …) and trending's
// `cat` values ('moba', 'battle', …) are two different taxonomies over the
// same title list, so a card click can't just reuse the trending filter.
// Defaults to the first category ('popular'/"Direct Top-Up" for Codashop)
// rather than null, so the Blob layout's Genres/Category rail — the only
// shell that renders a category as "selected" without a prior click — has
// something sensible pre-filtered instead of falling back to pickedTitles.
const activeCategory = ref(home.value?.categories?.[0]?.id ?? null)

const allTitles = computed(() => {
  const cats = home.value?.categories ?? []
  return cats.flatMap(c => c.titles.map(t => ({ ...t, groupId: c.id, groupLabel: c.label })))
})

const trendingTitles = computed(() => {
  const list = activeFilter.value === 'all'
    ? allTitles.value
    : allTitles.value.filter(t => t.cat === activeFilter.value)
  return list.slice(0, 12)
})

// "Picked for you" — a stable, varied slice across categories rather than the
// same head of the list trending already shows.
const pickedTitles = computed(() => {
  const all = allTitles.value
  return all.filter((_, i) => i % 3 === 1).slice(0, 10)
})

const categoryCards = computed(() => (home.value?.categories ?? []).map(c => ({
  id: c.id,
  label: c.label,
  count: c.titles.length,
  cover: c.titles[0]?.tile ?? null,
})))

// The selected category's own titles — what the cards filter "below" them.
const categoryTitles = computed(() => {
  const cats = home.value?.categories ?? []
  const active = cats.find(c => c.id === activeCategory.value)
  return (active?.titles ?? []).slice(0, 12)
})

function onOpenTitle () {
  emit('open-title')
}
function onFilterChange (id) {
  activeFilter.value = id
}
function onCategorySelect (id) {
  activeCategory.value = activeCategory.value === id ? null : id
}

const sharedProps = computed(() => ({
  heroSlides: strings.value.hero ?? [],
  heroAspect: config.value.heroAspect ?? null,
  promoTiles: strings.value.promoTiles ?? [],
  trendingHeading: strings.value.trending?.heading,
  trendingSub: strings.value.trending?.sub,
  trendingTabs: strings.value.trending?.tabs ?? [],
  activeFilter: activeFilter.value,
  trendingTitles: trendingTitles.value,
  spotlightHeading: strings.value.spotlightHeading,
  spotlightSub: strings.value.spotlightSub,
  spotlightLogo: home.value?.publisherSpotlight?.logo ?? null,
  spotlightLogoAlt: home.value?.publisherSpotlight?.logoAlt ?? '',
  spotlightTitles: home.value?.publisherSpotlight?.titles ?? [],
  // Home Blob layout's Highlighted Titles section only — see its own
  // comment in store.js. Standard/Visual simply don't consume this.
  highlightsArt: home.value?.highlightsArt ?? {},
  categoriesHeading: strings.value.categoriesHeading,
  categoriesSub: strings.value.categoriesSub,
  categoryCards: categoryCards.value,
  activeCategory: activeCategory.value,
  categoryTitles: categoryTitles.value,
  pickedHeading: strings.value.pickedHeading,
  pickedSub: strings.value.pickedSub,
  pickedTitles: pickedTitles.value,
  trustStats: strings.value.trustStats ?? [],
  stepsHeading: strings.value.stepsHeading,
  stepsSub: strings.value.stepsSub,
  steps: strings.value.steps ?? [],
  reviewsHeading: strings.value.reviewsHeading,
  reviewsSub: strings.value.reviewsSub,
  reviews: strings.value.reviews ?? [],
  paymentsHeading: strings.value.paymentsHeading,
  paymentsSub: strings.value.paymentsSub,
  faqHeading: strings.value.faqHeading,
  faqSub: strings.value.faqSub,
  faq: strings.value.faq ?? [],
  newsletterHeading: strings.value.newsletterHeading,
  newsletterBody: strings.value.newsletterBody,
  newsletterCta: strings.value.newsletterCta,
  socialIcons: assets.value.social ?? {},
}))
</script>

<template>
  <component
    :is="LAYOUT_SHELLS[layout] ?? HomeStandard"
    v-bind="sharedProps"
    @open-title="onOpenTitle"
    @update:active-filter="onFilterChange"
    @update:active-category="onCategorySelect"
  />
</template>
