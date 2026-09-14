/**
 * Per-site handoff configuration — the ONE file that varies between handoff
 * sites. Everything else (.vitepress/, scripts/) is generic kit code; update it
 * via `node ../_handoff-kit/create-handoff.mjs --update carousel-story-interaction`.
 *
 * Consumed by:
 *  - scripts/sync-tokens.mjs   → vendor manifest (what to copy from the prototype)
 *  - .vitepress/config.mjs     → title / description / nav / sidebar
 *  - TokenSandbox.vue          → tokenCatalog (sliders + easing selects)
 */
export default {
  title: 'COD:M Story Carousel Handoff',
  description: 'Interactive interaction + motion spec for the COD:M StoryCarousel',

  pages: [
    { text: 'Flow Spec', link: '/README' },
    { text: 'Motion Tokens', link: '/motion-tokens' },
    { text: 'Typography', link: '/typography' },
    { text: 'Components', link: '/component-breakdown' },
    { text: 'Playground', link: '/playground' },
  ],

  vendor: {
    roots: {
      tokens: 'src/tokens',
      fonts: 'src/stores/codm/fonts',
      images: 'src/stores/codm/img/content',
    },
    tokens: [
      'ds/themes/codm.css',
      'ds/system.css',
      'ds/semantics.css',
      'ds/space.css',
      'ds/text-styles.css',
      'ds/extensions.css',
      'motion.css',
      'motion-sku.css',
      'keyframes.css',
      'effects.css',
      'reduced-motion.css',
    ],
    urlRewrites: [
      { in: 'codm.css', from: '../../../stores/codm/fonts/', to: '../fonts/' },
    ],
    fonts: [
      'HitmarkerNormal-Light.woff2', 'HitmarkerNormal-Light.woff',
      'HitmarkerNormal-Regular.woff2', 'HitmarkerNormal-Regular.woff',
      'HitmarkerNormal-Medium.woff2', 'HitmarkerNormal-Medium.woff',
      'HitmarkerNormal-Bold.woff2', 'HitmarkerNormal-Bold.woff',
      'HitmarkerNormal-Black.woff2', 'HitmarkerNormal-Black.woff',
    ],
    images: [
      'slide-kui-ji-portrait.jpg', 'slide-kui-ji-landscape.jpg',
      'slide-the-boys-portrait.jpg', 'slide-the-boys-landscape.jpg',
    ],
  },

  tokenCatalog: {
    durations: [
      { name: '--motion-sku-story', label: 'Slide interval', min: 2000, max: 8000, step: 250 },
      { name: '--motion-sku-story-fade', label: 'Crossfade', min: 100, max: 800, step: 25 },
      { name: '--motion-duration-slow', label: 'Entrance', min: 150, max: 800, step: 10 },
    ],
    easings: [
      { name: '--motion-ease-standard', label: 'Standard' },
      { name: '--motion-ease-decelerate', label: 'Decelerate' },
      { name: '--motion-ease-accelerate', label: 'Accelerate' },
      { name: '--motion-ease-spring', label: 'Spring' },
      { name: '--motion-ease-linear', label: 'Linear' },
    ],
  },
}
