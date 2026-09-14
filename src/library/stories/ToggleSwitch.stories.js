import ToggleSwitch from '@/components/ToggleSwitch.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'toggle-switch',
  title: 'Toggle Switch',
  group: 'Controls',
  component: ToggleSwitch,
  states: ['default', 'hover', 'pressed', 'checked', 'unchecked', 'disabled'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-size-control-xs',
    '--x-pad-surface-xxs',
    '--x-radius-badge-full',
    '--x-surface-ghost-4',
    '--x-surface-ghost-2',
    '--x-motion-toggle',
    '--x-bg-control-active',
    '--x-border-control-active',
    '--x-motion-control-press-scale',
    '--x-size-icon-m',
    '--x-bg-action-neutral',
    '--x-shadow-story-card',
  ],
  notes:
    'A binary control-only toggle (no visible label of its own) — a bare ' +
    '`<button role="switch">` matching Figma node 6424:11355. The OFF track/border ' +
    'reuses the ghost surface ramp; ON reuses the shared "active control" brand-fill ' +
    'tokens (--x-bg-control-active / --x-border-control-active), the same pair every ' +
    'other active control in this DS uses. Clicking always flips modelValue via ' +
    'update:modelValue immediately — press feedback is not gated on any async ' +
    'permission request resolving, so a denied/blocked click still feels responsive.',
  rules: [
    'ariaLabel is required — the control has no visible text label, so every usage must supply one for accessibility.',
    'v-model only: the component holds no internal state, modelValue/update:modelValue drive it entirely.',
    'disabled suppresses both the click handler (no emit) and the press-scale feedback, and dims the control to 50% opacity.',
  ],
  variants: [
    {
      name: 'Off',
      props: () => ({
        modelValue: false,
        ariaLabel: 'Enable push notifications',
      }),
    },
    {
      name: 'On',
      props: () => ({
        modelValue: true,
        ariaLabel: 'Enable push notifications',
      }),
    },
    {
      name: 'Disabled (off)',
      props: () => ({
        modelValue: false,
        disabled: true,
        ariaLabel: 'Enable push notifications',
      }),
    },
    {
      name: 'Disabled (on)',
      props: () => ({
        modelValue: true,
        disabled: true,
        ariaLabel: 'Enable push notifications',
      }),
    },
  ],
})
