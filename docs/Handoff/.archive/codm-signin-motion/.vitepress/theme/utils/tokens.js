/** Read a CSS custom property from an element (defaults to :root). */
export function getToken(name, el = null) {
  const target = el || (typeof document !== 'undefined' ? document.documentElement : null)
  if (!target) return ''
  return getComputedStyle(target).getPropertyValue(name).trim()
}

/** Parse "350ms" → 350 */
export function parseDuration(val) {
  if (!val) return 0
  const n = parseFloat(String(val).replace(/ms|s$/i, ''))
  if (String(val).endsWith('s') && !String(val).endsWith('ms')) return n * 1000
  return n || 0
}

/** Resolve a composite token like "350ms cubic-bezier(...)" into { duration, easing } */
export function parseTransitionToken(val) {
  if (!val) return { duration: 0, easing: 'linear' }
  const parts = val.split(/\s+(cubic-bezier|linear)/)
  if (parts.length >= 3) {
    return {
      duration: parseDuration(parts[0]),
      easing: `${parts[1]}${parts[2]}`,
    }
  }
  return { duration: parseDuration(val), easing: 'linear' }
}

export const DURATION_TOKENS = [
  { name: '--motion-duration-fast', label: 'Fast', min: 50, max: 500, step: 10 },
  { name: '--motion-duration-base', label: 'Base', min: 100, max: 600, step: 10 },
  { name: '--motion-duration-slow', label: 'Slow', min: 150, max: 800, step: 10 },
  { name: '--motion-duration-exit', label: 'Exit', min: 50, max: 400, step: 10 },
]

export const EASING_TOKENS = [
  { name: '--motion-ease-standard', label: 'Standard' },
  { name: '--motion-ease-decelerate', label: 'Decelerate' },
  { name: '--motion-ease-accelerate', label: 'Accelerate' },
  { name: '--motion-ease-spring', label: 'Spring' },
  { name: '--motion-ease-linear', label: 'Linear' },
]

export const COMPOSITE_TOKENS = [
  '--motion-modal-enter',
  '--motion-modal-exit',
  '--motion-snackbar-enter',
  '--motion-snackbar-exit',
]
