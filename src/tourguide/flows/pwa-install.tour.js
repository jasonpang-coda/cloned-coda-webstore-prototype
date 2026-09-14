import { defineTour } from '@coda/tourguide-kit'
import { useTheme } from '../../composables/useTheme.js'
import { useCheckout } from '../../composables/useCheckout.js'
import { useDeviceFrame } from '../../composables/useDeviceFrame.js'
import { useTaskGiftClaim } from '../../composables/useTaskGiftClaim.js'

// TaskGiftSheet's open state is a global singleton ref (useTaskGiftClaim.js),
// shared with the live app — closing it via a `type: 'call'` action here is
// deterministic (no DOM-click/animation-timing race), unlike relying on the
// engine finding and clicking the sheet's own footer button between steps.
// Called from every step's beforeStep except the ones that intentionally
// show it, so the sheet only ever appears when this tour explicitly opens
// it — never left lingering from an earlier step or a manual Back/Next jump.
function closeTaskGiftSheet() {
  const { closeSheet } = useTaskGiftClaim()
  closeSheet()
}

// Opens it deterministically too, for the same reason — the download-banner
// step used to click the real CTA to open the sheet as a side effect, but
// since the device is forced to iPhone/Android that click opens TaskGiftSheet
// immediately, mid-step, so it visibly appeared "before" the intended step.
// Every surface step is now spotlight-only (no click); only the dedicated
// showcase steps below control opening the sheet.
function openTaskGiftSheet() {
  const { openSheet } = useTaskGiftClaim()
  openSheet()
}

export default defineTour({
  id: 'pwa-install',
  title: 'Install the COD:M Store (PWA)',
  category: 'Growth',
  description: 'Tours every install entry point in page order — the drawer, story slide, Gifts banner, and download banner — then shows TaskGiftSheet\'s two device-specific endings: iOS\'s inline "Add to Home Screen" instructions, and Android\'s single-requirement variant (no install needed for Web Push there).',
  defaultTheme: 'codm',
  defaultDevice: 'iphone',

  setup: async () => {
    const { setTheme } = useTheme()
    const { setGuestPlayerName, setGuestVerified, closeCheckout } = useCheckout()
    const { device } = useDeviceFrame()
    const { closeSheet } = useTaskGiftClaim()
    setTheme('codm')
    closeCheckout()
    // Device forced to iPhone for the surface fly-bys and the iOS ending —
    // usePwaInstall.js's shouldOfferIos (read via TaskGiftSheet's `variant`)
    // treats that as real-iOS-equivalent. Switched to 'samsung' (Android)
    // later, by the device-switch step itself, not here.
    device.value = 'iphone'
    closeSheet()
    // Signed-in ("found") state, kept for parity with the rest of the demo
    // even though no step below points at the player card any more.
    setGuestPlayerName('Demo Operator')
    setGuestVerified(true)
    await new Promise(r => setTimeout(r, 200))
  },

  // Safety net if the tour is stopped mid-step (e.g. the user hits Stop
  // while the sheet is open) — never leave it lingering after the tour ends,
  // and don't leave the device frame stuck on Android for whatever runs next.
  teardown: () => {
    closeTaskGiftSheet()
    useDeviceFrame().device.value = 'iphone'
  },

  // Page-position order (top to bottom): the drawer's own entry point (the
  // hamburger button) sits fixed at the very top, then the story carousel,
  // then the Gifts banner (mid-page), then the download banner (near the
  // bottom, just before the FAQ). Every step before the last three is a
  // spotlight-only fly-by. The download-banner step opens TaskGiftSheet for
  // the iOS ending (instructions render inline now — no tap-to-reveal detour
  // to drill into); then the tour switches the device frame to Android and
  // reopens the sheet via the drawer to show its single-requirement variant.
  steps: [
    {
      id: 'open-drawer',
      title: 'Hamburger Menu',
      explanation: 'The one persistent, always-reachable surface on the page — fixed at the top.',
      beforeStep: closeTaskGiftSheet,
      poiSelector: 'hamburger-btn',
      poiPlacement: 'bottom',
      holdMs: 2200,
      action: {
        type: 'click',
        target: 'hamburger-btn',
        delayBeforeActionMs: 400,
        delayAfterActionMs: 600,
      },
    },
    {
      id: 'drawer-cta',
      title: 'Drawer — Notification Toggle',
      explanation: 'Pinned above the region/language switcher footer — persistently visible, no install-first gate.',
      poiSelector: 'webpush-drawer-row',
      poiPlacement: 'top',
      holdMs: 2800,
      // Closes the drawer before moving on, so the next (story-slide) step
      // starts from a clean page.
      action: {
        type: 'click',
        target: 'drawer-close-btn',
        delayBeforeActionMs: 500,
        delayAfterActionMs: 400,
      },
    },
    {
      id: 'story-slide',
      title: 'Story Carousel — Install Slide',
      explanation: 'A dedicated first slide at the top of the page, before any other promo — "Get faster access to COD:M Store".',
      // The carousel auto-advances every few seconds; step back onto the PWA
      // slide (always index 0) before looking for its CTA, since autoplay may
      // have moved on since setup(). Bounded + rAF-double-waited so each click
      // is read against a flushed DOM (a bare setTimeout races Vue's render).
      beforeStep: async () => {
        closeTaskGiftSheet()
        for (let i = 0; i < 6 && !document.querySelector('[data-poi="story-pwa-cta"]'); i++) {
          document.querySelector('.story__zone--prev')?.click()
          await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
        }
      },
      poiSelector: 'story-pwa-cta',
      // 'bottom' — the tooltip card is tall enough that 'top' left it
      // overlapping the CTA it's meant to point at (not enough clear space
      // above the target at this scroll position); plenty of room below.
      poiPlacement: 'bottom',
      holdMs: 2800,
    },
    {
      id: 'gifts-banner-cta',
      title: 'Gifts Banner — Secondary CTA',
      explanation: 'Same install action, sign-in-button styled and deliberately de-emphasised next to the Gifts category.',
      beforeStep: closeTaskGiftSheet,
      poiSelector: 'gifts-banner-pwa-cta',
      poiPlacement: 'bottom',
      holdMs: 2600,
    },
    {
      id: 'download-banner-cta',
      title: 'Download Banner — Primary CTA',
      explanation: 'The shimmer primary button, deliberately outranking the App Store/Google Play badges beside it.',
      beforeStep: closeTaskGiftSheet,
      poiSelector: 'download-banner-pwa-cta',
      poiPlacement: 'bottom',
      holdMs: 2800,
      // Spotlight only — no click. Clicking the real button here would open
      // TaskGiftSheet immediately as a side effect, which would visibly
      // appear "before" the next step. Opening it is that next step's own
      // job — see openTaskGiftSheet() above.
    },
    {
      id: 'ios-instructions',
      title: 'iOS — Inline "Add to Home Screen" Instructions',
      explanation: 'Safari has no native install prompt, so a real iOS device (or the device-frame set to iPhone) sees the media + numbered Add to Home Screen steps rendered directly under the checklist — no tap required to reveal them.',
      // Just opens the sheet — the instructions are already visible on the
      // 'install' step, nothing to drill into any more.
      beforeStep: openTaskGiftSheet,
      poiSelector: 'task-gift-sheet-instructions',
      poiPlacement: 'top',
      holdMs: 3200,
      // Deterministic close via the composable, not a DOM click on the
      // footer's "Got it" — see closeTaskGiftSheet() above.
      action: {
        type: 'call',
        handler: closeTaskGiftSheet,
        delayBeforeActionMs: 400,
        delayAfterActionMs: 400,
      },
    },
    {
      id: 'switch-to-android',
      title: 'Switching to Android',
      explanation: 'Android/Chromium decouples Web Push from PWA install entirely — subscribing works from a plain browser tab, no install needed. TaskGiftSheet reflects that: no checklist, just the one real requirement.',
      // No POI — this step is a narrated device-frame switch, not a spotlight
      // on page content. The sheet was already closed by the previous step's
      // action, so the switch happens on a clean page.
      beforeStep: () => {
        useDeviceFrame().device.value = 'samsung'
      },
      holdMs: 1800,
    },
    {
      id: 'open-drawer-android',
      title: 'Hamburger Menu (Android)',
      explanation: 'Same persistent entry point — the drawer\'s notification row doesn\'t change surface, only what tapping it opens.',
      poiSelector: 'hamburger-btn',
      poiPlacement: 'bottom',
      holdMs: 2000,
      action: {
        type: 'click',
        target: 'hamburger-btn',
        delayBeforeActionMs: 400,
        delayAfterActionMs: 600,
      },
    },
    {
      id: 'android-notification',
      title: 'Android — Single-Requirement Variant',
      explanation: 'No checklist, no install step — just the one requirement stated as prose, and a footer CTA that requests notification permission directly.',
      // Opens the sheet via the same drawer toggle the app itself uses, then
      // spotlights the Android-only body copy.
      beforeStep: async () => {
        openTaskGiftSheet()
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
      },
      poiSelector: 'task-gift-sheet-android-body',
      poiPlacement: 'top',
      holdMs: 3000,
      action: {
        type: 'call',
        handler: closeTaskGiftSheet,
        delayBeforeActionMs: 400,
        delayAfterActionMs: 400,
      },
    },
  ],
})
