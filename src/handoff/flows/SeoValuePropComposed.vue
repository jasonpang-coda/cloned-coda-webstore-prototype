<script setup>
/**
 * SeoValuePropComposed — handoff-only live render of the SEO value-prop
 * section. There is no extracted component for this feature in the real
 * app — it's inline markup in src/App.vue (lines ~2190-2270 for the
 * value-prop section, ~2366-2379 for the FAQ section, shared CSS at
 * ~2712-2908), gated purely on `strings.page.seo` presence and shared by
 * every store's template. TokenContract.vue's ComponentStage only renders
 * when a flow entry declares a `component`, so without this wrapper the
 * Components tab could only show the token table, never the actual section.
 *
 * Reads the REAL live `useStoreStrings()`/`useStoreAssets()` (same
 * composables App.vue itself uses) rather than fabricated sample data — so
 * it responds correctly to TokenContract's own theme switcher: pick ZZZ or
 * Diablo Immortal (the only two stores with `strings.page.seo` populated
 * today) to see the real section; any other theme correctly renders the
 * "absent" state, which is itself one of this flow's declared states
 * (value_prop_absent), not a bug.
 *
 * Markup + CSS below are a deliberate MIRROR of the cited App.vue lines,
 * not a second source of truth — this file exists only because App.vue's
 * version is scoped to that SFC and can't be reused elsewhere. Never
 * treated as authoritative; if the real markup changes, this should be
 * updated to match (the flow's own `source` citations remain the
 * authoritative reference for a production port).
 */
import { computed } from 'vue'
import Grid from '../../components/Grid.vue'
import Span from '../../components/Span.vue'
import MaterialIcon from '../../components/MaterialIcon.vue'
import HomeFaq from '../../components/home/HomeFaq.vue'
import { useStoreStrings } from '../../composables/useStoreStrings.js'
import { useStoreAssets } from '../../composables/useStoreAssets.js'

const strings = useStoreStrings()
const assets = useStoreAssets()

const seo = computed(() => strings.value.page?.seo)
const seoTile = computed(() => assets.value?.content?.seoTile)
const tileStyle = computed(() => (seoTile.value ? { '--seo-bg-tile': `url(${seoTile.value})` } : {}))
</script>

<template>
  <div v-if="seo" class="seo-composed">
    <section class="section section--seo" :style="tileStyle">
      <div v-if="seoTile" class="section__bg section__bg--tile" aria-hidden="true">
        <div class="section__bg-scrim section__bg-scrim--light" />
      </div>
      <Grid>
        <Span size="content">
          <div class="seo-content">
            <h2 class="seo-content__heading text-style-heading-page-title">{{ seo.heading }}</h2>
            <div class="seo-content__body text-style-paragraph-regular" v-html="seo.body"></div>

            <div v-if="seo.benefits?.length" class="seo-benefits">
              <h3 class="seo-benefits__heading text-style-heading-section">{{ seo.benefitsHeading }}</h3>
              <p v-if="seo.benefitsDesc" class="seo-benefits__desc text-style-paragraph-regular">{{ seo.benefitsDesc }}</p>
              <div class="seo-benefits__grid">
                <div v-for="b in seo.benefits" :key="b.title" class="seo-benefit">
                  <div class="seo-benefit__icon">
                    <MaterialIcon :name="b.icon" variant="round" :size="28" />
                  </div>
                  <div class="seo-benefit__body">
                    <h4 class="seo-benefit__title text-style-heading-card">{{ b.title }}</h4>
                    <p class="seo-benefit__desc text-style-paragraph-small">{{ b.desc }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Span>
      </Grid>
    </section>

    <section v-if="seo.faq?.length" class="section section--divided section--seo" :style="tileStyle">
      <div v-if="seoTile" class="section__bg section__bg--tile" aria-hidden="true">
        <div class="section__bg-scrim section__bg-scrim--light" />
      </div>
      <Grid>
        <Span size="content">
          <HomeFaq :faq="seo.faq" layout="grid" />
        </Span>
      </Grid>
    </section>
  </div>
  <p v-else class="seo-composed__absent">
    <code>strings.page.seo</code> is not set for the current live-render theme — pick <strong>ZZZ</strong> or <strong>Diablo Immortal</strong> above to preview this section (every other store correctly renders nothing here — see <code>value_prop_absent</code> in the States tab).
  </p>
</template>

<style scoped>
.seo-composed__absent {
  padding: var(--x-pad-surface-l);
  color: var(--x-text-body-subtle);
  text-align: center;
}
.seo-composed__absent code { font-family: monospace; }

/* Everything below mirrors src/App.vue's .section / .section--divided /
   .section__bg* / .seo-* rules verbatim (see file header for line refs). */
.section {
  padding-top: var(--x-pad-surface-l);
  padding-bottom: var(--x-pad-surface-xl);
}
.section--divided {
  border-bottom: var(--border-weight-default) solid var(--x-border-divider);
}
.section--seo {
  position: relative;
  --x-home-surface-border: var(--x-border-card-default);
}
.section--seo :deep(.ce-grid) {
  position: relative;
  z-index: 1;
}
.section__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.section__bg--tile {
  background: var(--seo-bg-tile, none) repeat;
}
.section__bg-scrim {
  position: absolute;
  inset: 0;
}
.section__bg-scrim--light {
  background: var(--x-scrim-strong);
}
.seo-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-loose);
  text-align: center;
}
.seo-content__heading {
  margin: 0;
  color: var(--x-text-header-default);
  max-width: 44ch;
  transform-origin: center center;
}
.seo-content__body {
  margin: 0;
  color: var(--x-text-body-default);
  max-width: 90ch;
  text-align: left;
}
.seo-content__body :deep(p) { margin: 0 0 var(--x-gap-content-default) 0; }
.seo-content__body :deep(p:last-child) { margin-bottom: 0; }
.seo-content__body :deep(strong) {
  color: var(--x-text-header-default);
  font-weight: 700;
}
.seo-benefits {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  width: 100%;
  text-align: left;
  margin: var(--x-gap-content-separation) 0;
}
.seo-benefits__heading { margin: 0; color: var(--x-text-header-default); }
.seo-benefits__desc { margin: 0; color: var(--x-text-body-soft); max-width: 90ch; }
.seo-benefits__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--x-gap-content-loose);
  margin-top: var(--x-gap-content-narrow);
}
@container (min-width: 641px) {
  .seo-benefits__grid {
    grid-template-columns: repeat(2, 1fr);
    column-gap: var(--x-gap-content-separation);
  }
}
.seo-benefit { display: flex; align-items: flex-start; gap: var(--x-gap-content-default); }
.seo-benefit__icon {
  flex-shrink: 0;
  width: var(--x-size-img-xl);
  height: var(--x-size-img-xl);
  border-radius: var(--x-radius-circle);
  background: var(--x-bg-indicator-neutral-subtle);
  color: var(--x-text-header-default);
  display: flex;
  align-items: center;
  justify-content: center;
}
.seo-benefit__body { display: flex; flex-direction: column; gap: var(--x-gap-content-tight); min-width: 0; }
.seo-benefit__title { margin: 0; color: var(--x-text-header-default); }
.seo-benefit__desc { margin: 0; color: var(--x-text-body-soft); }
</style>
