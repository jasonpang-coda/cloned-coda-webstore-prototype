import CompactHero from '@/components/CompactHero.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'compact-hero',
  title: 'Compact Hero',
  group: 'Content',
  component: CompactHero,
  tokens: [
    '--x-gap-content-default',
    '--x-pad-surface-m',
    '--x-gap-content-tight',
    '--x-text-header-inverse',
  ],
  states: ['default'],
  notes:
    'Compact left-rail game-identity tile for the two-column split page layout ' +
    '(config.page.layout === "split", e.g. Codashop): a square thumbnail, the ' +
    'game title, and an optional delivery InfoTag chip. Only renders when the ' +
    'store provides config.identity — every store other than Codashop omits ' +
    'that key, so this mounts nowhere else. Vertical rhythm comes from the ' +
    'caller\'s standard `.section` wrapper; only its own side padding is self-owned.',
  rules: [
    'image and title are required; deliveryLabel is optional and hides the InfoTag chip entirely when omitted.',
    'Never test config.identity from inside another component — this only mounts where the store config supplies it.',
    'Do not confuse with StepGamerId (the Gamer ID input form) or HeroSkuCard (a SKU-card ring-effect variant) — this is identity-tile only, no interaction.',
  ],
  variants: [
    {
      name: 'Default (with delivery badge)',
      props: ({ config, strings, assets }) => ({
        image: config.identity?.image || assets.brand?.logomark,
        title: config.identity?.title || 'Mobile Legends: Bang Bang',
        deliveryLabel: strings.identity?.deliveryLabel || 'Instant Delivery',
      }),
    },
    {
      name: 'No delivery badge',
      props: ({ config, assets }) => ({
        image: config.identity?.image || assets.brand?.logomark,
        title: config.identity?.title || 'Mobile Legends: Bang Bang',
      }),
    },
  ],
})
