/**
 * captureHelper.js — the in-browser half of the visual capture rig
 * (plans/tickets/in-progress/visual-capture-rig.md). Companion to `tools/harness-capture.mjs`
 * (the deterministic manifest planner, Node-side) and its `save` command
 * (the decode/write half, also Node-side, no browser needed).
 *
 * This repo has no headless-browser dependency (Playwright/Puppeteer) —
 * added deliberately, see plans/tickets/in-progress/visual-capture-rig.md's "Open questions" —
 * so there is no fully-unattended driver. A human/agent navigates to a
 * manifest target's URL (`?theme=<store>&capture=1#library=<id>&v=<n>&w=<width>`),
 * waits for `document.documentElement.dataset.captureReady` (LibraryViewer.vue
 * sets this once images/fonts/entrance-motion have settled — never guess a
 * fixed timeout), then runs:
 *
 *   const { captureCurrentStage } = await import('/src/dev/captureHelper.js')
 *   return await captureCurrentStage()
 *
 * — one line, instead of retyping the ring-mask/backdrop-filter workaround
 * inline each time (which is how this file's logic was originally written,
 * ad hoc, in plans/tickets/in-progress/visual-capture-rig.md's first proof pass). The returned
 * base64 PNG string (no `data:` prefix) is what `harness-capture.mjs save`
 * decodes and writes to the manifest's `outFile` path.
 */
import { domToPng } from 'modern-screenshot'
import { resolvePageBg, neutraliseRings, makeOnCloneEachNode } from '../composables/useScreenshot.js'

/**
 * Captures the current library-viewer capture-mode stage (whatever
 * `document.documentElement.dataset.captureSelector` names — LibraryViewer.vue
 * sets it to `.lib__stage .stage-host__screen`) as a PNG.
 *
 * Reuses useScreenshot.js's real-device-frame workarounds verbatim rather
 * than a second copy: the ring-mask washout fix (`.sku-card::before` and
 * siblings), the backdrop-filter strip (doesn't survive the foreignObject
 * clone), and the resolved-page-bg override (a `var(--x-bg-page)` doesn't
 * resolve inside the clone either) — all discovered once, for the real app
 * frame, and equally true here since this is the same `modern-screenshot`
 * capture mechanism aimed at a different root element.
 *
 * @returns {Promise<string>} base64-encoded PNG (no `data:image/png;base64,` prefix)
 * @throws if capture mode isn't active/settled (no captureSelector) or the
 *   selector matches nothing (story didn't mount, or capture-ready fired
 *   before the DOM it names existed)
 */
export async function captureCurrentStage () {
  const selector = document.documentElement.dataset.captureSelector
  if (!selector) {
    throw new Error(
      'captureCurrentStage: document.documentElement.dataset.captureSelector is unset — ' +
      'is ?capture=1 active, and has the story actually reached data-capture-ready yet?'
    )
  }
  const el = document.querySelector(selector)
  if (!el) {
    throw new Error(`captureCurrentStage: selector "${selector}" (from data-capture-selector) matched no element`)
  }

  const restoreRings = neutraliseRings()
  try {
    const dataUrl = await domToPng(el, {
      scale: 2,
      backgroundColor: null,
      onCloneEachNode: makeOnCloneEachNode(resolvePageBg(), 'stage-host__screen'),
    })
    return dataUrl.slice('data:image/png;base64,'.length)
  } finally {
    restoreRings()
  }
}
