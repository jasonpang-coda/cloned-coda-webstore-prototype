/**
 * token-crosswalk.map.js — the curated, accumulating alias/recommendation table for
 * token-crosswalk.mjs. Every prototype `--x-*` token that doesn't exist in the
 * production repo (codapayments-codashop-client) BY EXACT NAME gets one entry here,
 * decided once, reused by every future flow that touches the same token.
 *
 * Two kinds of entry:
 *
 *   RENAME  — production already has a token that plays the same role under a
 *             different name. Not a design decision: the crosswalk should just use it.
 *
 *   NEW     — production has no equivalent at all. This is NEVER emitted as a bare
 *             instruction (see web-store-tokens skill §2b: the semantic tiers are a
 *             closed set, adding one is a design-system decision, not an implementer's
 *             call). Split by tier:
 *               - semantic (--x-bg-*, --x-text-*, --x-border-*, --x-pad-*, --x-gap-*,
 *                 --x-radius-*, --x-size-*, --x-border-weight-*) -> class NEW_SEMANTIC,
 *                 gated on design-system-owner sign-off; `fallback` is the DEFAULT path
 *                 an engineer takes until that sign-off lands.
 *               - effect/extension tier (shadows, glows, blurs — the sitebuilder
 *                 equivalent of the prototype's extensions.css) -> class NEW_EFFECT,
 *                 exempt from the closed-set rule, may proceed directly.
 *
 * `recommend` names a tier + target file in the PRODUCTION repo
 * (assets/css/sitebuilder/tokens/...), honouring their edge-only theming rule
 * (.cursor/rules/sitebuilder-edge-only-tokens.mdc): a new token is added on the
 * `theme-preset-edge--*` / `.theme--styled-edge` branch, never retrofitted onto the
 * legacy `theme--styled` branch.
 *
 * Seeded from the PWA + web push handoff (docs/Handoff/pwa-web-push/) — the first flow
 * run through this crosswalk. Add to this file, don't fork it, as later flows surface
 * more gaps.
 */

/** @typedef {'RENAME' | 'NEW_SEMANTIC' | 'NEW_EFFECT'} CrosswalkClass */

/**
 * @typedef {Object} CrosswalkEntry
 * @property {CrosswalkClass} class
 * @property {string} [productionName]  Set for RENAME — the production repo's token.
 * @property {string} [recommend]       Set for NEW_* — tier + target file to propose the token in.
 * @property {string} [fallback]        Set for NEW_* — nearest existing production token to use
 *                                       until (NEW_SEMANTIC) or without needing (NEW_EFFECT) sign-off.
 * @property {string} note
 */

/** @type {Record<string, CrosswalkEntry>} */
export const CROSSWALK_MAP = {
  '--x-motion-control-press-scale': {
    class: 'RENAME',
    productionName: '--x-motion-sku-press-scale',
    note: 'Same role (press-scale on a control) under production\'s sku-motion naming. No prototype-specific behaviour depends on the distinct name.',
  },
  '--border-weight-default': {
    class: 'RENAME',
    productionName: '--x-sys-stroke-thin',
    note: 'Production expresses border weight via the --x-sys-stroke-* scale (thin/medium/thick) rather than a single default. `thin` is the visual match for every prototype usage seen so far.',
  },
  '--x-bg-action-neutral': {
    class: 'NEW_SEMANTIC',
    recommend: 'assets/css/sitebuilder/tokens/background/_action.scss (theme-preset-edge branch)',
    fallback: '--x-bg-action-secondary',
    note: 'Production\'s bg-action-* family is primary/secondary/tertiary/destructive/positive/caution/inverse/subtle — no neutral slot. Needed for a control (e.g. a toggle thumb) that should read as inert, not as any of those semantic actions.',
  },
  '--x-surface-ghost-2': {
    class: 'NEW_SEMANTIC',
    recommend: 'assets/css/sitebuilder/tokens/background/_overlay.scss (theme-preset-edge branch)',
    fallback: '--x-bg-overlay-subtle',
    note: 'Prototype\'s ghost-N scale (near-transparent white/black steps for track/scrim fills) has no production analogue; overlay tier is the closest existing family.',
  },
  '--x-surface-ghost-4': {
    class: 'NEW_SEMANTIC',
    recommend: 'assets/css/sitebuilder/tokens/background/_overlay.scss (theme-preset-edge branch)',
    fallback: '--x-bg-overlay-default',
    note: 'Same family as --x-surface-ghost-2, one step more opaque (used for a border rather than a fill).',
  },
  '--x-shadow-story-card': {
    class: 'NEW_EFFECT',
    recommend: 'assets/css/sitebuilder/tokens/system/_elevation.scss or a new effect.scss (theme-preset-edge branch)',
    fallback: '--x-sys-effect-shadow-neutral',
    note: 'Effect/extension tier — exempt from the closed-set rule (web-store-tokens §2b explicitly carves out extensions/effect tokens). May be added directly rather than gated on design-system sign-off; fallback given anyway so a first pass can ship without waiting on it.',
  },
}
