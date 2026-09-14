import Button from '@/components/Button.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'button',
  title: 'Button',
  group: 'Primitives',
  component: Button,
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-tight',
    '--x-radius-control-full',
    '--x-motion-btn-activate',
    '--x-size-control-xs',
    '--x-pad-surface-m',
    '--x-size-control-s',
    '--x-pad-surface-l',
    '--x-size-control-m',
    '--x-pad-surface-xl',
    '--x-text-on-primary',
    '--x-bg-action-secondary',
    '--x-text-on-action-secondary',
    '--x-bg-action-secondary-hover',
    '--x-bg-action-secondary-pressed',
    '--x-bg-action-tertiary',
    '--x-text-on-action-tertiary',
    '--x-border-action-tertiary',
    '--x-bg-action-tertiary-hover',
    '--x-bg-action-tertiary-pressed',
    '--x-text-hyperlink-default',
    '--x-text-header-default',
  ],
  notes: 'Rendered in isolation via StoryStage. Verifies container queries and store theme reskinning.',
  rules: [
    'Enforce @container query layouts (never @media).',
    'Use semantic tokens for colors and spacing.',
  ],
  variants: [
    {
      name: 'Primary',
      props: () => ({ variant: 'primary', label: 'Buy Now' }),
    },
    {
      name: 'Secondary',
      props: () => ({ variant: 'secondary', label: 'View Details' }),
    },
    {
      name: 'Tertiary',
      props: () => ({ variant: 'tertiary', label: 'Learn More' }),
    },
    {
      name: 'Link',
      props: () => ({ variant: 'link', label: 'Continue as guest' }),
    },
    {
      name: 'Icon only',
      props: () => ({ variant: 'icon', icon: 'close', ariaLabel: 'Close' }),
    },
    {
      name: 'Leading icon',
      props: () => ({ variant: 'primary', icon: 'stars', label: 'Claim reward' }),
    },
    {
      name: 'Trailing icon',
      props: () => ({ variant: 'tertiary', icon: 'chevron_right', iconPosition: 'trailing', label: 'Next step' }),
    },
    {
      name: 'Full width',
      props: () => ({ variant: 'primary', label: 'Confirm Purchase', fullWidth: true }),
    },
    {
      name: 'Loading',
      props: () => ({ variant: 'primary', label: 'Processing…', loading: true }),
    },
    {
      name: 'Disabled',
      props: () => ({ variant: 'primary', label: 'Buy Now', disabled: true }),
    },
    {
      name: 'Small size',
      props: () => ({ variant: 'secondary', size: 'small', label: 'Apply' }),
    },
    {
      name: 'Large size',
      props: () => ({ variant: 'primary', size: 'large', label: 'Get Started' }),
    },
    {
      name: 'Shimmer (hero CTA)',
      props: () => ({ variant: 'primary', label: 'Buy Now', shimmer: true }),
    },
    {
      name: 'Brand override (sign-in)',
      props: () => ({ variant: 'primary', brand: 'signin', icon: 'stars', label: 'Sign in' }),
    },
    {
      name: 'As link',
      props: () => ({ variant: 'link', as: 'a', href: '#terms', label: 'View terms' }),
    },
    {
      name: 'Chip (inactive)',
      props: () => ({ variant: 'chip', label: 'Action' }),
    },
    {
      name: 'Chip (active)',
      props: () => ({ variant: 'chip', active: true, label: 'Adventure' }),
    },
  ],
})
