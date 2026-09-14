import Thumbnail from '@/components/Thumbnail.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'thumbnail',
  title: 'Thumbnail',
  group: 'Atoms',
  component: Thumbnail,
  tokens: [
    '--x-radius-thumbnail-m',
  ],
  states: ['default'],
  notes:
    'A generic square image tile with fixed rounded corners, used by CompactHero ' +
    'for its SKU/reward artwork. Size is a token-scale key (--x-size-img-<size>) ' +
    'rather than a raw pixel value, so callers stay on the size scale instead of ' +
    'inventing dimensions.',
  rules: [
    'image is required (the img src).',
    'alt is optional, defaults to empty (decorative).',
    'size maps to --x-size-img-<size> — one of xs | s | m | l | xl (default) | xxl.',
  ],
  variants: [
    {
      name: 'Default (xl)',
      props: ({ assets }) => ({
        image: assets.content?.cpCoins?.[420] || assets.brand?.cpIcon,
        alt: 'Item artwork',
      }),
    },
    {
      name: 'Small (s)',
      props: ({ assets }) => ({
        image: assets.content?.cpCoins?.[160] || assets.brand?.cpIcon,
        alt: 'Item artwork',
        size: 's',
      }),
    },
    {
      name: 'Extra large (xxl)',
      props: ({ assets }) => ({
        image: assets.content?.cpCoins?.[5400] || assets.brand?.cpIcon,
        alt: 'Item artwork',
        size: 'xxl',
      }),
    },
  ],
})
