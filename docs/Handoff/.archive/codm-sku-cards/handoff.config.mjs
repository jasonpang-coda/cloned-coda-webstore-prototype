/**
 * Per-site handoff configuration for the COD:M SKU Cards interactive handoff.
 * The ONE file that varies per site — everything in .vitepress/ and scripts/
 * is generic kit code.
 *
 * This is the SCOPED-DOWN sibling of ../sku-cards: just the component reference
 * and the playground. The full deep-dive (flow spec, motion/haptic/typography
 * catalogues) lives in ../sku-cards.
 *
 * Consumed by:
 *  - scripts/sync-tokens.mjs   → vendor manifest (what to copy from the prototype)
 *  - .vitepress/config.mjs     → title / description / nav / sidebar
 *  - TokenSandbox.vue          → tokenCatalog (sliders + easing selects)
 */
export default {
  title: 'COD:M SKU Cards',
  description:
    'Scoped implementation handoff for the COD:M SKU-card family — SkuCard, SkuImageCard, HeroSkuCard, BestSellerCard, BundleSkuCard, GiftSkuCard. Component reference plus a live playground wired to the real prototype tokens.',

  pages: [
    { text: 'Components', link: '/components' },
    { text: 'Playground', link: '/playground' },
  ],

  // The full 11-file cascade — the card demos use real colour, space, typography,
  // shadow, keyframes and the .fx-* effect classes. Order IS the CSS cascade order.
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
    // The demos draw their art with CSS gradients (no real .webp assets), so the
    // site stays self-contained with zero image-path fragility.
    images: [],
  },

  // The SKU motion tokens the cards actually consume — exposed as live sliders /
  // easing selects.
  tokenCatalog: {
    durations: [
      { name: '--motion-sys-duration-slow', label: 'Card entrance / price reveal', min: 100, max: 800, step: 10 },
      { name: '--motion-sys-duration-base', label: 'Select / bg transition',       min: 100, max: 600, step: 10 },
      { name: '--motion-sys-duration-fast', label: 'Hover return',                 min: 50,  max: 400, step: 10 },
      { name: '--motion-border-spin',       label: 'Conic border period',          min: 800, max: 6000, step: 100 },
      { name: '--motion-sku-bloom',         label: 'Bloom breathe period',         min: 1000, max: 6000, step: 100 },
    ],
    easings: [
      { name: '--motion-sys-ease-decelerate', label: 'Decelerate (entrances)' },
      { name: '--motion-sys-ease-standard',   label: 'Standard (hover / select)' },
      { name: '--motion-sys-ease-spring',     label: 'Spring (badge pop)' },
    ],
  },
}
