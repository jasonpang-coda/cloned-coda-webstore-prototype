<script setup>
import { ref, computed } from 'vue'
import AccordionHeader from '../AccordionHeader.vue'
import AccordionPanel from '../AccordionPanel.vue'

/**
 * HomeFaq — accordion list. Mirrors ItemSummaryAccordion.vue's sanctioned
 * pattern exactly: a single `expand_more` icon rotating 180° in place
 * (transform + --x-motion-accordion), and the grid-template-rows 0fr→1fr
 * height transition (not <details>, which can't animate its own open/close
 * height without extra JS) — same motion the rest of the app already uses
 * for every other accordion (FAQ, order-summary detail rows, nav groups).
 *
 * `layout="grid"` switches the M+ arrangement from a single stacked column
 * to a 3-columns-per-row grid (Diablo Immortal's SEO-content FAQ) — default
 * `"stack"` keeps every other usage (the Codashop aggregator homepage)
 * unchanged.
 */
const props = defineProps({
  faq: { type: Array, default: () => [] }, // [{ q, a }]
  layout: { type: String, default: 'stack' }, // 'stack' | 'grid'
})

const openIndex = ref(-1) // all collapsed by default
function toggle (i) {
  openIndex.value = openIndex.value === i ? -1 : i
}

// Fixed 3-per-row (not auto-fit off container width — a short list would
// otherwise drop to 2 columns whenever the actual content span happens to
// sit under ~736px, e.g. right at the 801px container-query breakpoint,
// not only when it genuinely has fewer than 3 items). min(3, count) still
// stretches a short list (COD:M's 2-item FAQ) to fill the row edge-to-edge,
// since every track is 1fr — it just does so deterministically off the
// item count, not the incidental container width.
const gridCols = computed(() => Math.min(3, props.faq.length) || 1)
</script>

<template>
  <div
    class="home-faq"
    :class="{ 'home-faq--grid': layout === 'grid' }"
    :style="layout === 'grid' ? { '--home-faq-cols': gridCols } : {}"
  >
    <div v-for="(item, i) in faq" :key="item.q" class="home-faq__item" :class="{ 'is-open': openIndex === i }">
      <AccordionHeader :open="openIndex === i" class="home-faq__q" @click="toggle(i)">{{ item.q }}</AccordionHeader>
      <AccordionPanel :open="openIndex === i" class="home-faq__detail">
        <p class="home-faq__a text-style-paragraph-small">{{ item.a }}</p>
      </AccordionPanel>
    </div>
  </div>
</template>

<style scoped>
.home-faq {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
}
/* layout="grid" — min(3, item count) columns per row at the M breakpoint
   (>=801px, matching the rest of this system's container-query convention);
   stays a single stacked column below that, same as the default layout.
   --home-faq-cols (set in the script, off props.faq.length — see above) so
   a short list (e.g. COD:M's 2-item FAQ) stretches those items to fill the
   full row edge-to-edge (every track is 1fr), while a full list (ZZZ's 6)
   still wraps at exactly 3-per-row — deterministically, off the item count,
   not auto-fit's container-width-dependent track count, which could
   silently drop to 2 columns for a 6-item list too whenever the actual
   content span sits under ~736px.
   align-items:stretch (the grid default) equalises height within a row
   already; the __q min-height below additionally equalises the closed-state
   header ACROSS rows, since a CSS grid only stretches items to their own
   row's tallest, not the whole set. */
@container (min-width: 801px) {
  .home-faq--grid {
    display: grid;
    grid-template-columns: repeat(var(--home-faq-cols, 3), 1fr);
    align-items: stretch;
  }
  .home-faq--grid .home-faq__item {
    display: flex;
    flex-direction: column;
  }
  /* ~3 lines at this text-style's line-height — sized in em (type-relative,
     not an arbitrary px) so every question header reads as the same height
     regardless of how many lines its own text wraps to. */
  .home-faq--grid .home-faq__q {
    min-height: 4.5em;
  }
  .home-faq--grid .home-faq__detail {
    margin-top: auto;
  }
}

.home-faq__item {
  border-radius: var(--x-radius-container-s);
  background: var(--x-home-surface-bg, var(--x-bg-card-default));
  border: var(--border-weight-default) solid var(--x-home-surface-border, transparent);
  box-shadow: var(--x-shadow-card);
  backdrop-filter: var(--x-home-surface-blur, none);
  -webkit-backdrop-filter: var(--x-home-surface-blur, none);
  overflow: hidden;
}

.home-faq__q {
  --ah-padding: var(--x-pad-surface-m) var(--x-pad-surface-l);
  --ah-color: var(--x-home-surface-text, var(--x-text-header-default));
  --ah-chevron-color: var(--x-home-surface-text-sub, var(--x-text-body-default));
  --ah-bg-hover: var(--x-home-surface-border, var(--x-bg-tag-neutral));
  --ah-active-transform: scale(0.99);
}

/* Padding matches AccordionPanel's own default exactly — the wrapper
   already applies it, so this rule only needs the color. */
.home-faq__a {
  margin: 0;
  color: var(--x-home-surface-text-sub, var(--x-text-body-default));
}
</style>
