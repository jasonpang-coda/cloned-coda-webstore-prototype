<script setup>
import TitleRail from './TitleRail.vue'

/**
 * HomePublisherSpotlight — the "sellable slot" merchandising panel (PM
 * feedback: highlight one brand/publisher and its titles, e.g. HoYoverse →
 * Genshin Impact, Honkai: Star Rail). A single fixed indigo/violet panel
 * (--x-gradient-home-spotlight, Codashop-only theme token) regardless of
 * layout, same reasoning as HomePayments' own fixed coral panel: everything
 * else on the homepage tracks --home-surface-* (inert on Standard, frosted
 * on Visual), so this section needs its OWN colour to read as a distinct
 * "featured" slot in both layouts, not just another content section.
 *
 * .fx-bloom (src/tokens/effects.css) reused as-is for the ambient halo, same
 * as HomePayments — --x-fx-bloom-image points at the spotlight-specific glow
 * token so it matches this panel's own tones.
 *
 * The logo is the publisher's OWN game logo (there's no umbrella publisher
 * wordmark asset in this store's asset set), rendered in a frosted chip for
 * contrast against the gradient — same chip treatment as HomePayments' icons.
 */
defineProps({
  heading: { type: String, default: '' },
  sub: { type: String, default: '' },
  logo: { type: String, default: null },
  logoAlt: { type: String, default: '' },
  titles: { type: Array, default: () => [] },
})
defineEmits(['open-title'])
</script>

<template>
  <div class="home-spotlight fx-bloom">
    <div class="home-spotlight__head">
      <span v-if="logo" class="home-spotlight__logo-chip">
        <img :src="logo" :alt="logoAlt" class="home-spotlight__logo" />
      </span>
      <div>
        <h3 class="home-spotlight__heading text-style-heading-card">{{ heading }}</h3>
        <p class="home-spotlight__sub text-style-paragraph-small">{{ sub }}</p>
      </div>
    </div>
    <TitleRail :titles="titles" variant="visual" @open-title="$emit('open-title')" />
  </div>
</template>


<style scoped>
.home-spotlight {
  position: relative;
  padding: var(--x-pad-surface-l) 0;
  border-radius: var(--x-radius-container-s);
  background: var(--x-gradient-home-spotlight, var(--x-bg-card-subtle));
  overflow: hidden;
  --x-fx-bloom-image: var(--x-glow-home-spotlight);
}
.home-spotlight__head {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  padding: 0 var(--x-pad-surface-l);
  margin-bottom: var(--x-gap-content-default);
}
.home-spotlight__logo-chip {
  flex: 0 0 auto;
  width: var(--x-size-control-xl);
  height: var(--x-size-control-xl);
  display: grid;
  place-items: center;
  border-radius: var(--x-radius-control-full);
  background: var(--x-surface-frost-hover);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.home-spotlight__logo {
  height: var(--x-size-icon-l);
  width: var(--x-size-icon-l);
  object-fit: contain;
}
.home-spotlight__heading {
  display: block;
  margin: 0;
  color: var(--x-text-header-inverse);
}
.home-spotlight__sub {
  display: block;
  margin: 2px 0 0;
  color: var(--x-text-body-inverse);
}
/* The rail's own scroll-inset padding is sized for a full-bleed section, not
   a card that already has its own outer padding — cancel this card's inline
   padding at the rail so titles still start flush with the heading above,
   and the rail can still scroll its last item flush to the card's edge. */
.home-spotlight :deep(.title-rail) {
  padding-inline: var(--x-pad-surface-l);
  scroll-padding-inline: var(--x-pad-surface-l);
}
</style>
