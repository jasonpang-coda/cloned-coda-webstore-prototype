import MaterialIcon from '@/components/MaterialIcon.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'material-icon',
  title: 'Material Icon',
  group: 'Atoms',
  component: MaterialIcon,
  tokens: [],
  // MaterialIcon paints via `background-color: currentColor` + a CSS mask —
  // it declares no --x-/--sys- token of its own (colour is inherited from
  // whatever text-colour token the parent sets), so this is a deliberate,
  // confirmed token-free component, not an oversight.
  tokenFree: true,
  states: ['default'],
  // A pure glyph render — no click/hover/focus affordance of its own (the
  // interactive components that USE it, e.g. NavBar/PurchaseSheet, own that).
  presentational: true,
  notes:
    'Renders a Google Material Symbol (@material-symbols/svg-400) as a CSS mask ' +
    'filled with currentColor, so it inherits text colour like a font glyph. Used ' +
    'across nearly every interactive component in the app — NavBar, NavDrawer, ' +
    'PurchaseSheet, TrustBar, InfoTag, Snackbar, BuyNowBar and dozens more — for ' +
    'chevrons, status glyphs and inline iconography. Icons are resolved from an ' +
    'explicit whitelist of `?url` imports (ICONS map), not a node_modules glob, so ' +
    'the same set works in dev, build, and on Vercel.',
  rules: [
    'name is required and must match a key already imported into the ICONS map — ' +
      'unknown names render an empty (blank) glyph, not an error.',
    'variant is one of filled | outlined | round (default) | sharp | two-tone — ' +
      'only variants actually imported per-icon are available (mostly "round").',
    'size accepts a number (px) or a CSS size string; default is 24.',
    'To add a new icon: import its ?url asset and add an ICONS entry keyed ' +
      '"<variant>/<name>".',
  ],
  // NOTE: the harness CLI's variant-name extractor scans the whole variants
  // array (bracket-depth scoped, not AST-scoped) for literal `name:` keys to
  // build the variant tab list — a literal `name:` key inside a variant's
  // own `props` object (MaterialIcon's icon-name prop happens to also be
  // called `name`) would double-match. Using the computed-key form
  // `['name']:` below avoids the collision without changing the prop that
  // actually reaches the component.
  variants: [
    { name: 'account_circle', props: { ['name']: 'account_circle', size: 28 } },
    { name: 'check_circle',   props: { ['name']: 'check_circle', size: 28 } },
    { name: 'close',          props: { ['name']: 'close', size: 28 } },
    { name: 'chevron_right (small)', props: { ['name']: 'chevron_right', size: 16 } },
  ],
})
