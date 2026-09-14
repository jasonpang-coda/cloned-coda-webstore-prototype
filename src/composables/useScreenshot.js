import { ref } from 'vue'
import { domToBlob, domToCanvas } from 'modern-screenshot'

const SCALE = 2
const QUALITY = 0.8
const capturing = ref(false)

function timestamp () {
  const d = new Date()
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-` +
         `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

function download (blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// Resolve a CSS custom property to a concrete color (an actual rgb()/oklch()),
// by probing a throwaway element. The capture renderer (foreignObject) does not
// resolve var() chains, so the backing must be a literal color value.
//
// Exported (not just used internally) so tools/harness-capture.mjs's capture
// helper (src/dev/captureHelper.js) reuses the exact same domToPng/domToCanvas
// workarounds this file already had to discover — ring-mask washout,
// backdrop-filter not surviving the foreignObject clone, var()-backed page bg
// not resolving in the clone — rather than rediscovering them a second time
// for a different capture target (the library-viewer stage vs. the real
// device frame this composable was written for).
export function resolvePageBg () {
  const probe = document.createElement('div')
  probe.style.cssText = 'position:fixed;width:0;height:0;opacity:0;pointer-events:none;' +
                        'background-color:var(--x-bg-page)'
  document.body.appendChild(probe)
  const color = getComputedStyle(probe).backgroundColor
  probe.remove()
  if (color && color !== 'rgba(0, 0, 0, 0)') return color
  const screen = document.querySelector('.device__screen') || document.documentElement
  return getComputedStyle(screen).backgroundColor
}

// Every "glass" card draws its hairline border with a ::before that FILLS the
// card with the --x-sys-colour-surface-l1-border gradient (a 4%→58% white wash) and then
// masks itself down to a 1px ring via `mask-composite: exclude`. The capture
// renderer (SVG foreignObject) does not honour `mask-composite`, so the mask is
// ignored and the ::before floods the whole card with that bright gradient —
// the "washout". The sheet has no such ring, which is why it captures cleanly.
// Neutralise the ring fills for the duration of the capture (the 1px border is
// not worth keeping in an export). modern-screenshot reads the LIVE computed
// ::before styles, so a transient global stylesheet is the reliable lever.
const RING_BEFORE = [
  '.bundle', '.gift', '.sku-card', '.sku-image-card', '.bundle-item',
  '.page-signin__card', '.sheet__pc-card', '.bestseller__card',
].map(s => `${s}::before`).join(',')

export function neutraliseRings () {
  const style = document.createElement('style')
  style.textContent = `${RING_BEFORE}{background:none !important}`
  document.head.appendChild(style)
  return () => style.remove()
}

// modern-screenshot copies each element's computed `backdrop-filter` onto the
// clone, but the foreignObject can't composite it — the blur samples the (white)
// SVG backdrop and translucent surfaces come out grey. Hard-remove it from every
// clone with !important (runs AFTER styles are copied — index.mjs:1032). The
// page background (`var(--x-bg-page)`) also doesn't survive the clone's var()
// resolution, so paint the screen a concrete page colour as the dark backing.
// `screenClass` is the class of whichever element plays the "device screen"
// role for this capture target — 'device__screen' for the real app frame
// this file was written for, 'stage-host__screen' for the library-viewer
// capture helper's isolated stage (see captureHelper.js).
export function makeOnCloneEachNode (pageBg, screenClass = 'device__screen') {
  return (node) => {
    if (!(node instanceof HTMLElement)) return
    node.style.setProperty('backdrop-filter', 'none', 'important')
    node.style.setProperty('-webkit-backdrop-filter', 'none', 'important')
    if (node.classList.contains(screenClass)) {
      node.style.setProperty('background', pageBg, 'important')
    }
  }
}

async function captureFramed () {
  const el = document.querySelector('.device')
  if (!el) return null
  const restoreRings = neutraliseRings()
  try {
    return await domToBlob(el, {
      width: el.offsetWidth,
      height: el.offsetHeight,
      scale: SCALE,
      type: 'image/webp',
      quality: QUALITY,
      backgroundColor: null,         // transparent surround (no wallpaper/stage)
      style: { transform: 'none' },  // capture at natural, unscaled size
      features: { restoreScrollPosition: true },
      onCloneEachNode: makeOnCloneEachNode(resolvePageBg()),
    })
  } finally {
    restoreRings()
  }
}

async function captureResponsive () {
  const el = document.querySelector('.device__screen')
  if (!el) return null

  const toolbarH = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--toolbar-h'),
  ) || 0

  const restoreRings = neutraliseRings()
  let full
  try {
    full = await domToCanvas(el, {
      scale: SCALE,
      backgroundColor: null,
      onCloneEachNode: makeOnCloneEachNode(resolvePageBg()),
    })
  } finally {
    restoreRings()
  }

  const sx = 0
  const sy = window.scrollY * SCALE
  const sw = el.clientWidth * SCALE
  const sh = Math.max(0, (window.innerHeight - toolbarH) * SCALE)
  const out = document.createElement('canvas')
  out.width = sw
  out.height = sh
  out.getContext('2d').drawImage(full, sx, sy, sw, sh, 0, 0, sw, sh)
  return new Promise(resolve => out.toBlob(resolve, 'image/webp', QUALITY))
}

export function useScreenshot () {
  async function capture (device, storeKey = 'store') {
    if (capturing.value) return
    capturing.value = true
    try {
      const blob = device === 'none'
        ? await captureResponsive()
        : await captureFramed()
      if (!blob) return
      const variant = device === 'none' ? 'responsive' : device
      download(blob, `${storeKey}-${variant}-${timestamp()}.webp`)
    } catch (err) {
      console.error('[useScreenshot] capture failed:', err)
    } finally {
      capturing.value = false
    }
  }
  return { capturing, capture }
}
