import StoryCarousel from '@/components/StoryCarousel.vue'
import { defineStory } from '../story.js'

// Slide shape: { image, portrait?, landscape?, heading, ctaLabel, ctaIcon?, ctaPoi?, ctaTarget?, ctaCategory?, logo? }
function slides(assets) {
  const hero = assets.content?.storyHero || assets.brand?.wordmark
  return [
    {
      image: hero,
      heading: 'MIDNIGHT SUN EVENT',
      ctaLabel: 'Shop Now',
      ctaIcon: 'arrow_forward',
    },
    {
      image: hero,
      heading: 'DOUBLE XP WEEKEND',
      ctaLabel: 'Learn More',
      ctaIcon: 'arrow_forward',
    },
    {
      image: hero,
      heading: 'NEW SEASON LIVE',
      ctaLabel: 'View Rewards',
      ctaIcon: 'arrow_forward',
    },
  ]
}

export default defineStory({
  id: 'story-carousel',
  title: 'Story Carousel',
  group: 'Carousels',
  component: StoryCarousel,
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-motion-sys-duration-slow',
    '--x-motion-sys-ease-decelerate',
    '--x-radius-container-xs',
    '--x-bestseller-warm',
    '--x-shadow-story-card',
    '--x-motion-sku-story-fade',
    '--x-motion-sys-ease-standard',
    '--x-gradient-story-progress-scrim',
    '--x-gap-content-narrow',
    '--x-pad-surface-s',
    '--x-pad-surface-m',
    '--x-radius-badge-full',
    '--x-border-divider',
    '--x-text-hyperlink-default',
    '--x-gap-content-loose',
    '--x-pad-surface-l',
    '--x-gradient-story-scrim',
    '--x-story-logo-max-height',
    '--x-story-logo-max-width',
    '--x-shadow-logo',
    '--x-text-header-default',
    '--x-text-shadow-story-heading',
    '--x-radius-control-full',
    '--x-surface-frost',
    '--x-motion-sku-hover',
    '--x-surface-frost-hover',
  ],
  states: ['default', 'hover'],
  notes:
    'Instagram-story-style hero slideshow: 1:1 portrait frame on narrow containers, ' +
    '2.6:1 landscape at >=801px (or a fixed aspectRatio prop override). A segmented ' +
    'progress bar per slide fills over `interval` (5000ms default) and auto-advances ' +
    'to the next slide on fill; tapping the left/right half of the frame navigates ' +
    'manually. Holding a pointer down on the frame pauses the active segment\'s fill ' +
    '(press-to-pause) without resetting it. Slides crossfade (350ms) rather than cut. ' +
    'With exactly one slide the progress bar, its scrim and autoplay are all hidden — ' +
    'it just presents a static hero. Honors prefers-reduced-motion by disabling ' +
    'auto-advance and showing the active segment full; tap navigation still works.',
  rules: [
    'slides is capped at 5 in practice — the segmented progress bar is designed for up to 5 segments before they become too thin to read.',
    'loop=true (default) wraps tap-next on the last slide back to the first, and tap-prev on the first to the last.',
    'A single slide silently disables autoplay, the progress bar and its scrim — there is nothing to advance to.',
    'ctaLabel is optional per slide — the CTA pill only renders when the current slide supplies one.',
    'aspectRatio overrides the responsive 1:1/2.6:1 default at every breakpoint — use it when a store\'s art is neither square nor the wide banner crop.',
  ],
  variants: [
    {
      name: 'Default (3 slides, autoplay)',
      props: ({ assets }) => ({
        slides: slides(assets),
      }),
    },
    {
      name: 'Single slide (static, no progress bar)',
      props: ({ assets }) => ({
        slides: slides(assets).slice(0, 1),
      }),
    },
    {
      name: 'Autoplay off',
      props: ({ assets }) => ({
        slides: slides(assets),
        autoplay: false,
      }),
    },
    {
      name: 'Fast interval, no loop',
      props: ({ assets }) => ({
        slides: slides(assets),
        interval: 2000,
        loop: false,
      }),
    },
  ],
})
