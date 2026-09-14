import Media from '@/components/Media.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'media',
  title: 'Media',
  group: 'Atoms',
  component: Media,
  tokens: [],
  // Media has no <style> block at all — it declares no --x-/--sys- token by
  // design, so this is a deliberate, confirmed token-free component.
  tokenFree: true,
  states: ['default'],
  // A pure img/video render — no interactive affordance of its own (the
  // card that wraps it, e.g. BundleSkuCard, owns any click/hover behaviour).
  presentational: true,
  notes:
    'Renders a still image or a video from a single `src`, picking the element by ' +
    'file extension (.mp4/.webm/.mov → <video>, everything else → <img>, so ' +
    'animated webp/gif/apng just work via the img branch). Used by BundleSkuCard, ' +
    'GiftSkuCard and ItemSummaryAccordion so bundle/gift art can be a still image ' +
    'or a looping video without the consumer branching on file type. The ' +
    'consumer\'s class/style land on whichever element is actually rendered ' +
    '(inheritAttrs).',
  rules: [
    'src is required.',
    'alt only applies to the image branch (videos are decorative/muted, no alt).',
    'poster is optional and only used for the video branch (shown before the ' +
      'video paints).',
    'Video playback is autoplay, loop, muted, playsinline, no picture-in-picture — ' +
      'always ambient background motion, never a media player with controls.',
  ],
  variants: [
    {
      name: 'Image',
      props: ({ assets }) => ({
        src: assets.content?.cpCoins?.[420] || assets.brand?.cpIcon,
        alt: 'Bundle artwork',
      }),
    },
    {
      name: 'Video',
      props: () => ({
        src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      }),
    },
  ],
})
