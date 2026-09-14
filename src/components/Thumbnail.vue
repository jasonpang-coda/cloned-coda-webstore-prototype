<script setup>
/**
 * Thumbnail — generic square image tile (Figma "Thumbnail"). Fixed rounded
 * corners via the thumbnail radius token; size is a token-scale key
 * (`--x-size-img-<size>`) rather than a raw pixel value, so callers stay on
 * the size scale instead of inventing dimensions.
 */
defineProps({
  image: { type: String, required: true },
  alt:   { type: String, default: '' },
  /** Maps to --x-size-img-<size> (xs | s | m | l | xl | xxl). */
  size:  { type: String, default: 'xl' },
})
</script>

<template>
  <img :src="image" :alt="alt" class="thumbnail" :style="{ width: `var(--x-size-img-${size})`, height: `var(--x-size-img-${size})` }" />
</template>

<style scoped>
.thumbnail {
  display: block;
  border-radius: var(--x-radius-thumbnail-m);
  object-fit: cover;
  flex-shrink: 0;
}
</style>
