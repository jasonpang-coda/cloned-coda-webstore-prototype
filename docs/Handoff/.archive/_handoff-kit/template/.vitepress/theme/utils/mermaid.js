// GENERIC kit util — shared Mermaid loader + node-id extraction for
// StateDiagram.vue and FlowDiagram.vue. Mermaid needs `document`, so the
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

// Appends a highlight class binding for the active node — never mutates the
// caller's chart string, since that's the one authored (or spec-sourced) value.
export function withActiveClass(chart, activeId) {
  if (!activeId) return chart
  const id = activeId.replace(/[^\w-]/g, '_')
  return `${chart}\nclassDef active fill:#f7b955,stroke:#7a5b00,stroke-width:2px,color:#111\nclass ${id} active`
}
