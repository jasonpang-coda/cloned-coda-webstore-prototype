import OrderCompletePage from '@/components/OrderCompletePage.vue'
import { defineStory } from '../story.js'
import { useCheckout } from '@/composables/useCheckout.js'
import { usePwaInstall } from '@/composables/usePwaInstall.js'
import { useWebPush } from '@/composables/useWebPush.js'
import { useTaskGiftClaim } from '@/composables/useTaskGiftClaim.js'

const { selectedItem, guestPlayerName, selectedChannel } = useCheckout()
const { isInstalled } = usePwaInstall()
const { subscribed } = useWebPush()
const { claimed, unclaim } = useTaskGiftClaim()

// Snapshot + restore every shared singleton this story forces per-variant —
// same rationale as TaskGiftSheet.stories.js (these are real, persisted
// flags shared with the rest of the app, not story-local state).
let saved
function snapshot() {
  saved = {
    selectedItem: selectedItem.value,
    guestPlayerName: guestPlayerName.value,
    selectedChannel: selectedChannel.value,
    isInstalled: isInstalled.value,
    subscribed: subscribed.value,
    claimed: claimed.value,
  }
}
function restore() {
  selectedItem.value = saved.selectedItem
  guestPlayerName.value = saved.guestPlayerName
  selectedChannel.value = saved.selectedChannel
  isInstalled.value = saved.isInstalled
  subscribed.value = saved.subscribed
  claimed.value = saved.claimed
}

export default defineStory({
  id: 'order-complete-page',
  title: 'Order Complete Page',
  group: 'Pages',
  component: OrderCompletePage,
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-separation',
    '--x-scrim-banner-strong',
    '--x-gap-content-default',
    '--x-gap-content-tight',
    '--x-text-header-default',
    '--x-pad-surface-xl',
    '--x-pad-surface-s',
    '--x-radius-control-full',
    '--x-bg-action-primary',
    '--x-text-on-primary',
    '--x-fx-ripple-color-dark',
    '--x-motion-sku-hover',
    '--x-size-control-s',
    '--x-pad-surface-m',
    '--border-weight-selected',
    '--x-border-signin-btn',
    '--x-surface-ghost-3',
    '--x-border-tag-success',
    '--x-bg-info-banner-success',
    '--border-weight-default',
    '--x-border-sheet',
    '--x-radius-container-xs',
    '--x-bg-sheet',
    '--x-bg-sku-card-default',
    '--x-border-sku-card-default',
    '--x-pad-surface-xxs',
    '--x-text-body-default',
    '--x-bg-action-neutral',
    '--x-bg-action-neutral-hover',
    '--x-gap-content-loose',
    '--x-gap-content-narrow',
    '--x-bg-tag-neutral',
    '--x-text-hyperlink-default',
  ],
  states: ['default'],
  notes:
    'Full-page Purchase Success view (Figma 335:61272) — a VIEW swapped in by ' +
    'App.vue in place of the storefront, not an overlay. Theme-gated on ' +
    'strings.page.orderComplete; only COD:M defines that key today. Order ' +
    'details persist from the real checkout flow (useCheckout selectedItem/ ' +
    'guestPlayerName/selectedChannel), falling back field-by-field to the ' +
    'Figma default (see useOrderComplete.js) when nothing was selected. The ' +
    'gift banner reuses the same task-gated 88 CP flow as the Gifts category ' +
    '(useTaskGiftClaim), so its step depends on the shared isInstalled/' +
    'subscribed/claimed singletons.',
  rules: [
    'Renders nothing (v-if="t") when the active store has no strings.page.orderComplete.',
    'order merges live checkout state over DEFAULT_ORDER field-by-field (never a spread) so a null field never clobbers the fallback.',
    'The gift banner shows a ToggleSwitch for the "push" step and a pill CTA for every other step — never both.',
  ],
  variants: [
    {
      name: 'Default (demo order, install step)',
      setup: () => {
        snapshot()
        selectedItem.value = null
        guestPlayerName.value = ''
        selectedChannel.value = null
        isInstalled.value = false
        subscribed.value = false
        unclaim()
      },
      teardown: () => restore(),
    },
    {
      name: 'Real checkout selection, push step',
      setup: () => {
        snapshot()
        selectedItem.value = {
          amount: 2000, baseAmount: 1780, bonusAmount: 220,
          currentPrice: '$24.99', skuImage: null,
        }
        guestPlayerName.value = 'CodPlayerOne'
        selectedChannel.value = 1
        isInstalled.value = true
        subscribed.value = false
        unclaim()
      },
      teardown: () => restore(),
    },
    {
      name: 'Gift already claimed',
      setup: () => {
        snapshot()
        isInstalled.value = true
        subscribed.value = true
        claimed.value = true
      },
      teardown: () => restore(),
    },
  ],
})
