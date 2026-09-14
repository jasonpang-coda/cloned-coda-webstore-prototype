// Shared Mermaid loader + node-id extraction for StateDiagram.vue and
// FlowDiagram.vue (ported from docs/Handoff/_handoff-kit — mermaid is a
// dev-only diagram renderer, no design-token concerns). Mermaid needs
// `document`, so the
// import is lazy and only resolves in the browser (SSR gets `null`).

let mermaidPromise = null

export function loadMermaid() {
  if (typeof document === 'undefined') return Promise.resolve(null)
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((mod) => {
      const mermaid = mod.default
      mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' })
      return mermaid
    })
  }
  return mermaidPromise
}

// Pulls every node id referenced on either side of a `-->` edge, stripping
// flowchart shape syntax (`id["label"]`, `id(label)`, `id{label}`) and state
// syntax (`[*]` start/end markers, which this regex naturally skips since
// they aren't `\w`).
export function extractNodeIds(chart) {
  const ids = new Set()
  for (const m of chart.matchAll(/([\w-]+)(?:\[[^\]]*\]|\([^)]*\)|\{[^}]*\})?\s*-->/g)) ids.add(m[1])
  for (const m of chart.matchAll(/-->\s*(?:\|[^|]*\|\s*)?([\w-]+)/g)) ids.add(m[1])
  return [...ids]
}

// Highlights the active node WITHOUT a mermaid re-render — toggling a CSS
// class on the already-rendered SVG's node group is instant and flash-free;
// re-running mermaid.render() (the old approach, baking a `classDef active`
// into the chart source and re-rendering the whole diagram) tears down and
// rebuilds the entire SVG just to recolor one node, which is what caused the
// visible flash every time a state was selected/deselected. Call this after
// the diagram is in the DOM, and again whenever activeId changes — never on
// every render() (the chart source itself doesn't need touching).
export function applyActiveHighlight(container, nodeIds, activeId) {
  if (!container) return
  for (const id of nodeIds) {
    const el = [...container.querySelectorAll('.node[id]')].find((n) => n.id.includes(id))
    el?.classList.toggle('is-active-state', id === activeId)
  }
}

/**
 * Bind a click handler to a rendered diagram's SVG nodes by delegation,
 * instead of mermaid's own `click id call callback()` directive. That
 * directive is flowchart-only in practice — stateDiagram-v2's grammar accepts
 * `click id href "url"` but not `call`, so injecting it there throws a parse
 * error ("Expecting 'STRING', 'HREF', got 'ID'"). Delegation works
 * identically for both diagram types and needs nothing from the chart source.
 *
 * Mermaid consistently embeds the user-given node id inside the generated
 * DOM id of each `.node` group (e.g. "flowchart-trigger-3",
 * "state-open_empty_query-2"), so matching by substring against the known
 * node id list is stable across mermaid versions without depending on its
 * internal id format.
 *
 * @param {HTMLElement} container  The element holding the rendered SVG.
 * @param {string[]} nodeIds       Ids extracted via extractNodeIds().
 * @param {(id: string) => void} onSelect
 * @returns {() => void} cleanup — call on unmount / before re-render.
 */
export function bindNodeClicks(container, nodeIds, onSelect) {
  if (!container) return () => {}
  function handler(e) {
    const nodeEl = e.target.closest?.('.node[id]')
    if (!nodeEl) return
    const domId = nodeEl.id
    const match = nodeIds.find((id) => domId.includes(id))
    if (match) onSelect(match)
  }
  container.addEventListener('click', handler)
  return () => container.removeEventListener('click', handler)
}
