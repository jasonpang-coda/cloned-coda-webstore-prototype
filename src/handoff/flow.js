/**
 * defineFlow — identity + light-validation helper for one feature's handoff
 * manifest (mirrors src/library/story.js's defineStory).
 *
 * A flow declares WHAT a feature's handoff surfaces need to show — token
 * names, state ids, transitions, choreography beats, component references —
 * never resolved VALUES. Resolved values (the actual `350ms
 * cubic-bezier(0,0,0.2,1)` a token computes to under a given store theme) are
 * produced live by resolve.js (for the in-app /handoff surfaces) and by
 * scripts/resolve-css.mjs (for the static export). This split is the whole
 * point of the framework: a manifest can never go stale by transcription,
 * because it never contains a transcribed value.
 *
 * @typedef {Object} FlowComponent
 * @property {string} id         Display id (e.g. 'RegionSelectorSheet').
 * @property {Object} component  The imported Vue component (for live render).
 * @property {string[]} tokens   Token names this component consumes.
 * @property {string} [source]   Repo-relative source file, for citation.
 * @property {string} [notes]    Authored prose about this component's role.
 *
 * @typedef {Object} FlowState
 * @property {string} id     Stable id, matches the spec's state names 1:1.
 * @property {string} [desc] What this state is / looks like.
 * @property {string} [entry] How the state is entered.
 * @property {string} [exit]  How the state is left.
 *
 * @typedef {Object} FlowTransition
 * @property {string} from
 * @property {string} to
 * @property {string} [trigger]
 * @property {string[]} [motion]    Motion token names driving this transition.
 * @property {string} [distance]    Displacement token name, if any.
 *
 * @typedef {Object} FlowBeat
 * @property {string} beat
 * @property {number} delayMs
 * @property {string} duration   Duration token name.
 * @property {string} easing     Easing token name.
 * @property {string} [target]   What element/surface this beat animates.
 *
 * @typedef {Object} FlowTarget
 * Where a component's production counterpart already lives, for a handoff that
 * crosses into a different codebase. This is deliberately optional and
 * per-consumer-repo — a flow with no `targets` is still valid for the in-app
 * oracle and the plain spec export; `targets` only matters to
 * `--target=<repo>` exports (see export-handoff.mjs).
 * @property {string} component   Repo-relative path to the existing counterpart component.
 * @property {string} [styles]    Repo-relative path to its mirrored stylesheet, if the
 *                                 consumer repo separates SFC markup from centralised CSS
 *                                 (e.g. a `@use` re-export pointing at a sitebuilder partial).
 * @property {string} [i18nPrefix] i18n key prefix this component's copy should live under,
 *                                 if the consumer repo requires all copy to go through i18n.
 *
 * @typedef {Object} FlowContractState
 * One state in the feature's INTEGRATION contract — the platform/backend behaviour the UI
 * must react to, kept separate from `states` (which is purely visual/UI state) because a
 * production rebuild's backend is never 1:1 with the prototype's. This section says what
 * the UI needs FROM the platform, never how the platform is implemented.
 * @property {string} id
 * @property {string} trigger    What causes the platform to enter this state.
 * @property {string} outcome    What the UI must do in response.
 * @property {boolean} [isError] Marks this as an error/denied/failure branch.
 * @property {string[]} [tokens] Token names the outcome visually depends on (e.g. a
 *                                 disabled-state opacity/border token) — rare; most
 *                                 contract states are pure behaviour with no token of
 *                                 their own, which is why this is optional and empty by
 *                                 default.
 *
 * @typedef {Object} Flow
 * @property {string} slug     Kebab-case id (URL segment + docs/Handoff/<slug> pairing).
 * @property {string} title
 * @property {string} [summary]
 * @property {string[]} [stores]      Store keys this flow applies to (default: all registered).
 * @property {FlowComponent[]} components
 * @property {FlowState[]} states
 * @property {FlowTransition[]} transitions
 * @property {FlowBeat[]} choreography
 * @property {{component: Object, props?: Object}} [choreographyStage]
 *     Optional live visual stage for the Choreography tab's BeatTimeline —
 *     a component receiving `ms` (elapsed scrub time, plus any `props`
 *     given here) that renders the feature's ACTUAL visual state at that
 *     moment (e.g. a real cross-fade between two real components, driven by
 *     the same duration/easing tokens named in `choreography` above).
 *     Deliberately flow-specific, not a generic auto-render: a beat's
 *     `target` field is prose, not something safely mappable to a live
 *     component for an arbitrary flow. Without this, the tab still works —
 *     scrubbing/playing just has no visual proof beside the raw ms readout.
 * @property {string} [flowChart]     Mermaid flowchart source (§1.a equivalent), verbatim.
 * @property {string} [stateChart]    Mermaid stateDiagram-v2 source (§2.x.e equivalent), verbatim.
 * @property {Object.<string, FlowTarget>} [targets]   Component id -> production counterpart, per §FlowTarget above.
 * @property {FlowContractState[]} [contract]          The integration contract (see §FlowContractState above). Empty for UI-only features.
 * @property {string[]} [prototypeOnly]  Mocks/flags/scaffolding that exist ONLY to make this
 *                                        demoable in the prototype and must never be ported —
 *                                        e.g. a `simulate*` feature flag, a device-frame coupling,
 *                                        a localStorage stand-in for a real subscription.
 * @property {Object} [notes]         Authored judgment layer — the part a human writes.
 * @property {string} [notes.rationale]
 * @property {string[]} [notes.gotchas]
 * @property {string[]} [notes.openQuestions]
 * @property {string[]} [notes.buildOrder]
 * @property {string[]} [notes.prohibitions]
 *
 * @param {Flow} flow
 * @returns {Flow}
 */
export function defineFlow (flow) {
  if (import.meta.env.DEV) {
    const where = flow?.slug || flow?.title || '(unnamed flow)'
    if (!flow?.slug) console.warn(`[handoff] flow ${where} is missing a "slug"`)
    if (!Array.isArray(flow?.components) || flow.components.length === 0) {
      console.warn(`[handoff] flow ${where} has no "components"`)
    }
    if (!Array.isArray(flow?.states) || flow.states.length === 0) {
      console.warn(`[handoff] flow ${where} has no "states" — the state laydown will be empty`)
    }
    for (const c of flow?.components ?? []) {
      if (!Array.isArray(c.tokens) || c.tokens.length === 0) {
        console.warn(`[handoff] flow ${where}: component "${c.id}" declares no tokens`)
      }
    }
  }
  return {
    summary: '',
    stores: null, // null = all registered stores
    components: [],
    states: [],
    transitions: [],
    choreography: [],
    flowChart: '',
    stateChart: '',
    targets: {},
    contract: [],
    prototypeOnly: [],
    notes: { rationale: '', gotchas: [], openQuestions: [], buildOrder: [], prohibitions: [] },
    ...flow,
  }
}

/**
 * Union of every token name a flow's components declare — the "affected tokens" set,
 * computed, not curated. Contract states are behaviour-first and usually carry no
 * tokens; the rare ones that do (e.g. a denied state disabling a control) are included.
 */
export function affectedTokens (flow) {
  const set = new Set()
  for (const c of flow.components ?? []) for (const t of c.tokens ?? []) set.add(t)
  for (const t of flow.transitions ?? []) for (const m of t.motion ?? []) set.add(m)
  for (const b of flow.choreography ?? []) { if (b.duration) set.add(b.duration); if (b.easing) set.add(b.easing) }
  for (const s of flow.contract ?? []) for (const t of s.tokens ?? []) set.add(t)
  return [...set].sort()
}
