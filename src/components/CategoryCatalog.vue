<script setup>
import BundleSkuCard from './BundleSkuCard.vue'
import BundleGrid from './BundleGrid.vue'
import SkuImageCard from './SkuImageCard.vue'
import HeroSkuCard from './HeroSkuCard.vue'
import CategoryBanner from './CategoryBanner.vue'
import Grid from './Grid.vue'
import Span from './Span.vue'
import CategoryJumpNav from './CategoryJumpNav.vue'
import { computed } from 'vue'
import { useStoreAssets } from '../composables/useStoreAssets.js'
import { useStoreConfig } from '../composables/useStoreConfig.js'
import { useFeatureFlags } from '../composables/useFeatureFlags.js'
// Loyalty icon comes from the store's brand assets (FCM ships MP Simple);
// stores with a loyalty programme but no branded mark fall back to the generic
// Material "stars" glyph. Both render via CSS mask + currentColor downstream.
import genericLoyaltyIcon from '@material-symbols/svg-400/rounded/stars.svg?url'

/**
 * CategoryCatalog — renders the subcategories for the active FCM category.
 *
 * Receives a single `category` node from the useStoreCatalog tree and renders
 * each of its subcategories. Card type is determined by the subcategory's
 * `cardType` field (driven by the catalogue data, never by store identity):
 *
 *   'bundle' → one BundleSkuCard per item (Campaign Packs) — or, when the
 *              `cardVariant` prop override is `'prod'`, one SkuImageCard
 *              (variant="prod") per item instead; prod's design has no
 *              separate bundle template.
 *   'sku'    → subcategory heading rendered; card content deferred until
 *              per-category designs are provided.
 *
 * Switching categories cross-fades the whole section tree and replays every
 * card's staggered entrance animation (the key on the inner wrapper forces
 * Vue to replace the subtree on category change).
 *
 * All motion uses tokens; only opacity/transform are animated.
 */

const props = defineProps({
  /** Active category node from useStoreCatalog */
  category:  { type: Object,  required: true },
  /** Section entrance base delay in ms — offsets the cascade per subcategory */
  baseDelay: { type: Number,  default: 0 },
  /** Overrides every subcategory's own cardVariant when set (e.g. 'prod' for
   *  the FCM production-SKU-card pilot) — null (default) leaves the catalogue
   *  data's own per-subcategory cardVariant untouched. */
  cardVariant: { type: String, default: null },
  /** Jump-nav options [{ id, label }] for the end-of-category dropdown —
   *  either the caller's category list or (when activeSubcategoryId is set)
   *  its flattened subcategory list, so the dropdown's granularity always
   *  matches whatever unit is actually being filtered. Omitted/empty hides
   *  the nav. */
  categories: { type: Array, default: () => [] },
  /** When set, only the ONE subcategory matching this id renders (every
   *  other subcategory of `category` is skipped) — FCM's flat nav filters
   *  down to a single subcategory's worth of SKUs, not a whole category's.
   *  null (default) renders every subcategory, unchanged. */
  activeSubcategoryId: { type: String, default: null },
})

const assets = useStoreAssets()
const loyaltyIcon = computed(() => assets.value.brand.loyaltyIcon || genericLoyaltyIcon)

const config = useStoreConfig()
const { isEnabled } = useFeatureFlags()
const showCategoryJumpNav = computed(
  () => isEnabled('categoryJumpNav') && !!config.value.nav?.categoryJump,
)
// L2 jump-nav mode tracks whether categories are filtered (only the active
// one on the page — select via emit) or all shown at once (every category
// already on the page — scroll to its anchor). This is config.catalog.mode,
// independent of nav.multiLevel (L1) — see App.vue's isFilter/isMultiLevel split.
const jumpNavMode = computed(() => (config.value.catalog?.mode === 'filter' ? 'filter' : 'scroll'))

const emit = defineEmits(['select-category'])
</script>

<template>
  <!-- mode="out-in": old category fades out fully before new one enters.
       This gives each category its own clean slate and replays the card
       entrance cascade on every switch. -->
  <Transition name="cat-catalog" mode="out-in">
    <!-- key forces Vue to unmount + remount the full subtree on category
         change, so BundleSkuCard's animation-delay resets to 0 and replays. -->
    <div :key="`${category.id}-${activeSubcategoryId ?? ''}`" class="cat-catalog">
      <template v-for="(sub, si) in category.subcategories" :key="sub.id">
      <section
        v-if="!activeSubcategoryId || sub.id === activeSubcategoryId"
        :id="sub.id"
        class="cat-catalog__section"
      >
        <Grid>
          <Span size="content">

            <!-- ── Hero subcategory (flagship named products / editions) ── -->
            <div v-if="sub.cardType === 'hero'" class="cat-catalog__content">
              <CategoryBanner v-if="sub.promo" v-bind="sub.promo" />
              <h2 v-else-if="sub.label" class="cat-catalog__heading text-style-heading-banner">
                {{ sub.label }}
              </h2>
              <HeroSkuCard
                v-for="(item, i) in sub.items"
                :key="i"
                v-bind="item"
                :base-delay="baseDelay + si * 80 + i * 120"
              />
            </div>

            <!-- ── Bundle subcategory (Campaign Packs / TWG) ────────────────
                 fcmSkuCardModel 'prod': renders as regular SKU cards (prod's
                 own design has no separate bundle template) instead of
                 BundleSkuCard — same conversion as the gifts branches in
                 App.vue below. -->
            <div v-else-if="sub.cardType === 'bundle'" class="cat-catalog__content">
              <CategoryBanner v-if="sub.promo" v-bind="sub.promo" />
              <h2 v-else class="cat-catalog__heading text-style-heading-banner">
                {{ sub.label }}
              </h2>
              <div v-if="cardVariant === 'prod'" class="cat-catalog__sku-grid">
                <SkuImageCard
                  v-for="(item, i) in sub.items"
                  :key="i"
                  :title="item.title"
                  :subtitle="item.subtitle"
                  :current-price="item.currentPrice"
                  :loyalty-points="item.loyaltyPoints ?? null"
                  :loyalty-icon="loyaltyIcon"
                  :sku-image="item.skuImage"
                  :info-items="item.infoItems ?? null"
                  variant="prod"
                  :base-delay="baseDelay + si * 80"
                  :anim-delay="i * 90"
                />
              </div>
              <BundleGrid v-else>
                <!-- v-bind="item" already spreads item.infoItems (catalog-built,
                     null when the SKU is ineligible for the info sheet) onto
                     BundleSkuCard's infoItems prop — no separate binding needed. -->
                <BundleSkuCard
                  v-for="(item, i) in sub.items"
                  :key="i"
                  v-bind="item"
                  :base-delay="baseDelay + si * 80 + i * 120"
                />
              </BundleGrid>
            </div>

            <!-- ── SKU subcategory with an image-led card variant ───────── -->
            <div v-else-if="sub.cardType === 'sku' && sub.cardVariant" class="cat-catalog__content">
              <CategoryBanner v-if="sub.promo" v-bind="sub.promo" />
              <h2 v-else class="cat-catalog__heading text-style-heading-banner">
                {{ sub.label }}
              </h2>
              <div class="cat-catalog__sku-grid">
                <SkuImageCard
                  v-for="(item, i) in sub.items"
                  :key="i"
                  :amount="item.amount"
                  :currency-label="item.currencyLabel"
                  :subtitle="item.subtitle"
                  :background-image="cardVariant === 'prod' ? null : (sub.skuCardBg ?? null)"
                  :current-price="item.currentPrice"
                  :original-price="item.originalPrice ?? null"
                  :discount-percent="item.discountPercent ?? null"
                  :loyalty-points="item.loyaltyPoints ?? null"
                  :loyalty-icon="loyaltyIcon"
                  :sku-image="item.skuImage"
                  :info-items="item.infoItems ?? null"
                  :variant="cardVariant ?? sub.cardVariant"
                  :base-delay="baseDelay + si * 80"
                  :anim-delay="i * 90"
                />
              </div>
            </div>

            <!-- ── SKU subcategory (SkuCard content deferred) ───────────── -->
            <div v-else class="cat-catalog__content cat-catalog__content--stub">
              <CategoryBanner v-if="sub.promo" v-bind="sub.promo" />
              <h2 v-else class="cat-catalog__heading text-style-heading-banner">
                {{ sub.label }}
              </h2>
              <!-- SKU card designs are per-category and will be implemented
                   once the final designs are provided. -->
              <p class="cat-catalog__stub-note text-style-utility-label-regular">
                Coming soon
              </p>
            </div>

          </Span>
        </Grid>
      </section>
      </template>

      <Grid v-if="showCategoryJumpNav" class="cat-catalog__jump-nav-grid" :class="{ 'cat-catalog__jump-nav-grid--prod': cardVariant === 'prod' }">
        <Span size="content">
          <CategoryJumpNav
            :categories="categories"
            :current-id="activeSubcategoryId ?? category.id"
            :mode="jumpNavMode"
            @select="emit('select-category', $event)"
          />
        </Span>
      </Grid>
    </div>
  </Transition>
</template>

<style scoped>
/*
 * Category cross-fade — longhands required: --motion-sys-ease-* tokens contain
 * commas (cubic-bezier) so the animation shorthand would be invalid.
 */
.cat-catalog-enter-active {
  animation-name: cat-fade-in;
  animation-duration: var(--x-motion-sys-duration-base);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: both;
}
.cat-catalog-leave-active {
  animation-name: cat-fade-out;
  animation-duration: var(--x-motion-sys-duration-exit);
  animation-timing-function: var(--x-motion-sys-ease-accelerate);
  animation-fill-mode: both;
}

@keyframes cat-fade-in {
  from { opacity: 0; transform: translateY(var(--x-motion-sys-distance-md)); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes cat-fade-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}

/* Each subcategory section mirrors the .section / .section--divided rhythm
   already used in App.vue — same padding / border tokens. */
.cat-catalog__section {
  padding-top: var(--x-pad-surface-l);
  padding-bottom: var(--x-pad-surface-xl);
  border-bottom: var(--border-weight-default) solid var(--x-border-divider);
  /* Clear whatever nav surface is docked above the content on tap-scroll. In the
     legacy nav model that's just the top subcategory bar (~52px, kept as the
     fallback below); the multi-level nav stack (CatalogNavStack) publishes its
     own live height as --nav-stack-h, which wins once it mounts. */
  scroll-margin-top: calc(var(--safe-top, 0px) + var(--nav-stack-h, 52px));
}
.cat-catalog__section:last-child {
  border-bottom: none;
}

/* Remove dividers at M/L — matches App.vue's responsive rule */
@container (min-width: 801px) {
  .cat-catalog__section {
    border-bottom: none;
  }
}

.cat-catalog__content {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
  width: 100%;
}

.cat-catalog__heading {
  margin: 0;
  color: var(--x-text-header-default);
  text-transform: uppercase;
}

/* SKU card grid — 2-up on XS, 4-up from the S breakpoint (mirrors SkuList).
   Container queries resolve against .device__screen (container-type: inline-size). */
.cat-catalog__sku-grid {
  display: grid;
  gap: var(--x-gap-content-default);
  grid-template-columns: repeat(2, 1fr);
  padding-block: var(--x-motion-sys-distance-sm);
}
@container (min-width: 641px) {
  .cat-catalog__sku-grid { grid-template-columns: repeat(4, 1fr); }
}

/* Stub placeholder — muted note while SkuCard designs are pending */
.cat-catalog__content--stub {
  gap: var(--x-gap-content-narrow);
  align-items: center;
  text-align: center;
}

.cat-catalog__stub-note {
  margin: 0;
  color: var(--x-text-body-soft);
}

/* End-of-category jump-nav gap — new design (default) gets more breathing
   room than current/prod's tighter rhythm (matches .cat-catalog__section's
   own --x-pad-surface-xl bottom padding elsewhere in this file). */
.cat-catalog__jump-nav-grid {
  padding-bottom: var(--x-pad-surface-xxl);
}
.cat-catalog__jump-nav-grid--prod {
  padding-bottom: var(--x-pad-surface-xl);
}
</style>
