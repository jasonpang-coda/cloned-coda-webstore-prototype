import ItemSummaryAccordion from '@/components/ItemSummaryAccordion.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'item-summary-accordion',
  title: 'Item Summary Accordion',
  group: 'Content',
  component: ItemSummaryAccordion,
  states: ['collapsed', 'expanded'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-rarity-gradient-neutral',
    '--x-border-soft',
    '--x-radius-container-s',
    '--x-gap-content-default',
    '--x-pad-surface-s',
    '--x-text-body-default',
    '--x-size-img-l',
    '--x-radius-container-xs',
    '--x-gap-content-tight',
    '--x-text-body-soft',
    '--x-motion-accordion',
    '--x-bg-card-default',
  ],
  notes:
    'One row of the "You will receive" list inside the Item Summary sheet ' +
    '(src/components/steps/InfoStepBody.vue loops `bundle.items` and spreads each ' +
    'item object as props, plus `data.compactAccordion` for `compact`). Collapsed, it ' +
    'shows a rarity-tinted 48×48 thumb, the item name, and an x-quantity line; ' +
    'tapping it expands a media block (image or video, resolved by <Media> from the ' +
    '`media` src\'s extension) and a text description via the same grid-template-rows ' +
    '0fr→1fr accordion recipe used across the repo (--x-motion-accordion, also seen ' +
    'in ResellerBanner). The header button self-disables (`:disabled="!hasDetail"`) ' +
    'and hides the chevron entirely when neither `media` nor `description` is given, ' +
    'so a plain reward line never looks falsely interactive. `tileBg` accepts a raw ' +
    'CSS gradient/color string (e.g. `var(--x-rarity-gradient-legendary)`) or a plain ' +
    'image URL auto-wrapped with cover sizing — same convention as BundleItem.tileBg.',
  rules: [
    '`name` is the only required prop — everything else is optional and additive.',
    'Omit both `media` and `description` for a non-expandable reward row: the chevron disappears and the header button disables itself automatically, no separate "expandable" flag exists.',
    '`compact` hides the rarity thumb entirely (used for FCM\'s info sheet, which has no rarity thumb) — do not pass an `image` expecting it to still show under `compact`.',
    '`tileBg` is a raw CSS value (gradient var or url), not a rarity enum — pass one of the --x-rarity-gradient-* tokens directly, matching BundleItem\'s convention.',
  ],
  variants: [
    {
      name: 'Reward row (no detail)',
      props: ({ assets }) => ({
        name: 'MYTHIC WEAPON SKIN',
        image: assets.brand?.cpIcon,
        tileBg: 'var(--x-rarity-gradient-mythic)',
        quantity: 1,
      }),
    },
    {
      name: 'Expandable, collapsed',
      props: ({ assets }) => ({
        name: 'GODZILLA X KONG AVATAR',
        image: assets.brand?.cpIcon,
        tileBg: 'var(--x-rarity-gradient-legendary)',
        quantity: 1,
        description: 'A limited-edition avatar frame celebrating the Godzilla x Kong crossover event.',
      }),
    },
    {
      name: 'Expanded by default',
      props: ({ assets }) => ({
        name: 'GODZILLA X KONG AVATAR',
        image: assets.brand?.cpIcon,
        tileBg: 'var(--x-rarity-gradient-legendary)',
        quantity: 1,
        description: 'A limited-edition avatar frame celebrating the Godzilla x Kong crossover event.',
        defaultOpen: true,
      }),
    },
    {
      name: 'Compact (no rarity thumb)',
      props: () => ({
        name: 'FC POINTS',
        quantity: '4,600',
        compact: true,
        description: 'Redeemable across FC Mobile, Ultimate Team, and FIFA Clubs.',
      }),
    },
  ],
})
