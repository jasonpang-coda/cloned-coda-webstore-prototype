/**
 * defineStory — identity + light-validation helper for a component story.
 *
 * A story is plain data describing how the library viewer renders one component:
 * its grouping, authored docs, and a set of named variants. `defineStory` only
 * normalises defaults and (in dev) warns on obvious mistakes — it deliberately
 * adds NO framework coupling, so a story file stays a small declarative object.
 *
 * @typedef {Object} StoryVariant
 * @property {string}   name        Display label for the variant tab.
 * @property {Object|((ctx: StoryCtx) => Object)} [props]
 *           Props bound to the component. A function receives the live store
 *           context ({ assets, strings, config, theme }) and is re-evaluated on
 *           every theme switch — use it so imagery/copy track the active store.
 * @property {() => void} [setup]    Run when the variant mounts (e.g. prime a
 *           singleton composable for an overlay component). Return value ignored.
 * @property {() => void} [teardown] Run when leaving the variant / closing the
 *           viewer (undo whatever `setup` did).
 *
 * @typedef {Object} StoryCtx
 * @property {Object} assets   useStoreAssets().value
 * @property {Object} strings  useStoreStrings().value
 * @property {Object} config   useStoreConfig().value
 * @property {string} theme    active theme key
 *
 * @typedef {Object} Story
 * @property {string}  id          Stable kebab-case id (deep-link + selection key).
 * @property {string}  title       Human-readable title shown in the side panel.
 * @property {string}  group       Side-panel group heading (e.g. 'Cards').
 * @property {Object}  component   The imported Vue component.
 * @property {string}  [notes]     Authored prose (interaction behaviour, context).
 * @property {string[]} [rules]    Do/don't usage rules, one per line.
 * @property {string[]} [states]   Inspector states to expose: subset of
 *           ['default','hover','focus','pressed','disabled']. Default: ['default'].
 *           These are the pseudo-states the SAME simulation mechanism
 *           (buildHoverOverride/applyPressedState/applyDisabledState in
 *           @coda/inspect-kit) can apply to ANY component generically, via a
 *           CSS class/attribute toggle — no component-specific data needed.
 *           `focus` re-targets `:focus-visible`/`:focus` rules the identical
 *           way `hover` re-targets `:hover` (buildHoverOverride(el, 'focus')).
 *           An interactive component left at the default `['default']` is
 *           flagged as a (non-blocking) warning by `harness test` unless
 *           `presentational: true` — see that flag below.
 *
 *           Content-shape conditions — loading / empty / error / long-copy —
 *           are DELIBERATELY NOT part of this list: unlike a pseudo-state,
 *           they need real component-specific data (an empty `items` array,
 *           a `loading` prop, an overflowing string), so they can't be
 *           generically simulated as a DOM/CSS toggle the way hover/focus/
 *           pressed/disabled can. Author them as ordinary named `variants`
 *           instead (e.g. a variant named "Empty" or "Long copy") when the
 *           component has a state worth showing — `states` stays reserved
 *           for the four pseudo-states above.
 * @property {boolean} [overlay]   True for fixed/absolute overlay components
 *           (sheets, drawers) — the stage frames them and traps their fixed
 *           positioning inside the container host.
 * @property {boolean} [tokenFree] Explicit, human-authored acknowledgement
 *           that this component genuinely consumes zero --x-/--sys- design
 *           tokens (e.g. it inherits colour via `currentColor`, or has no
 *           <style> block at all). Without it, `harness test` fails loud on
 *           a zero-token sweep rather than silently reporting a clean pass —
 *           see tools/harness-cli.mjs's NO_TOKENS_TESTED check.
 * @property {boolean} [presentational] Explicit, human-authored acknowledgement
 *           that this component has no interactive affordance of its own (an
 *           icon, a static banner, a layout primitive like Grid/Span — nothing
 *           a user hovers/focuses/presses/disables). Without it, `harness test`
 *           prints a (non-blocking) STATE_COVERAGE_WARNING for a story left at
 *           the default `states: ['default']` — see tools/harness-cli.mjs.
 *           Mirrors `tokenFree`'s pattern: a deliberate opt-out, not a silent
 *           exemption, so the warning stays a real, checkable backlog instead
 *           of every single-state story being assumed presentational by default.
 * @property {number|string} [captureVariant] Which variant the visual capture
 *           rig (tools/harness-capture.mjs, plans/tickets/in-progress/visual-capture-rig.md) treats
 *           as this component's "worst case" for a baseline/spec screenshot —
 *           an index into `variants`, or a variant's own `name`. Defaults to
 *           the LAST variant by convention (authors tend to order variants by
 *           ascending complexity) when unset — set this explicitly once that
 *           default picks the wrong one for a given component.
 * @property {StoryVariant[]} variants
 *
 * @param {Story} story
 * @returns {Story}
 */
export function defineStory (story) {
  if (import.meta.env.DEV) {
    const where = story?.id || story?.title || '(unnamed story)'
    if (!story?.id)        console.warn(`[library] story ${where} is missing an "id"`)
    if (!story?.component) console.warn(`[library] story ${where} is missing a "component"`)
    if (!Array.isArray(story?.variants) || story.variants.length === 0) {
      console.warn(`[library] story ${where} has no "variants"`)
    }
  }
  return {
    group:   'Components',
    notes:   '',
    rules:   [],
    states:  ['default'],
    overlay: false,
    tokenFree: false,
    presentational: false,
    tokens:  [],
    figmaNodeId: null,
    variants: [],
    ...story,
  }
}
