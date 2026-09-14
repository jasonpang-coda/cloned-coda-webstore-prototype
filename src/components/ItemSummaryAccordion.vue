<script setup>
import { ref, computed } from 'vue'
import AccordionHeader from './AccordionHeader.vue'
import AccordionPanel from './AccordionPanel.vue'
import Media from './Media.vue'

/**
 * ItemSummaryAccordion — one row of the "You will receive" list inside the Item
 * Summary sheet. Collapsed: a rarity-tinted thumb, the item name (rarity-coloured),
 * an x-quantity line, and an expand chevron. Expanded: a media container (image or
 * video, via <Media>) and a text description.
 *
 * Expand/collapse animates the grid-template-rows 0fr→1fr (the sanctioned
 * accordion height transition, --x-motion-accordion); the chevron rotates via
 * transform. Mirrors the rarity model used by BundleItem.
 */
const props = defineProps({
  /** Square thumb image src */
  image: { type: String, default: null },
  /** Display name, e.g. "GODZILLA X KONG AVATAR" */
  name: { type: String, required: true },
  /**
   * Thumb background — same format as BundleItem.tileBg: CSS gradient/colour
   * string, or a plain image URL (auto-wrapped with cover sizing). Null = neutral.
   */
  tileBg: { type: String, default: null },
  /** Quantity received, rendered as "x{quantity}" */
  quantity: { type: [Number, String], default: null },
  /** Expanded media src — image (webp/jpeg/png) or video (webm/mp4) */
  media: { type: String, default: null },
  /** Expanded text description */
  description: { type: String, default: null },
  /** Start expanded */
  defaultOpen: { type: Boolean, default: false },
  /** Compact row — hides the rarity-tinted thumb (FCM's info sheet has none;
      COD:M's "You will receive" rows keep it by default). */
  compact: { type: Boolean, default: false },
})

const open = ref(props.defaultOpen)

const _IS_URL = /^(\/|https?:|data:|blob:)|\.(?:webp|jpe?g|png|gif|svg|avif)(\?|$)/i

const thumbStyle = computed(() => {
  const bg = props.tileBg
  if (!bg) return { background: 'var(--x-rarity-gradient-neutral)' }
  if (bg.startsWith('url(') || _IS_URL.test(bg)) {
    const src = bg.startsWith('url(') ? bg : `url('${bg}')`
    return { background: `${src} center / cover no-repeat` }
  }
  return { background: bg }
})

const hasDetail = computed(() => !!(props.media || props.description))
</script>

<template>
  <div class="acc" :class="{ 'acc--open': open }">
    <AccordionHeader
      :open="open"
      :disabled="!hasDetail"
      :chevron="hasDetail"
      class="acc__head"
      @click="open = !open"
    >
      <template #content>
        <span v-if="!compact" class="acc__thumb" :style="thumbStyle">
          <img v-if="image" :src="image" alt="" class="acc__thumb-img" />
        </span>
        <span class="acc__content">
          <span class="acc__name text-style-heading-subtitle">{{ name }}</span>
          <span v-if="quantity !== null" class="acc__qty text-style-utility-default-regular">x{{ quantity }}</span>
        </span>
      </template>
    </AccordionHeader>

    <AccordionPanel :open="open" class="acc__detail">
      <div v-if="media" class="acc__media">
        <Media :src="media" class="acc__media-el" />
      </div>
      <p v-if="description" class="acc__desc text-style-paragraph-small">{{ description }}</p>
    </AccordionPanel>
  </div>
</template>

<style scoped>
.acc {
  width: 100%;
  border: var(--border-weight-default) solid var(--x-border-soft);
  border-radius: var(--x-radius-container-s);
  background: var(--x-rarity-gradient-neutral);
  overflow: hidden;
}

/* Header row — full-width, the click target */
.acc__head {
  --ah-padding: var(--x-pad-surface-s);
  --ah-chevron-color: var(--x-text-body-soft);
}

/* Rarity-tinted 48×48 thumb with the square art inside */
.acc__thumb {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--x-size-img-l);   /* 48px */
  height: var(--x-size-img-l);
  border-radius: var(--x-radius-container-xs);
  overflow: hidden;
}
.acc__thumb-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  pointer-events: none;
}

.acc__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-tight);
}
.acc__name {
  display: block;
  transform-origin: left center;
}
.acc__qty {
  color: var(--x-text-body-soft);
  transform-origin: left center;
}

/* Detail region — AccordionPanel owns the grid-rows 0fr→1fr transition;
   this file only needs to reach its inner padding + flex layout (media +
   description stacked), which differ from AccordionPanel's own defaults. */
.acc__detail :deep(.ap__pad) {
  --ap-padding: 0 var(--x-pad-surface-s) var(--x-pad-surface-s);
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
}

/* Media container — 16:9 frame, art fills it */
.acc__media {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--x-radius-container-xs);
  overflow: hidden;
  background: var(--x-bg-card-default);
}
.acc__media :deep(.acc__media-el) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.acc__desc {
  margin: 0;
  color: var(--x-text-body-default);
}
</style>
