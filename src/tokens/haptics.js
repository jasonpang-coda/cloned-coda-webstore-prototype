/**
 * Haptic Design Tokens — source of truth (JS, not CSS).
 * -----------------------------------------------------
 * navigator.vibrate() consumes numbers (ms) and arrays (patterns like
 * [20,40,20]), which CSS custom properties cannot represent. So — exactly as
 * gradients are authored in CSS because they can't be Figma variables — haptics
 * are authored in JS because they can't be CSS variables. The primitive→semantic
 * tiering below mirrors motion.css / motion-sku.css so this reads as a token
 * file, not a constants dump.
 *
 * This file is PURE DATA. Reduced-motion gating, feature detection and the iOS
 * no-op all live in useHaptics — never here.
 */

// ── Tier 1: primitives (durations in ms) — parallels --motion-sys-duration-* ─────
const haptic = {
  light: 10, // micro-feedback: buttons, chips, tabs
  medium: 20, // committing action: SKU card select
  heavy: 35, // weighty confirmation: checkout CTA
}

// ── Tier 2: semantic map — parallels --motion-sku-*. Components reference THESE.
export const haptics = {
  // single-tap feedbacks
  press: haptic.light, // generic button / icon / close
  chip: haptic.light, // chip / tab selection
  select: haptic.medium, // SKU / bundle / best-seller card select
  confirm: haptic.heavy, // checkout CTA

  // patterns: [vibrate, pause, vibrate …]
  success: [haptic.light, 40, haptic.medium], // sign-in success snackbar
  error: [haptic.medium, 30, haptic.medium], // failed lookup / destructive
}

// Exported for docs/tests only — components use the semantic map above.
export const HAPTIC_PRIMITIVES = haptic
