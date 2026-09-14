<script setup>
/**
 * HomeBlobCard — the white squircle "photo + purple caption" card reused
 * across every Home Blob section (Publisher Spotlight, Picked for you,
 * Highlighted Titles, Genres rail) instead of re-authoring the same markup
 * four times. Three size profiles:
 *  - 'featured' — Highlighted Titles' 4 cards only: 64px card radius, 48/56
 *    image top/bottom radius, 24px padding, the bigger 22px/extra-bold
 *    caption, and a larger hover warp (big cards need a bigger absolute
 *    corner-radius delta for the warp to read at all).
 *  - 'panel'    — Publisher Spotlight / Picked for you: same 64/48/56
 *    radii as 'featured' but 16px padding and the regular caption size.
 *  - 'rail'     — Genres rail's small cards: 32px card radius, 20/32 image
 *    radius, 12px padding.
 * `corner-shape: squircle` layers on top of every radius below as a
 * progressive enhancement (no-op where unsupported — see
 * --x-corner-shape-home-blob's own definition in themes/codashop.css).
 */
defineProps({
  name: { type: String, required: true },
  tile: { type: String, default: null },
  size: { type: String, default: 'panel' }, // 'featured' | 'panel' | 'rail'
  /** CSS aspect-ratio for the image area, e.g. '1920 / 1080' or '1 / 1'. */
  aspect: { type: String, default: '1920 / 1080' },
  /** Wrap the caption across up to 2 lines instead of truncating with an
   * ellipsis — reserves 2-line height regardless of actual line count, so
   * every card in a row stays the same height whether its own title needed
   * 1 line or 2. Off by default (existing truncate-to-1-line behaviour). */
  wrap: { type: Boolean, default: false },
})
defineEmits(['click'])
</script>

<template>
  <button v-ripple type="button" class="home-blob-card" :class="`home-blob-card--${size}`" @click="$emit('click')">
    <span class="home-blob-card__image" :style="{ aspectRatio: aspect }">
      <img v-if="tile" :src="tile" :alt="name" class="home-blob-card__img" loading="lazy" />
    </span>
    <span
      class="home-blob-card__name"
      :class="[size === 'featured' ? 'home-blob-card__name--lg' : 'text-style-utility-default-bold', { 'home-blob-card__name--wrap': wrap }]"
    >{{ name }}</span>
  </button>
</template>

<style scoped>
.home-blob-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
  /* Dark mode pass: was neutral-0 (white). neutral-900 ("ink main") reads as
     a distinct, slightly-elevated dark surface against the page's own
     deeper neutral-1000/950 (see HomeBlob.vue's --x-home-surface-bg for the
     matching choice on the editorial-tail sections). */
  background: var(--x-palette-home-blob-neutral-900, #1a0038);
  box-shadow: var(--x-shadow-home-blob-l1);
  --card-warp: 16px; /* overridden bigger on 'featured' below */
  /* Playful bouncy hover/press, per the design pass — squash-and-stretch
     applied to the card's own corner radii (see --card-radius/--card-warp)
     instead of just scaling, so the container's SHAPE warps, not only its
     size. --x-motion-home-blob-ease-elastic is a stronger overshoot than
     this repo's shared --x-motion-sys-ease-spring — the plain spring read
     as too subtle against these cards' large radii. */
  transition:
    transform var(--x-motion-sys-duration-base) var(--x-motion-home-blob-ease-elastic),
    border-radius var(--x-motion-sys-duration-base) var(--x-motion-home-blob-ease-elastic),
    box-shadow var(--x-motion-sku-hover);
}
/* Hover only where a real pointer can hover — a touch tap would otherwise
   get "stuck" in the hover state after release (same gate TitleCard.vue's
   own cursor-tracked tilt uses). */
@media (hover: hover) and (pointer: fine) {
  .home-blob-card:hover {
    transform: translateY(-6px) scale(1.04);
    border-radius:
      calc(var(--card-radius) + var(--card-warp))
      calc(var(--card-radius) - var(--card-warp))
      calc(var(--card-radius) + var(--card-warp))
      calc(var(--card-radius) - var(--card-warp));
    box-shadow: var(--x-shadow-home-blob-l2);
  }
  /* The inner image follows the SAME diagonal warp as the card (half the
     delta — its base radii are smaller, so the full card delta would look
     disproportionate) instead of sitting static while its own frame moves
     around it. */
  .home-blob-card:hover .home-blob-card__image {
    border-radius:
      calc(var(--image-radius-top) + var(--card-warp) * 0.5)
      calc(var(--image-radius-top) - var(--card-warp) * 0.5)
      calc(var(--image-radius-bottom) + var(--card-warp) * 0.5)
      calc(var(--image-radius-bottom) - var(--card-warp) * 0.5);
  }
}
/* Press: snappy, no overshoot (the bounce belongs to the RELEASE, which
   settles back to hover/rest through the elastic transition above) —
   --x-motion-sku-press is this repo's existing 100ms/no-bounce press
   token, reused for the same "press must feel immediate" reason it's used
   for the SKU card. Squashes the opposite diagonal from hover's warp, so
   the shape reads as compressing under the tap, not just continuing to
   inflate. */
.home-blob-card:active {
  transform: scale(0.94);
  border-radius:
    calc(var(--card-radius) - var(--card-warp) * 0.75)
    calc(var(--card-radius) + var(--card-warp) * 1.25)
    calc(var(--card-radius) - var(--card-warp) * 0.75)
    calc(var(--card-radius) + var(--card-warp) * 1.25);
  transition:
    transform var(--x-motion-sku-press),
    border-radius var(--x-motion-sku-press);
}
.home-blob-card:active .home-blob-card__image {
  border-radius:
    calc(var(--image-radius-top) - var(--card-warp) * 0.375)
    calc(var(--image-radius-top) + var(--card-warp) * 0.625)
    calc(var(--image-radius-bottom) - var(--card-warp) * 0.375)
    calc(var(--image-radius-bottom) + var(--card-warp) * 0.625);
  transition: border-radius var(--x-motion-sku-press);
}

.home-blob-card--featured,
.home-blob-card--panel {
  gap: var(--x-gap-content-narrow);
  border-radius: var(--card-radius);
  corner-shape: var(--x-corner-shape-home-blob);
}
/* 24px — Figma's Highlighted Titles spec. Bigger warp too: these are the
   biggest cards on the page, and the 'panel' warp read as barely-there
   against them. */
.home-blob-card--featured {
  --card-radius: var(--x-radius-home-blob-card);
  --card-pad: var(--x-pad-surface-xl);
  padding: var(--card-pad);
  --card-warp: 28px;
}
/* Mobile: 'panel' (Spotlight / Picked for you / Highlighted Titles' row)
   matches 'rail'’s own radius/padding exactly — per design feedback every
   rail-style card should read as one consistent size on mobile instead of
   'panel' looking a step bigger than 'rail' everywhere. 'featured'
   (Highlighted Titles' hero only) is deliberately excluded — it stays a
   distinct, prominent standout element. Reset to panel's own larger 64px/
   16px values at 801px+, where each section's cards sit in their own
   distinct grid again, not a shared rail. */
.home-blob-card--panel {
  --card-radius: var(--x-radius-home-blob-rail-card);
  --card-pad: var(--x-pad-surface-m);
  padding: var(--card-pad);
}
@container (min-width: 801px) {
  .home-blob-card--panel {
    --card-radius: var(--x-radius-home-blob-card);
    --card-pad: var(--x-pad-surface-l);
    padding: var(--card-pad);
  }
}
.home-blob-card--rail {
  --card-radius: var(--x-radius-home-blob-rail-card);
  gap: var(--x-gap-content-narrow);
  /* 12px in every direction, per the design pass — NOT --x-pad-surface-s
     (8px), which read visibly tighter than intended. */
  --card-pad: var(--x-pad-surface-m);
  padding: var(--card-pad);
  border-radius: var(--card-radius);
  corner-shape: var(--x-corner-shape-home-blob);
}

.home-blob-card__image {
  display: block;
  width: 100%;
  overflow: hidden;
  background: var(--x-bg-card-subtle);
  /* Same elastic curve as the card's own border-radius transition, so the
     image's corners warp in lockstep with it rather than lagging/leading. */
  transition: border-radius var(--x-motion-sys-duration-base) var(--x-motion-home-blob-ease-elastic);
}
.home-blob-card--featured .home-blob-card__image {
  --image-radius-top: var(--x-radius-home-blob-image-top);
  --image-radius-bottom: var(--x-radius-home-blob-image-bottom);
  border-radius: var(--image-radius-top) var(--image-radius-top)
    var(--image-radius-bottom) var(--image-radius-bottom);
  corner-shape: var(--x-corner-shape-home-blob);
}
/* Mobile: matches --rail's own image radius, same reasoning as the card
   radius/padding above. Reset to panel's own larger radius at 801px+. */
.home-blob-card--panel .home-blob-card__image {
  --image-radius-top: var(--x-radius-home-blob-rail-image-top);
  --image-radius-bottom: var(--x-radius-home-blob-rail-image-bottom);
  border-radius: var(--image-radius-top) var(--image-radius-top)
    var(--image-radius-bottom) var(--image-radius-bottom);
  corner-shape: var(--x-corner-shape-home-blob);
}
@container (min-width: 801px) {
  .home-blob-card--panel .home-blob-card__image {
    --image-radius-top: var(--x-radius-home-blob-image-top);
    --image-radius-bottom: var(--x-radius-home-blob-image-bottom);
  }
}
.home-blob-card--rail .home-blob-card__image {
  --image-radius-top: var(--x-radius-home-blob-rail-image-top);
  --image-radius-bottom: var(--x-radius-home-blob-rail-image-bottom);
  border-radius: var(--image-radius-top) var(--image-radius-top)
    var(--image-radius-bottom) var(--image-radius-bottom);
  corner-shape: var(--x-corner-shape-home-blob);
}

.home-blob-card__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.home-blob-card__name {
  display: block;
  /* Dark mode pass: was the purple link accent (--x-home-blob-text-link),
     legible on the old white card; a neutral light colour reads correctly
     against the new dark card instead. */
  color: var(--x-palette-home-blob-neutral-0, #fff8fc);
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* Wrap up to 2 lines instead of truncating — reserves the full 2-line
   height regardless of whether THIS card's own title needed 1 or 2, so
   every card in a row (e.g. Picked for you's 3-up grid) ends up the same
   height even though titles vary in length. */
.home-blob-card__name--wrap {
  white-space: normal;
  overflow-wrap: break-word;
  text-overflow: clip;
  line-height: 1.3;
  min-height: calc(1.3em * 2);
}
.home-blob-card__name--lg {
  font-family: var(--x-sys-font-family-heading);
  font-size: var(--x-sys-size-h3); /* 22px, per Figma */
  font-weight: var(--x-sys-weight-extra-bold);
  letter-spacing: var(--x-sys-letter-spacing-wide);
}
</style>
