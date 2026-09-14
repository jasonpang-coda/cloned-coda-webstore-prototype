/**
 * Per-site handoff configuration — the ONE file that varies between handoff
 * sites. Everything else (.vitepress/, scripts/) is generic kit code; update it
 * via `node ../_handoff-kit/create-handoff.mjs --update <slug>`, never by hand.
 *
 * Consumed by:
 *  - scripts/sync-tokens.mjs   → vendor manifest (what to copy from the prototype)
 *  - .vitepress/config.mjs     → title / description / nav / sidebar
 *  - TokenSandbox.vue          → tokenCatalog (sliders + easing selects)
 */
export default {
  title: '{{TITLE}} Handoff',
  description: 'Interactive spec for {{TITLE}}',

  // Nav + sidebar entries after the implicit { Overview → / }. Link names map
  // to the markdown files in this folder (spec docs from web-store-spec-handoff).
  pages: [
    { text: 'Flow Spec', link: '/README' },
    // TODO: add the other spec docs, then end with the playground:
    // { text: 'Motion Tokens', link: '/motion-tokens' },
    { text: 'Playground', link: '/playground' },
  ],

  // What sync-tokens.mjs vendors from the prototype (paths relative to roots).
  // Order of `tokens` IS the CSS cascade order — theme file first (@font-face +
  // --sys-* roles), then DS tiers, then motion/effects.
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
    // Rewrites applied to a vendored token file (by basename). codm.css points
    // @font-face at the prototype's font folder; vendored fonts live at ../fonts/.
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
      // TODO: demo assets the playground needs, e.g. 'slide-kui-ji-portrait.jpg'
    ],
  },

  // Tokens TokenSandbox exposes for live editing. Durations render as range
  // sliders; easings as cubic-bezier selects. Take these from the spec's token
  // reference table — only the tokens the feature actually consumes.
  tokenCatalog: {
    durations: [
      // TODO e.g. { name: '--motion-duration-slow', label: 'Entrance', min: 150, max: 800, step: 10 },
    ],
    easings: [
      // TODO e.g. { name: '--motion-ease-standard', label: 'Standard' },
    ],
  },
}
