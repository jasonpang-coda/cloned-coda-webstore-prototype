import { haptics } from '../tokens/haptics.js'

/**
 * useHaptics — semantic haptic feedback wrapper around navigator.vibrate.
 *
 * Resolves a semantic token name (see tokens/haptics.js) → ms/pattern, gates on
 * prefers-reduced-motion, and feature-detects navigator.vibrate. Centralising
 * all of this means callers just say haptic('select').
 *
 * iOS Safari does NOT implement the Vibration API — navigator.vibrate is
 * undefined there, so supported() is false and every call is a silent no-op.
 * That is the correct (and only achievable) behaviour from a web prototype;
 * do not "fix" the missing iPhone buzz.
 *
 * The <input type="checkbox" switch> / label.click() Taptic Engine workaround
 * was evaluated (2026-06-06) and deliberately rejected: Apple patched
 * programmatic label.click() triggering in iOS 26.5, and the technique offers
 * no intensity or pattern control — light/medium/heavy would all feel identical.
 *
 * @param {keyof typeof haptics | number | number[]} token  semantic name, or raw ms/pattern
 * @returns {boolean} whether a vibration was actually requested
 */

// 3-line helper duplicated from useDragScroll / CategoryNav — matches the repo
// idiom rather than refactoring those into a shared composable (out of scope).
const prefersReduced = () =>
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches

const supported = () =>
  typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'

function trigger(token) {
  if (!supported()) return false // iOS Safari / desktop → silent no-op
  if (prefersReduced()) return false // accessibility gate (vibration = motion)

  const value = typeof token === 'string' ? haptics[token] : token
  if (value == null) return false // unknown token → no-op, don't throw

  try {
    return navigator.vibrate(value)
  } catch {
    return false // some engines throw on malformed args
  }
}

export function useHaptics() {
  return { haptic: trigger, supported, prefersReduced }
}

// Bare export so the v-haptic directive can fire without composable context.
export { trigger as triggerHaptic }
