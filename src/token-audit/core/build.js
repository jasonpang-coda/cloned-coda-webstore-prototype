/**
 * build.js — the single entry point. Assembles every core module into one
 * `AuditModel`: token-by-token records, rollup stats, and drift findings.
 * No I/O, no Vue, no `import.meta` — takes source text, returns data.
 * Called identically by scripts/token-audit.mjs (readFileSync sources) and
 * src/token-audit/sources.js (import.meta.glob sources) in the browser.
 */
import { buildDeclarationUniverse, buildCascadeForStore, ROOT_TIER_FILES, PROD_CONTRACT_FILES } from './cascade.js'
import { buildAliasGraph, reachableFrom, classifyDeadEnds } from './alias-graph.js'
import { scanFile, scanCssSourceForReads, scanTextStyleClasses } from './consumers.js'
import { classifyToken, isDevChromeFile } from './classify.js'
import { runRules } from './rules.js'
import { stat } from './rollup.js'

function storeKeyFromThemeFile (file) {
  const m = file.match(/^ds\/themes\/([a-z0-9]+)\.css$/)
  return m ? m[1] : null
}

/**
 * @param {object} sources
 * @param {{file:string, text:string}[]} sources.tokenCss - every file under
 *   src/tokens/, path relative to src/tokens/ (e.g. 'ds/system.css',
 *   'ds/themes/codm.css', 'light.css').
 * @param {{file:string, text:string}[]} sources.vue - every .vue file, path
 *   relative to repo root (e.g. 'src/components/SkuCard.vue').
 * @param {{file:string, text:string}[]} sources.js - every .js file under
 *   src/, same path convention.
 * @param {string[]} sources.storeModuleKeys - keys with a src/stores/<key>/
 *   module (for the orphan-theme rule).
 */
export function buildAudit (sources) {
  const { tokenCss, vue = [], js = [], storeModuleKeys = [] } = sources

  const storeKeys = tokenCss
    .map((s) => storeKeyFromThemeFile(s.file))
    .filter(Boolean)
    .sort()

  const universe = buildDeclarationUniverse(tokenCss)

  const cascades = {}
  for (const storeKey of storeKeys) {
    cascades[storeKey] = buildCascadeForStore(universe, storeKey, [`ds/themes/${storeKey}.css`, ...ROOT_TIER_FILES])
  }

  // Declarations by name, across all stores, root entries deduped.
  const declByName = new Map()
  const seenRootKey = new Set()
  for (const storeKey of storeKeys) {
    for (const d of cascades[storeKey].declarations) {
      if (d.store === null) {
        const key = `${d.file}:${d.line}:${d.selector}`
        if (seenRootKey.has(key)) continue
        seenRootKey.add(key)
      }
      if (!declByName.has(d.name)) declByName.set(d.name, [])
      declByName.get(d.name).push(d)
    }
  }
  const declaredNames = new Set(declByName.keys())

  // Union alias graph across every store (a token is reachable if it's
  // reachable in AT LEAST ONE store's cascade).
  const unionEdges = new Map()
  const unionNodes = new Set()
  for (const storeKey of storeKeys) {
    const g = buildAliasGraph(cascades[storeKey].rawBase)
    for (const n of g.nodes) unionNodes.add(n)
    for (const [name, list] of g.edges) {
      if (!unionEdges.has(name)) unionEdges.set(name, [])
      const existing = unionEdges.get(name)
      for (const e of list) {
        if (!existing.some((x) => x.to === e.to && x.viaFallback === e.viaFallback)) existing.push(e)
      }
    }
  }
  const graph = { edges: unionEdges, nodes: unionNodes }
  const deadEnds = classifyDeadEnds(graph, declaredNames)

  // Internal DS consumers: non-:root rules inside token CSS files
  // (text-styles.css's .text-style-* classes, effects.css's .fx-* classes,
  // keyframes.css, materials.css) that read tokens via var().
  const internalCssReads = tokenCss.flatMap((s) => scanCssSourceForReads(s.file, s.text))

  // Component reads + local declarations.
  const allReads = []
  const localDeclarations = []
  for (const s of vue) {
    const { reads, declarations } = scanFile(s.file, s.text, 'vue', declaredNames)
    allReads.push(...reads)
    localDeclarations.push(...declarations)
  }
  for (const s of js) {
    const { reads } = scanFile(s.file, s.text, 'js', declaredNames)
    allReads.push(...reads)
  }

  // Expand dynamic template-literal PREFIX reads (e.g. `--x-size-img-`) into
  // one non-provable read per matching declared name, so those tokens don't
  // read as unused, but are flagged as not statically provable.
  const dynamicPrefixReads = allReads.filter((r) => r.signal === 'c' && r.kind === 'template-literal')
  for (const pr of dynamicPrefixReads) {
    for (const name of declaredNames) {
      if (name.startsWith(pr.token)) {
        allReads.push({ token: name, signal: 'c', file: pr.file, line: pr.line, kind: 'template-literal', provable: false, pattern: pr.pattern })
      }
    }
  }

  const storefrontCssReads = allReads.filter((r) => r.signal === 'a' && !isDevChromeFile(r.file))
  const devChromeCssReads = allReads.filter((r) => r.signal === 'a' && isDevChromeFile(r.file))

  const seedsStorefront = [
    ...storefrontCssReads.map((r) => ({ name: r.token, provable: true })),
    ...allReads.filter((r) => r.signal === 'c').map((r) => ({ name: r.token, provable: r.provable })),
    ...internalCssReads.map((r) => ({ name: r.token, provable: true })),
  ]
  const reachableStorefront = reachableFrom(graph, seedsStorefront)

  const seedsDevChrome = devChromeCssReads.map((r) => ({ name: r.token, provable: true }))
  const reachableDevChrome = reachableFrom(graph, seedsDevChrome)

  // Per-token records.
  const tokens = new Map()
  for (const name of declaredNames) {
    const decls = declByName.get(name) || []
    const classify = classifyToken(name, decls)

    const cssAll = allReads.filter((r) => r.token === name && r.signal === 'a')
    const cssStorefront = cssAll.filter((r) => !isDevChromeFile(r.file))
    const cssDevChrome = cssAll.filter((r) => isDevChromeFile(r.file))
    const jsReads = allReads.filter((r) => r.token === name && r.signal === 'c')
    const themeStores = [...new Set(decls.filter((d) => d.store).map((d) => d.store))]

    const reach = reachableStorefront.get(name)
    // "Aliased" (signal b) means reachable in the graph WITHOUT being a
    // direct component css read itself. A token can be a depth-0 seed for
    // two different reasons: (1) a storefront component reads it directly
    // (already counted by `css`, above — don't double-count), or (2) it's
    // consumed only by the design system's own internal CSS (e.g.
    // text-styles.css's `.text-style-*` classes reading
    // --x-sys-font-family-*) — that's real usage with no component in the
    // chain, so it must still count as "used", just not via signal (a).
    const aliasUsed = !!reach && cssStorefront.length === 0

    const usage = {
      css: { used: cssStorefront.length > 0, sites: cssStorefront },
      alias: { used: aliasUsed, parents: reach?.via ? [reach.via] : [], provable: reach?.provable !== false },
      js: { used: jsReads.length > 0, provable: jsReads.some((r) => r.provable), sites: jsReads },
      theme: { used: themeStores.length > 0, stores: themeStores, count: themeStores.length },
    }
    const usedAny = usage.css.used || usage.alias.used || usage.js.used
    const usedStatically = usage.css.used || usage.alias.used
    const devChromeOnly = !usedAny && (cssDevChrome.length > 0 || (!reach && reachableDevChrome.has(name)))

    tokens.set(name, {
      name,
      classify,
      declarations: decls,
      usage,
      usedAny,
      usedStatically,
      devChromeOnly,
      consumers: [...new Set(cssStorefront.map((r) => r.file))],
    })
  }

  const ctx = {
    tokens, declByName, storeKeys, cascades, graph, deadEnds,
    storefrontCssReads, localDeclarations, storeModuleKeys,
  }
  const drift = runRules(ctx)

  return assembleModel({ tokens, drift, storeKeys, cascades, localDeclarations, storeModuleKeys, declByName })
}

function assembleModel ({ tokens, drift, storeKeys, cascades, localDeclarations, storeModuleKeys, declByName }) {
  const all = [...tokens.values()]
  const prod = all.filter((t) => t.classify.bucket === 'prod')
  const prototype = all.filter((t) => t.classify.bucket === 'prototype')

  const usedOf = (list) => stat(list.filter((t) => t.usedAny).length, list.length)
  const bySignal = (list, key) => stat(list.filter((t) => t.usage[key].used).length, list.length)

  const families = new Map()
  for (const t of prod) {
    if (!families.has(t.classify.family)) families.set(t.classify.family, [])
    families.get(t.classify.family).push(t)
  }
  const familyStats = [...families.entries()]
    .map(([family, list]) => ({ family, ...usedOf(list), used: usedOf(list) }))
    .sort((a, b) => a.pct - b.pct)

  const tierGroups = new Map()
  for (const t of prod) {
    if (!tierGroups.has(t.classify.tier)) tierGroups.set(t.classify.tier, [])
    tierGroups.get(t.classify.tier).push(t)
  }

  const localByKind = {
    minted: localDeclarations.filter((d) => d.kind === 'minted'),
    localOverride: localDeclarations.filter((d) => d.kind === 'local-override'),
    layoutVar: localDeclarations.filter((d) => d.kind === 'layout-var'),
  }

  const driftBySeverity = {
    error: drift.filter((d) => d.severity === 'error'),
    warn: drift.filter((d) => d.severity === 'warn'),
    info: drift.filter((d) => d.severity === 'info'),
  }

  const perStore = {}
  for (const storeKey of storeKeys) {
    const c = cascades[storeKey]
    const overrideDecls = c.declarations.filter((d) => d.store === storeKey && d.layer === 'base')
    const deadOverrides = overrideDecls.filter((d) => d.wins === false)
    perStore[storeKey] = {
      overrideCount: new Set(overrideDecls.map((d) => d.name)).size,
      deadOverrideCount: new Set(deadOverrides.map((d) => d.name)).size,
      orphan: !storeModuleKeys.includes(storeKey),
    }
  }

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      stores: storeKeys,
      tokenCount: { declared: tokens.size, prod: prod.length, prototype: prototype.length },
    },
    tokens,
    stats: {
      universe: { declared: tokens.size, prodContract: prod.length, prototypeOnly: prototype.length },
      contract: {
        prod: usedOf(prod),
        prototype: usedOf(prototype),
      },
      usage: {
        usedAny: usedOf(prod),
        unused: stat(prod.filter((t) => !t.usedAny).length, prod.length),
        bySignal: {
          css: bySignal(prod, 'css'),
          alias: bySignal(prod, 'alias'),
          js: bySignal(prod, 'js'),
          theme: bySignal(prod, 'theme'),
        },
        devChromeOnly: stat(prod.filter((t) => t.devChromeOnly).length, prod.length),
      },
      families: familyStats,
      tiers: [...tierGroups.entries()].map(([tier, list]) => ({ tier, ...usedOf(list) })),
      drift: {
        total: stat(drift.length, drift.length || 1),
        bySeverity: {
          error: driftBySeverity.error.length,
          warn: driftBySeverity.warn.length,
          info: driftBySeverity.info.length,
        },
      },
      local: {
        minted: stat(localByKind.minted.length, localDeclarations.length || 1),
        localOverride: stat(localByKind.localOverride.length, localDeclarations.length || 1),
        layoutVar: stat(localByKind.layoutVar.length, localDeclarations.length || 1),
        total: localDeclarations.length,
      },
    },
    drift,
    driftBySeverity,
    localDeclarations,
    localByKind,
    perStore,
  }
}
