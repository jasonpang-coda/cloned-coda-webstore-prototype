import Snackbar from '@/components/Snackbar.vue'
import { defineStory } from '../story.js'
import { useAuth } from '@/composables/useAuth.js'

// Snackbar's visibility/content are NOT props — it reads the shared
// `snackbarVisible` / `snackbarContent` singleton from useAuth() directly
// (mounted once in DeviceFrame's #overlay slot and auto-dismissed 5s later
// by the composable's own timer). There is no story-schema hook that runs
// before mount, so — same trick as AccountPopover's story — the only working
// way to exercise the visible state here is calling the composable's own
// opener as a side effect of the variant's props factory.
const { showSnackbar, dismissSnackbar } = useAuth()

export default defineStory({
  id: 'snackbar',
  title: 'Snackbar',
  group: 'Atoms',
  component: Snackbar,
  overlay: true,
  tokens: [
    '--x-pad-surface-m',
    '--x-gap-content-default',
    '--x-pad-surface-s',
    '--x-text-success-default',
    '--x-radius-container-s',
    '--x-bg-snackbar-success',
    '--x-blur-container',
    '--x-gap-content-narrow',
    '--x-text-success-inverse',
    '--x-radius-badge-full',
    '--x-motion-hover',
    '--x-motion-snackbar-enter',
    '--x-motion-snackbar-exit',
  ],
  states: ['default'],
  notes:
    'The success toast shown on sign-in (Figma node 4863:15067), mounted once in ' +
    'DeviceFrame\'s #overlay slot and driven entirely by useAuth()\'s shared ' +
    '`snackbarVisible` / `snackbarContent` singleton — never a prop. It bounces up ' +
    'from below the screen on entrance and auto-dismisses after 5s (the timer ' +
    'lives in the composable), or earlier via its own close button. Content is ' +
    'reused for other success confirmations too (e.g. the gift-claim flow).',
  rules: [
    'Never gate this on a prop — it always reads the shared snackbarVisible/' +
      'snackbarContent singleton, driven by useAuth\'s showSnackbar()/dismissSnackbar().',
    'isMobile controls only positioning: true (default) pins it absolute to the ' +
      'device screen bottom (framed); false pins it fixed to the viewport bottom ' +
      '(responsive/desktop, no device frame).',
    'Only one snackbar is ever shown at a time — a new showSnackbar() call ' +
      'replaces the current content and resets the auto-dismiss timer.',
  ],
  variants: [
    {
      name: 'Visible (framed)',
      props: () => {
        showSnackbar({ title: 'Signed in', text: 'Welcome back, codayw' })
        return { isMobile: true }
      },
    },
    {
      name: 'Visible (responsive)',
      props: () => {
        showSnackbar({ title: 'Signed in', text: 'Welcome back, codayw' })
        return { isMobile: false }
      },
    },
    {
      name: 'Dismissed',
      props: () => {
        dismissSnackbar()
        return { isMobile: true }
      },
    },
  ],
})
