/**
 * inspect.js — pure DOM/CSS helpers for the inspector (no Vue, no host coupling).
 *
 * Turns a picked DOM element into the data the panel renders:
 *   • resolveComponent / breadcrumb — which .vue owns the element (dev-only, via
 *     Vue's __vueParentComponent on the node — present because the inspector only
 *     runs in non-store-locked / dev builds).
 *   • collectStyles — grouped CSS fields, each resolved against the ACTUAL
 *     authored `var(--token)` reference (see ./authored.js) where one
 *     exists; falls back to a value-based guess (./token-map.js) only when
 *     no CSS rule declares the property at all, and flags a genuine raw
 *     literal (a rule matched but its value has no var()) as a
 *     design-system lint signal.
 *   • collectAnimations — keyframe animations + transitions, with motion tokens.
 *   • replayAnimation — restart a keyframe animation on the live element.
 *   • containerContext — nearest container-query ancestor + its current inline-size.
 *   • State applicators — buildHoverOverride / applyPressedState / applyDisabledState,
 *     each returns a cleanup function so the caller can restore the element.
 *   • formatSpecMarkdown — the "copy all" handoff dump.
 *
 * Token matching is injected (the `tokens` arg = createTokenMap() from
 * ./token-map.js) so this file stays framework-free and unit-testable. The
 * inspection root (`screenRoot`, default '.device__screen') is also a
 * parameter rather than a constant so a host app can point it at its own
 * root container.
 */

import { resolveAuthored } from './authored.js'

// ── component identity ────────────────────────────────────────────────────────

function componentName (instance) {
  const type = instance?.type
  if (!type) return null
  if (type.__name) return type.__name
  if (type.name) return type.name
  if (type.__file) return baseName(type.__file)
  return null
}

function baseName (file) {
  return String(file).split('/').pop().replace(/\.\w+$/, '')
}

// Walk up the DOM reading Vue's per-node owner component (set in dev builds).
export function resolveComponent (el) {
  let node = el
  while (node && node !== document.body) {
    const inst = node.__vueParentComponent
    if (inst) {
      return { name: componentName(inst), file: inst.type?.__file || null, instance: inst }
    }
    node = node.parentElement
  }
  // Fallback: BEM root class → PascalCase (sku-image-card → SkuImageCard).
  const root = bemRoot(el)
  return root ? { name: pascal(root), file: null, instance: null } : { name: null, file: null, instance: null }
}

function bemRoot (el) {
  const cls = (el.getAttribute?.('class') || '').split(/\s+/)
    .find(c => c && !c.includes('__') && !c.includes('--') && !c.startsWith('text-style-'))
  return cls || null
}
function pascal (s) {
  return s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}

// Component ancestry (innermost → App). Drives the component-tree line in the panel.
export function componentBreadcrumb (el) {
  const inst = resolveComponent(el).instance
  const chain = []
  let cur = inst
  while (cur) {
    const name = componentName(cur)
    if (name) chain.push({ name, file: cur.type?.__file || null })
    cur = cur.parent
  }
  return chain.reverse() // App → … → owner
}

// DOM element path from the screen root down to the picked node (for context).
export function elementPath (el, screenRoot = '.device__screen') {
  const path = []
  let node = el
  const root = el.closest?.(screenRoot)
  while (node && node !== document.body) {
    path.unshift(describeNode(node))
    if (root && node === root) break
    node = node.parentElement
  }
  return path
}
export function describeNode (node) {
  const tag = node.tagName?.toLowerCase() || 'node'
  const root = bemRoot(node)
  return root ? `${tag}.${root}` : tag
}

// ── container-query context ───────────────────────────────────────────────────

/**
 * containerContext(el, screenRoot) → { element, type, name, inlineSize, blockSize } | null
 *
 * Finds the nearest ancestor with an explicit CSS `container-type` (the element
 * that is the reference box for @container queries affecting `el`), and returns its
 * current rendered dimensions. Useful for FE devs to understand which container-
 * query breakpoint is currently active without reading all stylesheets.
 */
export function containerContext (el, screenRoot = '.device__screen') {
  let node = el.parentElement
  while (node && node !== document.body) {
    const cs = getComputedStyle(node)
    const ct = cs.containerType
    if (ct && ct !== 'normal') {
      const rect = node.getBoundingClientRect()
      const cn = cs.containerName
      return {
        element: node,
        type: ct,            // 'size' | 'inline-size'
        name: (cn && cn !== 'none') ? cn : null,
        inlineSize: Math.round(rect.width),
        blockSize: Math.round(rect.height),
        cls: bemRoot(node) || node.className.split(' ')[0] || node.tagName.toLowerCase(),
      }
    }
    node = node.parentElement
  }
  // Fallback: the screen root is always the implicit container.
  const screen = el.closest?.(screenRoot)
  if (screen) {
    const rect = screen.getBoundingClientRect()
    const cls = bemRoot(screen) || screen.className.split(' ')[0] || screen.tagName.toLowerCase()
    return { element: screen, type: 'inline-size', name: null, inlineSize: Math.round(rect.width), blockSize: Math.round(rect.height), cls }
  }
  return null
}

// ── style collection ──────────────────────────────────────────────────────────

const NONE = new Set(['none', 'normal', 'auto', '0px', 'rgba(0, 0, 0, 0)', 'rgb(0, 0, 0)'])

/**
 * field({ label, value, el, cssProp, kind, tokens, warnable }) → field object | null
 *
 * Resolution order per field:
 *   1. AUTHORED — resolveAuthored(el, cssProp) reads the winning CSS rule's
 *      literal declaration (see ./authored.js). A var() found there is the
 *      definitive answer: `source: 'authored'`.
 *   2. RAW LITERAL — a rule matched but its value has no var() at all
 *      (e.g. `color: #fff`) — genuinely un-tokenised CSS: `raw: true`.
 *   3. INFERRED — no rule anywhere declares the property (inherited/UA
 *      default with nothing in the cascade to read) — falls back to the old
 *      reverse value-match (./token-map.js), tagged `source: 'inferred'` so
 *      the UI can visibly distinguish "read from source" from "best guess".
 *
 * `cssProp` (a real CSS longhand, e.g. 'color'/'background-color') gates
 * whether authored resolution runs at all — omit it for fields with no CSS
 * source to read (Width/Height/Display are computed geometry, not a style
 * declaration). `kind` ('color'|'length') only tunes authored's multi-var()
 * disambiguation AND whether the inferred fallback is attempted (token-map's
 * reverse matcher only understands those two kinds for style fields).
 * `warnable` (default true) suppresses the "no token" lint signal for
 * fields where flagging a bare value would just be noise (e.g. font-family/
 * font-weight, which aren't meaningfully "tokenisable" the way a colour or
 * length is).
 */
function field ({ label, value, el, cssProp, kind, tokens, warnable = true }) {
  if (value == null || value === '') return null
  if (!cssProp) return { label, value, token: null, alts: null, warning: false, source: null, raw: false }

  const authored = el ? resolveAuthored(el, cssProp, { kind }) : null
  if (authored?.token) {
    return { label, value, token: authored.token, alts: null, warning: false, source: 'authored', raw: false }
  }
  if (authored?.raw) {
    return { label, value, token: null, alts: null, warning: warnable, source: 'authored', raw: true }
  }

  const canInfer = warnable && (kind === 'color' || kind === 'length')
  const match = canInfer && tokens ? tokens.matchToken(value, kind) : null
  const warning = warnable && !match && value !== '0px' && value !== '0s'
  return { label, value, token: match?.name || null, alts: match?.all || null, warning, source: match ? 'inferred' : null, raw: false }
}

function radius (cs) {
  const c = [
    cs.borderTopLeftRadius, cs.borderTopRightRadius,
    cs.borderBottomRightRadius, cs.borderBottomLeftRadius,
  ].map(v => v.trim())
  return c.every(v => v === c[0]) ? c[0] : c.join(' ')
}

function uniformSides (cs, prop) {
  const t = cs.getPropertyValue(`${prop}-top`).trim()
  const r = cs.getPropertyValue(`${prop}-right`).trim()
  const b = cs.getPropertyValue(`${prop}-bottom`).trim()
  const l = cs.getPropertyValue(`${prop}-left`).trim()
  if (t === r && r === b && b === l) return t
  return `${t} ${r} ${b} ${l}`
}

export function collectStyles (el, tokens, screenRoot = '.device__screen') {
  const cs = getComputedStyle(el)
  const rect = el.getBoundingClientRect()

  const layout = [
    field({ label: 'Width',  value: `${Math.round(rect.width)}px` }),
    field({ label: 'Height', value: `${Math.round(rect.height)}px` }),
    field({ label: 'Display', value: cs.display }),
    field({ label: 'Padding', value: uniformSides(cs, 'padding'), el, cssProp: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'], kind: 'length', tokens }),
    (cs.display.includes('flex') || cs.display.includes('grid')) && cs.gap !== 'normal'
      ? field({ label: 'Gap', value: cs.gap.split(' ')[0], el, cssProp: 'gap', kind: 'length', tokens }) : null,
    field({ label: 'Margin', value: uniformSides(cs, 'margin'), el, cssProp: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'], kind: 'length', tokens }),
    field({ label: 'Radius', value: radius(cs), el, cssProp: 'border-radius', kind: 'length', tokens }),
    field({ label: 'Border width', value: cs.borderTopWidth, el, cssProp: 'border-top-width', kind: 'length', tokens }),
  ].filter(Boolean).filter(f => !(['Margin', 'Radius', 'Border width'].includes(f.label) && f.value === '0px'))

  const colour = [
    field({ label: 'Text', value: cs.color, el, cssProp: 'color', kind: 'color', tokens }),
    NONE.has(cs.backgroundColor) ? null : field({ label: 'Background', value: cs.backgroundColor, el, cssProp: 'background-color', kind: 'color', tokens }),
    parseFloat(cs.borderTopWidth) > 0 ? field({ label: 'Border', value: cs.borderTopColor, el, cssProp: 'border-top-color', kind: 'color', tokens }) : null,
  ].filter(Boolean)

  const textStyleClass = [...el.classList].find(c => c.startsWith('text-style-')) || null
  const typography = [
    textStyleClass ? { label: 'Text style', value: `.${textStyleClass}`, token: null, alts: null, warning: false, source: null, raw: false } : null,
    // Font/Weight aren't meaningfully "tokenisable" as a bare value the way a
    // colour or length is (warnable: false) — but still worth resolving
    // authored, since .text-style-* classes typically set these via
    // var(--x-sys-font-family-*)/var(--x-sys-weight-*).
    field({ label: 'Font', value: cs.fontFamily.split(',')[0].replace(/["']/g, ''), el, cssProp: 'font-family', kind: 'font', tokens, warnable: false }),
    field({ label: 'Size', value: cs.fontSize, el, cssProp: 'font-size', kind: 'length', tokens }),
    field({ label: 'Weight', value: cs.fontWeight, el, cssProp: 'font-weight', kind: 'font', tokens, warnable: false }),
    field({ label: 'Line height', value: cs.lineHeight, el, cssProp: 'line-height', kind: 'length', tokens }),
    field({ label: 'Tracking', value: cs.letterSpacing, el, cssProp: 'letter-spacing', kind: 'length', tokens }),
  ].filter(Boolean)

  const effects = [
    NONE.has(cs.boxShadow) ? null : field({ label: 'Shadow', value: cs.boxShadow, el, cssProp: 'box-shadow', kind: 'color', tokens }),
    NONE.has(cs.backgroundImage) ? null : field({ label: 'Background image', value: cs.backgroundImage }),
    NONE.has(cs.backdropFilter || 'none') ? null : field({ label: 'Backdrop filter', value: cs.backdropFilter }),
    cs.opacity !== '1' ? field({ label: 'Opacity', value: cs.opacity }) : null,
  ].filter(Boolean)

  const component = resolveComponent(el)
  return {
    component,
    breadcrumb: componentBreadcrumb(el),
    path: elementPath(el, screenRoot),
    container: containerContext(el, screenRoot),
    a11y: collectA11y(el, cs),
    props: collectProps(component.instance),
    assets: collectAssets(el),
    groups: [
      { title: 'Layout', fields: layout },
      { title: 'Colour', fields: colour },
      { title: 'Typography', fields: typography },
      { title: 'Effects', fields: effects },
    ].filter(g => g.fields.length),
  }
}

// ── spacing measurement (gap strips + hover distance) ────────────────────────

/**
 * computeGapStrips(el, tokens) → [{ top, left, w, h, axis, px, token }]
 *
 * Figma-style "redline" strips for a flex/grid container's `gap` — drawn
 * between each pair of DOM-adjacent, in-flow children, in viewport
 * coordinates. Distinguishes row (horizontal neighbours, same visual row) from
 * column (vertical neighbours) gaps by checking which axis the two rects
 * actually overlap on, rather than trusting flex-direction/grid-template
 * alone — this stays correct across wrapped rows and multi-column grids
 * without needing to parse the grid template.
 *
 * Deliberately DOM-adjacency-based (children[i] vs children[i+1]), not a full
 * row/column reconstruction — correct for the common cases this handoff
 * targets (single-row/column stacks, simple wrapped grids) and cheap to
 * compute on every hover/selection change. A child that is `display:none` or
 * taken out of flow (`position: absolute|fixed`) is skipped since it
 * contributes no real gap.
 */
export function computeGapStrips (el, tokens) {
  const cs = getComputedStyle(el)
  if (!cs.display.includes('flex') && !cs.display.includes('grid')) return []
  const rowGap = parseFloat(cs.rowGap) || 0
  const colGap = parseFloat(cs.columnGap) || 0
  if (rowGap <= 0 && colGap <= 0) return []

  const kids = [...el.children].filter((c) => {
    const ccs = getComputedStyle(c)
    return ccs.display !== 'none' && ccs.position !== 'absolute' && ccs.position !== 'fixed'
  })
  if (kids.length < 2) return []

  const strips = []
  for (let i = 0; i < kids.length - 1; i++) {
    const ra = kids[i].getBoundingClientRect()
    const rb = kids[i + 1].getBoundingClientRect()
    const seg = gapSegment(ra, rb)
    if (!seg) continue
    const px = `${Math.round(seg.distance)}px`
    strips.push({
      top: seg.top, left: seg.left, w: seg.width, h: seg.height, axis: seg.axis,
      px, token: tokens?.matchToken(px, 'length')?.name || null,
    })
  }
  return strips
}

/**
 * computeDistanceTo(fromEl, toEl, tokens) → strip | null
 *
 * The "hold Alt, hover a sibling" measurement Figma/design tools offer:
 * the axis-aligned edge-to-edge gap between two elements that don't
 * overlap. Returns null when the two elements overlap or sit diagonally
 * (no single clean axis to measure) rather than guessing.
 */
export function computeDistanceTo (fromEl, toEl, tokens) {
  if (!fromEl || !toEl || fromEl === toEl) return null
  if (fromEl.contains(toEl) || toEl.contains(fromEl)) return null
  const seg = gapSegment(fromEl.getBoundingClientRect(), toEl.getBoundingClientRect())
  if (!seg) return null
  const px = `${Math.round(seg.distance)}px`
  return {
    top: seg.top, left: seg.left, w: seg.width, h: seg.height, axis: seg.axis,
    px, token: tokens?.matchToken(px, 'length')?.name || null,
  }
}

// Shared geometry: the axis-aligned gap strip between two non-overlapping
// rects, or null if they overlap or only meet diagonally (no perpendicular
// overlap on either axis to anchor a strip against).
function gapSegment (ra, rb) {
  const vOverlap = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top)
  const hOverlap = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left)

  if (vOverlap > 0) {
    if (ra.right <= rb.left) return xGap(ra, rb, vOverlap, ra.right, rb.left)
    if (rb.right <= ra.left) return xGap(ra, rb, vOverlap, rb.right, ra.left)
  }
  if (hOverlap > 0) {
    if (ra.bottom <= rb.top) return yGap(ra, rb, hOverlap, ra.bottom, rb.top)
    if (rb.bottom <= ra.top) return yGap(ra, rb, hOverlap, rb.bottom, ra.top)
  }
  return null
}
function xGap (ra, rb, vOverlap, left, right) {
  const distance = right - left
  if (distance <= 0.5) return null
  return { axis: 'x', top: Math.max(ra.top, rb.top), left, width: distance, height: Math.max(1, vOverlap), distance }
}
function yGap (ra, rb, hOverlap, top, bottom) {
  const distance = bottom - top
  if (distance <= 0.5) return null
  return { axis: 'y', left: Math.max(ra.left, rb.left), top, width: Math.max(1, hOverlap), height: distance, distance }
}

// ── accessibility ──────────────────────────────────────────────────────────

/**
 * collectA11y(el, cs) → { contrast, role, ariaLabel, tag }
 *
 * Surfaces the handoff-relevant accessibility facts: the WCAG contrast ratio of
 * the element's text against its effective (first opaque ancestor) background,
 * plus its ARIA role / label / tag. Text colour comes from the element's own
 * computed `color`; the background is resolved by walking ancestors because most
 * elements are themselves transparent.
 */
function collectA11y (el, cs) {
  return {
    contrast:  contrastInfo(cs.color, effectiveBackground(el)),
    role:      el.getAttribute?.('role') || null,
    ariaLabel: el.getAttribute?.('aria-label') || null,
    tag:       el.tagName?.toLowerCase() || null,
  }
}

/**
 * effectiveBackground(el) → 'rgb(...)' string
 *
 * Walks up from `el` to the first ancestor with a non-transparent background
 * colour — the colour a reader actually sees behind the text. Note: this returns
 * the first opaque-ish layer and does NOT composite stacked semi-transparent
 * backgrounds, so the contrast ratio is an approximation for translucent UIs.
 */
function effectiveBackground (el) {
  let node = el
  while (node && node.nodeType === 1) {
    const bg = getComputedStyle(node).backgroundColor
    const rgb = parseRgb(bg)
    if (rgb && rgb.a > 0.1) return bg
    node = node.parentElement
  }
  return 'rgb(0, 0, 0)' // assume dark backdrop (the prototype default)
}

// Parse an 'rgb(r,g,b)' / 'rgba(r,g,b,a)' string → { r, g, b, a } | null.
function parseRgb (str) {
  const m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?/i.exec(str || '')
  if (!m) return null
  return { r: +m[1], g: +m[2], b: +m[3], a: m[4] != null ? +m[4] : 1 }
}

// sRGB channel → linear (WCAG relative-luminance step).
function linearise (c) {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
function luminance (rgb) {
  return 0.2126 * linearise(rgb.r) + 0.7152 * linearise(rgb.g) + 0.0722 * linearise(rgb.b)
}

/**
 * contrastInfo(textColor, bgColor) → { ratio, aa, aaLarge, aaa } | null
 *
 * WCAG 2.1 contrast ratio + pass flags. `ratio` is rounded to 2 dp.
 * aa = ratio ≥ 4.5 (normal text), aaLarge = ≥ 3 (large/bold), aaa = ≥ 7.
 */
export function contrastInfo (textColor, bgColor) {
  const t = parseRgb(textColor)
  const b = parseRgb(bgColor)
  if (!t || !b) return null
  const lt = luminance(t)
  const lb = luminance(b)
  const ratio = (Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05)
  return {
    ratio:   Math.round(ratio * 100) / 100,
    aa:      ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaa:     ratio >= 7,
  }
}

// ── animations + transitions ───────────────────────────────────────────────────

// Split a comma-separated computed list, honouring commas inside cubic-bezier(…).
function splitList (s) {
  const out = []
  let depth = 0, cur = ''
  for (const ch of s) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = '' } else cur += ch
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

export function collectAnimations (el, tokens) {
  const cs = getComputedStyle(el)
  const out = { animations: [], transitions: [] }

  const names = cs.animationName
  if (names && names !== 'none') {
    const nameList  = splitList(names)
    const durList   = splitList(cs.animationDuration)
    const easeList  = splitList(cs.animationTimingFunction)
    const delayList = splitList(cs.animationDelay)
    const iterList  = splitList(cs.animationIterationCount)
    nameList.forEach((name, i) => {
      const dur  = durList[i % durList.length]
      const ease = easeList[i % easeList.length]
      out.animations.push({
        name,
        duration:      dur,
        easing:        ease,
        delay:         delayList[i % delayList.length],
        iteration:     iterList[i % iterList.length],
        durationToken: tokens?.matchToken(dur, 'duration')?.name || null,
        easingToken:   tokens?.matchToken(ease, 'easing')?.name || null,
        motionToken:   tokens?.matchMotionPair(dur, ease) || null,
      })
    })
  }

  const props = cs.transitionProperty
  if (props && props !== 'none' && props !== 'all none') {
    const propList = splitList(props)
    const durList  = splitList(cs.transitionDuration)
    const easeList = splitList(cs.transitionTimingFunction)
    propList.forEach((prop, i) => {
      const dur = durList[i % durList.length]
      if (!dur || dur === '0s') return
      const ease = easeList[i % easeList.length]
      out.transitions.push({
        property:      prop,
        duration:      dur,
        easing:        ease,
        durationToken: tokens?.matchToken(dur, 'duration')?.name || null,
        easingToken:   tokens?.matchToken(ease, 'easing')?.name || null,
        motionToken:   tokens?.matchMotionPair(dur, ease) || null,
      })
    })
  }

  return out
}

// Restart a keyframe animation on the live element (standard reflow-restart idiom).
export function replayAnimation (el) {
  const prev = el.style.animation
  el.style.animation = 'none'
  void el.offsetWidth // force reflow so the browser registers the removal
  el.style.animation = prev || ''
  if (!prev) el.style.removeProperty('animation')
}

// ── state applicators ─────────────────────────────────────────────────────────

/**
 * buildHoverOverride(el, pseudo = 'hover') → cleanup fn
 *
 * Clones every `:${pseudo}` rule in the document's stylesheets and re-targets
 * it via a unique marker class, so the styled state applies without actual
 * mouse position or focus, letting a caller re-read computed styles in that
 * visual state. Cross-origin stylesheets are skipped gracefully. Returns a
 * cleanup function that removes the injected stylesheet and every marker
 * class it added.
 *
 * The marker class goes on WHICHEVER element the selector's own base part
 * (the simple selector immediately before the pseudo-class) actually
 * matches — `el` itself if it matches, otherwise the first matching
 * descendant of `el`. This matters because in this codebase a component's
 * exposed root (what `componentEl()`/`bemRoot()` return) is very often a
 * plain wrapper (`.filter-dropdown`, `.player-account`) with the REAL
 * interactive element nested inside it (`.filter-dropdown__trigger`,
 * `.player-account__input`) — a rule like `.filter-dropdown__trigger:hover`
 * only ever matches that inner element, never the wrapper. The previous
 * implementation always marked `el` itself, so it silently no-op'd for
 * every component shaped like that (most of them) — this only looked like
 * it worked for the few components whose OWN root carries the `:hover`/
 * `:focus` rule directly. Handles compound selector lists (`a:hover, b:hover`)
 * by evaluating each comma-separated selector independently, and
 * `el:hover .child { }` rules the same way as before (the descendant
 * combinator after the pseudo passes through `newSel` unchanged).
 */
export function buildHoverOverride (el, pseudo = 'hover') {
  const id = `_ih${Math.random().toString(36).slice(2, 8)}`
  const aliases = pseudo === 'focus' ? [':focus-visible', ':focus'] : [`:${pseudo}`]
  const injected = []
  const marked = new Set()

  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (!(rule instanceof CSSStyleRule)) continue
        // Compound selector lists (`.a:hover, .b:hover`) must be evaluated
        // per comma-separated selector — only some of them may reference
        // the pseudo-class at all, and each can have its OWN target element.
        for (const sel of rule.selectorText.split(',').map(s => s.trim())) {
          const hit = aliases.find(a => sel.includes(a))
          if (!hit) continue
          const base = sel.split(hit)[0].trim()
          let targets
          try {
            targets = el.matches(base) ? [el] : [...el.querySelectorAll(base)]
          } catch { continue } // an unparseable/pseudo-only base — skip this selector
          if (targets.length === 0) continue
          for (const t of targets) { t.classList.add(id); marked.add(t) }
          injected.push(`${sel.split(hit).join(`.${id}`)} { ${rule.style.cssText} }`)
        }
      }
    } catch { /* cross-origin sheet — skip */ }
  }

  const style = document.createElement('style')
  style.dataset.inspectorState = pseudo
  style.textContent = injected.join('\n')
  document.head.appendChild(style)

  return () => {
    for (const t of marked) t.classList.remove(id)
    style.remove()
  }
}

/**
 * applyPressedState(el) → cleanup fn
 *
 * Adds a BEM `--pressed` modifier on `el` (e.g. `sku-card--pressed`), which is the
 * pattern used throughout the codebase for the press visual state. Falls back to
 * the generic `pressed` class if the BEM root can't be determined.
 */
export function applyPressedState (el) {
  const root = bemRoot(el)
  const bemCls = root ? `${root}--pressed` : null
  if (bemCls) el.classList.add(bemCls)
  el.classList.add('pressed')
  return () => {
    if (bemCls) el.classList.remove(bemCls)
    el.classList.remove('pressed')
  }
}

/**
 * applyDisabledState(el) → cleanup fn
 *
 * Sets the `disabled` attribute (for buttons/inputs) and adds a `disabled` class
 * (for custom elements that use class-based disabled styling).
 */
export function applyDisabledState (el) {
  el.setAttribute('disabled', '')
  el.classList.add('disabled')
  return () => {
    el.removeAttribute('disabled')
    el.classList.remove('disabled')
  }
}

// ── component export + props ─────────────────────────────────────────────────

const TYPE_NAMES = new Map([
  [String, 'String'], [Number, 'Number'], [Boolean, 'Boolean'],
  [Array, 'Array'], [Object, 'Object'], [Function, 'Function'], [Date, 'Date'],
])
function typeName (t) {
  if (t == null) return null
  if (Array.isArray(t)) return t.map(typeName).filter(Boolean).join(' | ')
  return TYPE_NAMES.get(t) || t.name || null
}

// Resolve a declared prop default (may be a factory function for objects/arrays).
function resolveDefault (schema) {
  const d = schema && typeof schema === 'object' && !Array.isArray(schema) ? schema.default : undefined
  if (typeof d === 'function' && schema.type !== Function) {
    try { return d() } catch { return undefined }
  }
  return d
}

function sameValue (a, b) {
  if (a === b) return true
  if (a == null || b == null) return a === b
  if (typeof a === 'object' && typeof b === 'object') {
    try { return JSON.stringify(a) === JSON.stringify(b) } catch { return false }
  }
  return false
}

/**
 * collectProps(instance) → [{ name, type, required, default, value, isDefault }]
 *
 * Reads the declared prop schema (`instance.type.props`, normalized by Vue to
 * object form at runtime) and the live resolved values (`instance.props`).
 * Sorted: required first, then props differing from their default, then defaults.
 * Returns [] when there is no instance or no declared props.
 */
export function collectProps (instance) {
  const declared = instance?.type?.props
  if (!declared) return []
  const live = instance.props || {}
  const names = Array.isArray(declared) ? declared : Object.keys(declared)
  const rows = names.map((name) => {
    const schema = Array.isArray(declared) ? {} : (declared[name] || {})
    const norm = (schema && typeof schema === 'object' && !Array.isArray(schema) && 'type' in schema)
      ? schema
      : { type: schema }
    const def = resolveDefault(norm)
    const value = live[name]
    return {
      name,
      type:     typeName(norm.type),
      required: !!norm.required,
      default:  def,
      value,
      isDefault: sameValue(value, def),
    }
  })
  return rows.sort((a, b) =>
    (b.required - a.required) || (a.isDefault - b.isDefault) || a.name.localeCompare(b.name))
}

// Serialize a prop value for a template attribute. Long strings are truncated.
function snippetValue (v, max = 60) {
  if (typeof v === 'string') return v.length > max ? `${v.slice(0, max)}…` : v
  try { return JSON.stringify(v) } catch { return String(v) }
}

/**
 * componentUsageSnippet(instance) → '<Tag … />' string, or null.
 *
 * Builds a paste-ready invocation from the live props: required props always,
 * plus any prop whose live value differs from its declared default (default-valued
 * props are omitted to keep the snippet readable). Strings → `prop="v"`, boolean
 * true → bare `prop`, everything else → `:prop="json"`.
 */
export function componentUsageSnippet (instance) {
  const tag = instance?.type?.__name || componentName(instance)
  if (!tag) return null
  const props = collectProps(instance).filter(p => p.required || !p.isDefault)
  if (!props.length) return `<${tag} />`
  const attrs = props.map((p) => {
    const v = p.value
    if (typeof v === 'string') return `  ${p.name}="${snippetValue(v)}"`
    if (v === true)  return `  ${p.name}`
    if (v === false) return `  :${p.name}="false"`
    return `  :${p.name}="${snippetValue(v).replace(/"/g, "'")}"`
  })
  return `<${tag}\n${attrs.join('\n')}\n/>`
}

// ── asset extraction ──────────────────────────────────────────────────────────

/**
 * collectAssets(el) → [{ url, kind }]
 *
 * Scans the element subtree for real image assets: <img> sources and CSS
 * background-image url(...) values. URLs are resolved to absolute and de-duped.
 * `kind` is 'img' or 'background'. data: URIs are kept but flagged via kind.
 */
export function collectAssets (el) {
  if (!el || el.nodeType !== 1) return []
  const seen = new Set()
  const out = []
  const push = (raw, kind) => {
    if (!raw) return
    let url
    try { url = new URL(raw, window.location.href).href } catch { url = raw }
    if (seen.has(url)) return
    seen.add(url)
    out.push({ url, kind })
  }

  for (const img of el.querySelectorAll('img')) push(img.currentSrc || img.src, 'img')

  const nodes = [el, ...el.querySelectorAll('*')]
  for (const node of nodes) {
    const bg = getComputedStyle(node).backgroundImage
    if (!bg || bg === 'none') continue
    const re = /url\((['"]?)(.*?)\1\)/g
    let m
    while ((m = re.exec(bg))) push(m[2], 'background')
  }
  return out
}

export function assetName (url) {
  try {
    const path = new URL(url, window.location.href).pathname
    return decodeURIComponent(path.split('/').pop()) || url
  } catch {
    return url.length > 40 ? `${url.slice(0, 40)}…` : url
  }
}

// ── handoff export ──────────────────────────────────────────────────────────────

export function formatSpecMarkdown (spec, anims, { state = 'default', device = null } = {}) {
  const lines = []
  const comp = spec.component
  lines.push(`## ${comp.name || 'Element'}`)
  if (comp.file) lines.push(`\`${comp.file}\``)
  if (spec.breadcrumb?.length) lines.push(`\n**Tree:** ${spec.breadcrumb.map(b => b.name).join(' › ')}`)
  if (spec.path?.length) lines.push(`**Element:** \`${spec.path.join(' > ')}\``)
  if (state !== 'default') lines.push(`**State:** \`${state}\``)

  if (spec.container || device) {
    lines.push('\n### Responsive')
    if (device) lines.push(`- **Device:** ${device}`)
    if (spec.container) lines.push(`- **Container:** \`.${spec.container.cls}\` · ${spec.container.type} · ${spec.container.inlineSize}px`)
  }

  for (const group of spec.groups) {
    lines.push(`\n### ${group.title}`)
    for (const f of group.fields) {
      const warn = f.raw && f.warning ? ' ⚠ raw literal — no token' : f.warning ? ' ⚠ no token' : ''
      const tok = f.token ? ` → \`var(${f.token})\`${f.source === 'inferred' ? ' (inferred — not read from source)' : ''}` : warn
      lines.push(`- **${f.label}:** \`${f.value}\`${tok}`)
    }
  }

  if (anims.animations.length || anims.transitions.length) {
    lines.push('\n### Motion')
    for (const a of anims.animations) {
      const tok = a.motionToken ? `var(${a.motionToken})` : [a.durationToken, a.easingToken].filter(Boolean).map(t => `var(${t})`).join(' ')
      lines.push(`- **animation** \`${a.name}\` — ${a.duration} ${a.easing}${a.iteration && a.iteration !== '1' ? ` ×${a.iteration}` : ''}${tok ? ` → ${tok}` : ''}`)
    }
    for (const t of anims.transitions) {
      const tok = t.motionToken ? `var(${t.motionToken})` : [t.durationToken, t.easingToken].filter(Boolean).map(x => `var(${x})`).join(' ')
      lines.push(`- **transition** \`${t.property}\` — ${t.duration} ${t.easing}${tok ? ` → ${tok}` : ''}`)
    }
  }

  if (spec.props?.length) {
    lines.push('\n### Props')
    for (const p of spec.props) {
      const meta = [p.type, p.required ? 'required' : null].filter(Boolean).join(', ')
      lines.push(`- **${p.name}**${meta ? ` (${meta})` : ''}: \`${snippetValue(p.value, 80)}\``)
    }
  }

  const c = spec.a11y?.contrast
  if (c || spec.a11y?.role || spec.a11y?.ariaLabel) {
    lines.push('\n### Accessibility')
    if (c) lines.push(`- **Contrast:** ${c.ratio}:1 — ${c.aa ? 'AA pass' : c.aaLarge ? 'AA large only' : 'fail'}`)
    if (spec.a11y.role)      lines.push(`- **Role:** \`${spec.a11y.role}\``)
    if (spec.a11y.ariaLabel) lines.push(`- **aria-label:** \`${spec.a11y.ariaLabel}\``)
  }

  if (spec.assets?.length) {
    lines.push('\n### Assets')
    for (const a of spec.assets) lines.push(`- \`${a.url}\``)
  }

  return lines.join('\n')
}

// ── JSON export + deep-link selector ─────────────────────────────────────────

/**
 * elementSelector(el, screenRoot) → CSS selector path from screenRoot to el, or null.
 *
 * Used for URL-hash deep-linking so a selection can be shared as a URL.
 * The path uses `tag.bemRoot` segments (e.g. `div.sku-card > div.sku-card__price`)
 * and is directly usable as a `screen.querySelector(selector)` argument to restore.
 */
export function elementSelector (el, screenRoot = '.device__screen') {
  const screen = el.closest?.(screenRoot)
  if (!screen) return null
  const parts = []
  let node = el
  while (node && node !== screen) {
    const tag = node.tagName?.toLowerCase() || '*'
    const root = bemRoot(node)
    parts.unshift(root ? `${tag}.${root}` : tag)
    node = node.parentElement
  }
  return parts.join(' > ')
}

/**
 * formatSpecJson(spec, anims, opts) → plain JSON-serializable object.
 *
 * Companion to formatSpecMarkdown — for programmatic processing or pasting into
 * a style dictionary, a token linting script, or a Figma plugin. All fields from
 * all style groups are present; motion tokens and warnings are included.
 */
export function formatSpecJson (spec, anims, { state = 'default', device = null } = {}) {
  const out = {
    component: {
      name:  spec.component.name  || null,
      file:  spec.component.file  || null,
      tree:  spec.breadcrumb?.map(b => b.name) || [],
      path:  spec.path || [],
    },
    state,
    device,
    container: spec.container ? {
      cls:        spec.container.cls,
      type:       spec.container.type,
      name:       spec.container.name,
      inlineSize: spec.container.inlineSize,
    } : null,
  }
  for (const group of spec.groups) {
    out[group.title.toLowerCase()] = group.fields.map(f => ({
      label:   f.label,
      value:   f.value,
      token:   f.token   || null,
      source:  f.source  || null, // 'authored' (read from source) | 'inferred' (value-matched guess) | null
      raw:     f.raw     || false, // a rule matched but its value has no var() — genuinely un-tokenised
      warning: f.warning || false,
    }))
  }
  out.animations = anims.animations.map(a => ({
    name:           a.name,
    duration:       a.duration,
    easing:         a.easing,
    delay:          a.delay   || null,
    iteration:      a.iteration !== '1' ? (a.iteration || null) : null,
    durationToken:  a.durationToken || null,
    easingToken:    a.easingToken   || null,
    motionToken:    a.motionToken   || null,
  }))
  out.transitions = anims.transitions.map(t => ({
    property:      t.property,
    duration:      t.duration,
    easing:        t.easing,
    durationToken: t.durationToken || null,
    easingToken:   t.easingToken   || null,
    motionToken:   t.motionToken   || null,
  }))
  out.props = (spec.props || []).map(p => ({
    name:     p.name,
    type:     p.type,
    required: p.required,
    value:    p.value,
    isDefault: p.isDefault,
  }))
  out.a11y = spec.a11y ? {
    contrast:  spec.a11y.contrast,
    role:      spec.a11y.role,
    ariaLabel: spec.a11y.ariaLabel,
    tag:       spec.a11y.tag,
  } : null
  out.assets = (spec.assets || []).map(a => ({ url: a.url, kind: a.kind }))
  return out
}
