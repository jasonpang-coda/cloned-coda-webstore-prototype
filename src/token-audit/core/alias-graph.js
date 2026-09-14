/**
 * alias-graph.js — the declared-value -> var() reference digraph, and the
 * transitive-reachability / cycle / dead-end analysis built on top of it.
 *
 * Edges come from DECLARED values (never resolved ones): for `P: <value>`,
 * every `var(--Q[, fallback])` inside `value` becomes an edge P -> Q. This
 * is what makes usage signal (b) — "aliased by another token" — transitive:
 * a --x-sys-* token consumed only through a --x-bg-* semantic still counts
 * as used, because reachability walks backward from the semantic's --x-sys-*
 * child through this graph.
 */

const VAR_REF_RE = /var\(\s*(--[a-zA-Z0-9-]+)\s*(?:,\s*([^)]+))?\)/g

/**
 * Build the alias graph for one store's winning base declarations.
 * `rawBase` is `{ name: declaredValue }` (pre-var()-resolution — from
 * cascade.js's `rawBase`). Returns { edges: Map<name, {to,viaFallback}[]>, nodes: Set }.
 */
export function buildAliasGraph (rawBase) {
  const edges = new Map()
  const nodes = new Set(Object.keys(rawBase))
  for (const [name, value] of Object.entries(rawBase)) {
    if (!value) continue
    const list = []
    let m
    const re = new RegExp(VAR_REF_RE)
    while ((m = re.exec(value))) {
      const to = m[1]
      nodes.add(to)
      list.push({ to, viaFallback: false })
      if (m[2]) {
        const fm = m[2].match(/(--[a-zA-Z0-9-]+)/)
        if (fm) { nodes.add(fm[1]); list.push({ to: fm[1], viaFallback: true }) }
      }
    }
    if (list.length) edges.set(name, list)
  }
  return { edges, nodes }
}

/**
 * Forward BFS from a seed set. Returns Map<name, { depth, via, provable }>.
 * A node reached only through a seed marked `provable:false` inherits
 * `provable:false` — this is how a dynamic (template-literal) read's
 * unprovability propagates through the alias chain instead of silently
 * laundering the whole family into "proven used".
 */
export function reachableFrom (graph, seeds) {
  const visited = new Map()
  const frontier = []
  for (const s of seeds) {
    if (!visited.has(s.name)) {
      visited.set(s.name, { depth: 0, via: null, provable: s.provable !== false })
      frontier.push(s.name)
    }
  }
  let i = 0
  while (i < frontier.length) {
    const name = frontier[i++]
    const cur = visited.get(name)
    const outEdges = graph.edges.get(name) || []
    for (const e of outEdges) {
      if (visited.has(e.to)) continue
      visited.set(e.to, { depth: cur.depth + 1, via: name, provable: cur.provable })
      frontier.push(e.to)
    }
  }
  return visited
}

/** Tarjan SCC — returns cycles as arrays of member names (size > 1, or a self-loop). */
export function findCycles (graph) {
  let index = 0
  const stack = []
  const onStack = new Set()
  const indices = new Map()
  const lowlink = new Map()
  const sccs = []

  function strongConnect (v) {
    indices.set(v, index)
    lowlink.set(v, index)
    index++
    stack.push(v)
    onStack.add(v)

    for (const e of graph.edges.get(v) || []) {
      const w = e.to
      if (!indices.has(w)) {
        strongConnect(w)
        lowlink.set(v, Math.min(lowlink.get(v), lowlink.get(w)))
      } else if (onStack.has(w)) {
        lowlink.set(v, Math.min(lowlink.get(v), indices.get(w)))
      }
    }

    if (lowlink.get(v) === indices.get(v)) {
      const scc = []
      let w
      do {
        w = stack.pop()
        onStack.delete(w)
        scc.push(w)
      } while (w !== v)
      // Self-loop check: a size-1 SCC is a cycle only if it has a self-edge.
      const selfLoop = scc.length === 1 && (graph.edges.get(scc[0]) || []).some((e) => e.to === scc[0])
      if (scc.length > 1 || selfLoop) sccs.push(scc)
    }
  }

  for (const v of graph.nodes) {
    if (!indices.has(v)) strongConnect(v)
  }
  return sccs
}

/**
 * Classify every name that appears as a var() TARGET but is not declared
 * anywhere. `declaredNames` = Set of names declared in ANY store.
 * Returns { broken: string[], fallbackOnly: string[] }.
 */
export function classifyDeadEnds (graph, declaredNames) {
  const broken = []
  const fallbackOnly = []
  const hasFallback = new Map() // name -> true if ever referenced with a fallback
  for (const [, list] of graph.edges) {
    for (const e of list) {
      if (e.viaFallback) hasFallback.set(e.to, true)
    }
  }
  for (const name of graph.nodes) {
    if (declaredNames.has(name)) continue
    if (!name.startsWith('--x-') && !name.startsWith('--')) continue
    if (hasFallback.get(name)) fallbackOnly.push(name)
    else broken.push(name)
  }
  return { broken, fallbackOnly }
}
