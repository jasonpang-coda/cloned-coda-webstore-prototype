<script setup>
import MaterialIcon from './MaterialIcon.vue'
import StoreBadges from './StoreBadges.vue'

defineProps({
  heading: { type: String, required: true },
  body: { type: String, default: null },
  /** Background art URL (config-supplied). Omit for a plain scrim background. */
  bgImage: { type: String, default: null },
  /** Suppress the in-banner store badges — a store may render them elsewhere
      (e.g. above the value-prop grid) via a standalone <StoreBadges> instead. */
  hideBadges: { type: Boolean, default: false },
  appStoreLabel: { type: String, default: null },
  appStoreUrl: { type: String, default: null },
  appStoreBadgeImg: { type: String, default: null },
  googlePlayLabel: { type: String, default: null },
  googlePlayUrl: { type: String, default: null },
  googlePlayBadgeImg: { type: String, default: null },
  /** PWA not-installed upsell row (strings.page.pwaInstall). */
  pwaInstalled: { type: Boolean, default: false },
  pwaInstallBody: { type: String, default: null },
  pwaInstallCta: { type: String, default: null },
  /** Web Push upsell row shown once installed (strings.page.webPush). */
  webPushBody: { type: String, default: null },
  webPushCta: { type: String, default: null },
})

defineEmits(['pwa-cta-click', 'webpush-cta-click'])
</script>

<template>
  <div
    class="download-banner"
    :data-state="[bgImage ? 'bg_image_present' : 'bg_image_absent', hideBadges ? 'badges_above_value_props' : 'badges_in_banner'].join(' ')"
    :data-token="bgImage ? '--download-banner-bg' : undefined"
    :style="bgImage ? { '--download-banner-bg': `url(${bgImage})` } : {}"
  >
    <div class="download-banner__copy">
      <h2 class="download-banner__heading text-style-heading-section">{{ heading }}</h2>
      <p v-if="body" class="download-banner__body text-style-paragraph-regular">{{ body }}</p>

      <!-- PWA install / Web Push upsell CTA — own prominent row, shimmer
           primary button, deliberately outranking the plain app badges
           below it. Not installed: emits pwa-cta-click (App.vue opens
           TaskGiftSheet). Installed but not subscribed: swaps to a Web
           Push opt-in CTA (emits webpush-cta-click). -->
      <div v-if="pwaInstallCta && !pwaInstalled" class="download-banner__pwa" data-state="pwa_row_visible">
        <p v-if="pwaInstallBody" class="download-banner__pwa-copy text-style-utility-default-regular">{{ pwaInstallBody }}</p>
        <button
          v-ripple v-haptic
          type="button"
          class="download-banner__pwa-cta fx-shimmer fx-shimmer--metal-gloss"
          data-poi="download-banner-pwa-cta"
          @click="$emit('pwa-cta-click')"
        >
          <MaterialIcon name="install_mobile" variant="round" :size="20" />
          <span class="text-style-utility-default-uppercase">{{ pwaInstallCta }}</span>
        </button>
      </div>
      <div v-else-if="pwaInstalled && webPushCta" class="download-banner__pwa" data-state="webpush_row_visible">
        <p v-if="webPushBody" class="download-banner__pwa-copy text-style-utility-default-regular">{{ webPushBody }}</p>
        <button
          v-ripple v-haptic
          type="button"
          class="download-banner__pwa-cta fx-shimmer fx-shimmer--metal-gloss"
          data-poi="download-banner-webpush-cta"
          @click="$emit('webpush-cta-click')"
        >
          <MaterialIcon name="notifications" variant="round" :size="20" />
          <span class="text-style-utility-default-uppercase">{{ webPushCta }}</span>
        </button>
      </div>

      <div v-if="!hideBadges && (appStoreLabel || googlePlayLabel)" class="download-banner__badges">
        <StoreBadges
          :app-store-label="appStoreLabel"
          :app-store-url="appStoreUrl"
          :app-store-badge-img="appStoreBadgeImg"
          :google-play-label="googlePlayLabel"
          :google-play-url="googlePlayUrl"
          :google-play-badge-img="googlePlayBadgeImg"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* A real containerized banner — background art (config-supplied) with
   heading/body/badges all inside the ONE box, scrimmed for legibility. No
   size token family exists yet for a hero-banner aspect, so this states its
   own min-height directly (flagged here rather than reusing an unrelated
   spacing token). */
.download-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  padding: var(--x-pad-surface-xl) var(--x-pad-surface-l);
  border-radius: var(--x-radius-container-l);
  /* Optional per-store escape hatch, same precedent as CategoryBanner's
     --x-category-banner-border — no border by default (every existing
     store), a store can add one via html[data-theme] without a component
     edit. */
  border: var(--x-download-banner-border, none);
  text-align: center;
  background:
    var(--x-gradient-download-banner-scrim),
    var(--download-banner-bg, none) center / cover no-repeat;
}
@container (min-width: 641px) {
  .download-banner { min-height: 320px; }
}
.download-banner__copy {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  max-width: 60ch;
}
.download-banner__heading {
  margin: 0;
  color: var(--x-text-header-default);
  /* Centred text needs a centred condense transform-origin too — the
     .text-style-* default (left center) squeezes the scaleX from the left
     edge, which visibly drags a centered heading off-center. */
  transform-origin: center center;
}
.download-banner__body {
  margin: 0;
  /* Pulls the description up closer to the heading — was the full
     --x-gap-content-default (8px) inherited from the parent's flex gap;
     capped at a tight-but-not-touching 2px (not a larger reduction, which
     would start overlapping the heading's own descenders). */
  margin-top: calc(var(--x-gap-content-tight) - var(--x-gap-content-default));
  color: var(--x-text-body-default);
  transform-origin: center center;
}
.download-banner__badges {
  /* Total gap from the install button above = the parent's own flex `gap`
     (--x-gap-content-default, 8px) + this margin — bumped so the combined
     space lands at a full 16px (--x-gap-content-separation). */
  margin-top: calc(var(--x-gap-content-separation) - var(--x-gap-content-default));
}

/* PWA install row — the visually dominant action in this banner (own solid
   shimmer pill) vs. the plain app badges below it, which keep their existing
   subdued treatment unchanged. Shimmer recipe copied verbatim from
   BuyNowBar.vue's .buynow__cta--buy (see .claude/skills/material-fx). */
.download-banner__pwa {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Gap between the descriptive copy and the install CTA — bumped to a full
     12px (--x-gap-content-loose) per request, up from the narrow 4px other
     stacked-copy gaps use. */
  gap: var(--x-gap-content-loose);
  margin-top: var(--x-gap-content-narrow);
}
.download-banner__pwa-copy {
  margin: 0;
  color: var(--x-text-body-default);
}
.download-banner__pwa-cta {
  display: inline-flex;
  align-items: center;
  gap: var(--x-gap-control-m);
  height: var(--x-size-control-m);
  padding: 0 var(--x-pad-surface-l);
  border: 0;
  border-radius: var(--x-radius-control-full);
  cursor: pointer;
  background: var(--x-bg-action-primary);
  color: var(--x-text-on-primary);
  --x-fx-ripple-color: var(--x-fx-ripple-color-dark);
  --x-material-metal-gloss-shimmer-core: var(--x-bg-action-primary);
  transition: filter var(--x-motion-sku-hover);
}
.download-banner__pwa-cta:hover { filter: brightness(1.05); }
</style>
