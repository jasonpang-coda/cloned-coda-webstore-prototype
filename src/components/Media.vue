<script setup>
import { computed } from 'vue'

/**
 * Media — renders a still image OR a video from a single `src`, picking the
 * element by file extension. Lets banner / SKU art carry rich media (mp4, webm)
 * without the consumer caring which it is. Animated webp/gif/apng just work via
 * the <img> branch.
 *
 * The consumer's class/style land on the rendered element (inheritAttrs).
 *
 * Usage:  <Media :src="bannerImage" class="bundle__banner-img" />
 */
const props = defineProps({
  /** Image or video URL */
  src: { type: String, required: true },
  /** Alt text (images only) */
  alt: { type: String, default: '' },
  /** Poster frame shown before a video paints */
  poster: { type: String, default: null },
})

const isVideo = computed(() => /\.(mp4|webm|mov)$/i.test(props.src))
</script>

<template>
  <video
    v-if="isVideo"
    :src="src"
    :poster="poster"
    autoplay
    loop
    muted
    playsinline
    preload="auto"
    disablepictureinpicture
  ></video>
  <img v-else :src="src" :alt="alt" loading="lazy" />
</template>
