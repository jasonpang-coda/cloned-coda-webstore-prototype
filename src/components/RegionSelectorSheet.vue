<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import MaterialIcon from './MaterialIcon.vue'
import FlagTile from './FlagTile.vue'
import ListItem from './ListItem.vue'
import BaseSheet from './base/BaseSheet.vue'
import { useLocale } from '../composables/useLocale.js'

/**
 * RegionSelectorSheet — "Select Region" picker (Figma 4014:4802; typeahead
 * 4015:5635). Bottom sheet on framed devices / narrow viewports, centered
 * modal at M+ (BaseSheet chrome, 560px desktop width for the two-column
 * layout). Opened from the NavDrawer footer or the navbar switcher via
 * useLocale.
 *
 * The search input does NOT filter the continent list — matches drop down in
 * a suggestion card anchored under the input (matched substring bolded),
 * while the full grouped list stays put beneath. The search box + dropdown
 * live in BaseSheet's #pinned slot so they never scroll away with the list.
 */
defineProps({
  isMobile: { type: Boolean, default: true },
})

const { regionSelectorOpen, closeRegionSelector, marketGroups, markets, setRegion, ui } = useLocale()

const query = ref('')

/* Per-char normalisation (lowercase, diacritics stripped) keeps a 1:1 index
   mapping back to the original string, so the matched substring can be bolded
   without offset drift ("México" matches "mex"). */
function normChar (c) {
  return c.normalize('NFD')[0].toLowerCase()
}
function normalize (s) {
  return Array.from(s, normChar).join('')
}

const suggestions = computed(() => {
  const q = normalize(query.value.trim())
  if (!q) return []
  const out = []
  for (const m of markets.value) {
    const idx = normalize(m.label).indexOf(q)
    if (idx === -1) continue
    out.push({
      market: m,
      before: m.label.slice(0, idx),
      match: m.label.slice(idx, idx + q.length),
      after: m.label.slice(idx + q.length),
    })
  }
  return out
})

function pick (code) {
  setRegion(code)
  query.value = ''
  closeRegionSelector()
}

// Reset the search each time the sheet opens.
watch(regionSelectorOpen, (open) => {
  if (open) query.value = ''
})

// Escape closes the suggestion dropdown first, then the sheet. A capture-
// phase document listener runs before BaseSheet's own bubble-phase Escape
// handler (window keydown) reaches it — so when the query is non-empty we
// clear it and stopPropagation, leaving the sheet open; otherwise we let the
// event continue to BaseSheet, which closes the sheet as usual.
function onKeyCapture (e) {
  if (e.key !== 'Escape' || !query.value) return
  e.stopPropagation()
  query.value = ''
}
watch(regionSelectorOpen, (open) => {
  if (open) document.addEventListener('keydown', onKeyCapture, true)
  else document.removeEventListener('keydown', onKeyCapture, true)
})
onBeforeUnmount(() => document.removeEventListener('keydown', onKeyCapture, true))
</script>

<template>
  <BaseSheet
    :open="regionSelectorOpen"
    :is-mobile="isMobile"
    :title="ui.selectRegion"
    size-hint="tall"
    :max-width="560"
    :duration="{ enter: 350, leave: 200 }"
    data-component="locale-selector-sheets"
    :data-state="!query ? 'open-empty-query' : (suggestions.length ? 'open-typing-with-matches' : 'open-typing-no-matches')"
    @close="closeRegionSelector()"
  >
    <template #pinned>
      <div class="selector__search">
        <div class="selector__input-box">
          <input
            v-model="query"
            class="selector__input text-style-utility-label-regular"
            type="text"
            :placeholder="ui.search"
            :aria-label="ui.search"
          />
          <MaterialIcon name="search" variant="round" :size="20" class="selector__input-icon" />
        </div>

        <div v-if="suggestions.length" class="selector__results">
          <ListItem
            v-for="s in suggestions"
            :key="s.market.code"
            class="selector__result"
            dir="auto"
            @click="pick(s.market.code)"
          >
            <template #icon><FlagTile :code="s.market.code" :width="20" /></template>
            {{ s.before }}<b>{{ s.match }}</b>{{ s.after }}
          </ListItem>
        </div>
      </div>
    </template>

    <template #body-overlay>
      <!-- Small permanent scrim over the top of the scrolling list — it
           visually reads as a continuation of the pinned search box above,
           so this always shows, unlike BaseSheet's bottom scrim which only
           shows while scrollable. -->
      <div class="selector__search-fade" aria-hidden="true"></div>
    </template>

    <div class="selector__list" data-poi="region-list">
      <section v-for="(g, gi) in marketGroups" :key="g.group" class="selector__group">
        <h3 class="selector__group-title text-style-heading-card">{{ g.group }}</h3>
        <ListItem
          v-for="(m, mi) in g.markets"
          :key="m.code"
          class="selector__row"
          dir="auto"
          :data-poi="gi === 0 && mi === 0 ? 'region-row' : null"
          @click="pick(m.code)"
        >{{ m.label }}</ListItem>
      </section>
    </div>
  </BaseSheet>
</template>

<style scoped>
/* Search — fixed above the scrolling list so the dropdown anchors to it. */
.selector__search {
  position: relative;
  flex-shrink: 0;
  padding: var(--x-pad-surface-m) var(--x-pad-surface-m) 0;
  /* Gap before the list/scrim below. Lives here (not on the body-wrap) so the
     search-fade — anchored below this pinned block — starts after this gap
     rather than overlapping the search box. */
  margin-bottom: var(--x-gap-content-default);
  z-index: 1; /* dropdown paints over the list below */
}
.selector__input-box {
  position: relative;
  display: flex;
  align-items: center;
}
.selector__input {
  width: 100%;
  height: 40px;
  padding: var(--x-pad-surface-s);
  padding-right: calc(var(--x-pad-surface-s) + var(--x-size-icon-m) + var(--x-gap-content-default));
  border: var(--border-weight-default) solid var(--x-border-input-default);
  border-radius: var(--x-radius-input-m);
  background: var(--x-bg-input-default);
  color: var(--x-text-body-default);
  outline: none;
  transition: border-color var(--x-motion-sku-hover);
}
.selector__input::placeholder { color: var(--x-text-placeholder); }
.selector__input:focus { border-color: var(--x-border-input-focused); }
.selector__input-icon {
  position: absolute;
  right: var(--x-pad-surface-s);
  color: var(--x-text-placeholder);
  pointer-events: none;
}

/* Typeahead suggestion card — floats under the input, above the list. */
.selector__results {
  position: absolute;
  left: var(--x-pad-surface-m);
  right: var(--x-pad-surface-m);
  top: calc(100% + var(--x-gap-content-narrow));
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  padding: var(--x-pad-surface-s);
  border: var(--border-weight-default) solid var(--x-border-card-default);
  border-radius: var(--x-radius-input-m);
  background-image: var(--x-bg-card-default);
  background-color: var(--x-bg-page);
  box-shadow: var(--x-shadow-sheet);
  max-height: 240px;
  overflow-y: auto;
}
.selector__result {
  --li-radius: var(--x-radius-container-s);
  --li-bg-hover: var(--x-bg-indicator-neutral-default);
  --li-color-hover: var(--x-text-body-default);
}

/* Small permanent scrim under the search box — reuses the same
   --x-gradient-scroll-fade-bottom token as the bottom scrim, flipped
   (scaleY(-1)) so it darkens at the TOP of the strip (flush with the search
   box, which behaves like a sticky header) fading down into the list, rather
   than the bottom-scrim's opposite orientation. Always visible — search stays
   in view regardless of scroll, so unlike the bottom scrim this isn't gated
   on useBottomFade. */
.selector__search-fade {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: calc(var(--x-size-img-xl) / 2);
  pointer-events: none;
  background: var(--x-gradient-scroll-fade-bottom);
  transform: scaleY(-1);
}

/* Continent columns — CSS multi-column so groups flow to fill (Figma two-col). */
.selector__list {
  columns: 2;
  column-gap: var(--x-pad-surface-l);
}
.selector__group {
  break-inside: avoid;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--x-gap-content-loose);
  padding-bottom: var(--x-gap-content-separation, 16px);
}
.selector__group-title {
  margin: 0;
  color: var(--x-text-header-default);
}
.selector__row {
  --li-padding: 0;
}
</style>
