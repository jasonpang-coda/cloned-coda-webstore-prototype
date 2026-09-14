/**
 * rules.js — the drift rule catalogue. Each rule's `detect(ctx)` returns
 * DriftRow[]. `ctx` is the assembled model from build.js (see there for the
 * exact shape). Every rule cites the drift-audit.md finding it re-derives,
 * where one exists — that mapping is the acceptance test (see
 * scripts/token-audit.mjs's --check-drift-audit).
 */
import { isAllowlisted } from './allowlist.js'
import { tierRank } from './tier.js'

function grep (names, files) {
  const pattern = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  return `grep -nE -- "${pattern}" ${files.join(' ')}`
}

// D01 — dead theme override (the recurring specificity-trap regression).
function deadThemeOverride (ctx) {
  const rows = []
  for (const [name, decls] of ctx.declByName) {
    if (isAllowlisted(name, 'dead-override')) continue
    for (const d of decls) {
      if (d.store !== null && d.layer === 'base' && d.wins === false && d.losesTo) {
        rows.push({
          rule: 'D01',
          severity: 'error',
          title: 'Dead theme override',
          tokens: [name],
          store: d.store,
          message: `${name} is set inside a "${d.selector}" block in ${d.file}:${d.line}, but ${d.losesTo.file}:${d.losesTo.line} declares the same token at :root and wins (${d.losesTo.reason}). The theme override never applies — move it into an html[data-theme="${d.store}"] block, or drop it.`,
          evidence: [{ file: d.file, line: d.line }, { file: d.losesTo.file, line: d.losesTo.line }],
          grep: grep([name], [d.file, d.losesTo.file]),
          allowlisted: false,
          rediscovers: 'drift-audit.md §1',
        })
      }
    }
  }
  return rows
}

// D02 — prod-contract (semantic-family) token with no :root default, only
// declared in some theme files.
function noRootDefaultPartialCoverage (ctx) {
  const rows = []
  for (const [name, record] of ctx.tokens) {
    if (record.classify.tierRank !== 0) continue
    if (record.classify.hasContractDefault) continue
    const themeStores = [...new Set(record.declarations.filter((d) => d.store).map((d) => d.store))]
    if (themeStores.length === 0) continue
    if (isAllowlisted(name, 'no-root-default')) continue
    rows.push({
      rule: 'D02',
      severity: 'error',
      title: 'No :root default, partial store coverage',
      tokens: [name],
      message: `${name} has no default at :root and is declared in only ${themeStores.length} of ${ctx.storeKeys.length} stores (${themeStores.join(', ')}). Any other store rendering a consumer gets the CSS custom property's initial value (usually transparent/unset), not a themed value.`,
      coverage: { count: themeStores.length, total: ctx.storeKeys.length },
      evidence: record.declarations.filter((d) => d.store).map((d) => ({ file: d.file, line: d.line })),
      grep: grep([name], [...new Set(record.declarations.map((d) => d.file))]),
      allowlisted: false,
      rediscovers: 'drift-audit.md §2',
    })
  }
  return rows
}

// D03 / D03b — read but never declared anywhere (broken ref / fallback-only).
function readButUndeclared (ctx) {
  const rows = []
  for (const name of ctx.deadEnds.broken) {
    if (isAllowlisted(name, 'unread')) continue
    if (!name.startsWith('--x-')) continue
    rows.push({
      rule: 'D03',
      severity: 'error',
      title: 'Read but never declared',
      tokens: [name],
      message: `${name} is referenced by var() with no fallback but is declared nowhere in src/tokens.`,
      evidence: [],
      grep: grep([name], ['src/']),
      allowlisted: false,
    })
  }
  for (const name of ctx.deadEnds.fallbackOnly) {
    if (isAllowlisted(name, 'unread')) continue
    if (!name.startsWith('--x-')) continue
    rows.push({
      rule: 'D03b',
      severity: 'warn',
      title: 'Read only via a var() fallback, never declared',
      tokens: [name],
      message: `${name} is only ever seen as a var() fallback value — it is never declared, so the fallback is always what's used.`,
      evidence: [],
      grep: grep([name], ['src/']),
      allowlisted: false,
    })
  }
  return rows
}

// D04 — declared prod-contract token, unreachable from any consumer.
function unreachable (ctx) {
  const rows = []
  for (const [name, record] of ctx.tokens) {
    if (record.classify.bucket !== 'prod') continue
    if (record.usedAny) continue
    rows.push({
      rule: 'D04',
      severity: 'warn',
      title: 'Declared, unreachable from any consumer',
      tokens: [name],
      message: `${name} is declared but reached by nothing: no .vue reads it, nothing aliases it, no dynamic read, and no theme override changes anything reachable.`,
      evidence: record.declarations.filter((d) => d.selectorKind === 'root').map((d) => ({ file: d.file, line: d.line })),
      grep: grep([name], [...new Set(record.declarations.map((d) => d.file))]),
      allowlisted: false,
    })
  }
  return rows
}

// D05 — overridden by themes, consumed by nobody.
function overriddenUnconsumed (ctx) {
  const rows = []
  for (const [name, record] of ctx.tokens) {
    if (record.classify.bucket !== 'prod') continue
    const u = record.usage
    if (!u.theme.used) continue
    if (u.css.used || u.alias.used || u.js.used) continue
    rows.push({
      rule: 'D05',
      severity: 'warn',
      title: 'Overridden by themes, consumed by nobody',
      tokens: [name],
      message: `${name} is overridden by ${u.theme.stores.length} theme(s) (${u.theme.stores.join(', ')}) but read by nothing — those stores are maintaining a value with no visible effect.`,
      evidence: record.declarations.filter((d) => d.store).map((d) => ({ file: d.file, line: d.line })),
      grep: grep([name], [...new Set(record.declarations.map((d) => d.file))]),
      allowlisted: false,
      rediscovers: 'drift-audit.md §9',
    })
  }
  return rows
}

// D06 / D07 — tier violations (colour/size vs typography), signal-a reads
// of --x-sys-*/--x-palette-*/--x-ref-* from storefront component CSS.
function tierViolations (ctx) {
  const rows = []
  const TYPOGRAPHY_RE = /^--x-sys-(weight|size|font-family|letter-spacing|font-condense)/
  for (const ev of ctx.storefrontCssReads) {
    if (tierRank(ev.token) < 2) continue // 0=semantic (fine), 1=extension (fine, sanctioned)
    const isTypography = TYPOGRAPHY_RE.test(ev.token)
    const ruleId = isTypography ? 'D07' : 'D06'
    if (isAllowlisted(ev.token, 'tier-violation')) continue
    rows.push({
      rule: ruleId,
      severity: isTypography ? 'warn' : 'error',
      title: isTypography
        ? 'Typography tier violation — reads a font token instead of a text-style-* class'
        : 'Tier violation — component reads a raw sys/palette/ref token',
      tokens: [ev.token],
      message: isTypography
        ? `${ev.file}:${ev.line} reads ${ev.token} directly on property "${ev.property}" instead of applying a .text-style-* utility class.`
        : `${ev.file}:${ev.line} reads ${ev.token} directly (property "${ev.property}"), skipping the semantic tier.`,
      evidence: [{ file: ev.file, line: ev.line }],
      grep: grep([ev.token], [ev.file]),
      allowlisted: false,
      rediscovers: isTypography ? 'drift-audit.md §5' : 'drift-audit.md §3/§4/§6',
    })
  }
  return rows
}

// D08 family — component-local custom-property declarations.
function componentLocalDeclarations (ctx) {
  const rows = []
  for (const ld of ctx.localDeclarations) {
    if (ld.kind === 'minted') {
      rows.push({
        rule: 'D08',
        severity: 'warn',
        title: 'Component-minted pseudo-token',
        tokens: [ld.name],
        message: `${ld.file}:${ld.line} declares ${ld.name} — a --x- prefixed property that looks like a design token but is declared nowhere in src/tokens. Either rename it, or move it into the token system if it should be shared.`,
        evidence: [{ file: ld.file, line: ld.line }],
        grep: grep([ld.name], [ld.file]),
        allowlisted: false,
        rediscovers: 'drift-audit.md §10',
      })
    } else if (ld.kind === 'local-override') {
      rows.push({
        rule: 'D08b',
        severity: 'info',
        title: 'Local override of a real token',
        tokens: [ld.name],
        message: `${ld.file}:${ld.line} repoints ${ld.name} locally (a legitimate "inherit this button's brand fill" pattern) — not drift, informational only.`,
        evidence: [{ file: ld.file, line: ld.line }],
        grep: grep([ld.name], [ld.file]),
        allowlisted: false,
      })
    } else {
      rows.push({
        rule: 'D08c',
        severity: 'info',
        title: 'Local layout variable',
        tokens: [ld.name],
        message: `${ld.file}:${ld.line} declares ${ld.name} — an un-prefixed local layout/animation value, not a design token.`,
        evidence: [{ file: ld.file, line: ld.line }],
        grep: '',
        allowlisted: true,
      })
    }
  }
  return rows
}

// D10 — namespace collision: same family prefix spans two tiers with
// differing value shapes (one side var() aliases, the other raw literals).
function namespaceCollisions (ctx) {
  const rows = []
  const byFamily = new Map()
  for (const [name, record] of ctx.tokens) {
    const key = record.classify.family
    if (!byFamily.has(key)) byFamily.set(key, [])
    byFamily.get(key).push({ name, record })
  }
  for (const [family, members] of byFamily) {
    if (members.length < 2) continue
    const aliasGroup = members.filter((m) => m.record.declarations.some((d) => /var\(/.test(d.rawValue)))
    const literalGroup = members.filter((m) => m.record.declarations.length && m.record.declarations.every((d) => !/var\(/.test(d.rawValue)))
    if (aliasGroup.length && literalGroup.length) {
      const tokens = members.map((m) => m.name)
      rows.push({
        rule: 'D10',
        severity: 'info',
        title: 'Namespace collision across tiers',
        tokens,
        message: `The "${family}" family is used for both aliased semantic tokens (${aliasGroup.map((m) => m.name).join(', ')}) and raw-literal tokens (${literalGroup.map((m) => m.name).join(', ')}) — same prefix, different tier and meaning.`,
        evidence: [],
        grep: grep(tokens, ['src/tokens/ds/']),
        allowlisted: false,
        rediscovers: 'drift-audit.md §7',
      })
    }
  }
  return rows
}

// D12 — scale ladder gap (a family with an ordinal suffix missing an
// interior rung).
const LADDER = ['xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl']
function ladderGaps (ctx) {
  const rows = []
  const byPrefix = new Map()
  for (const [name] of ctx.tokens) {
    const m = name.match(/^(--x-[a-z-]+-)(xxxs|xxs|xs|s|m|l|xl|xxl|xxxl)$/)
    if (!m) continue
    if (!byPrefix.has(m[1])) byPrefix.set(m[1], new Set())
    byPrefix.get(m[1]).add(m[2])
  }
  for (const [prefix, rungs] of byPrefix) {
    if (rungs.size < 3) continue
    const present = LADDER.filter((r) => rungs.has(r))
    for (let i = 1; i < present.length; i++) {
      const a = LADDER.indexOf(present[i - 1])
      const b = LADDER.indexOf(present[i])
      if (b - a > 1) {
        const missing = LADDER.slice(a + 1, b)
        rows.push({
          rule: 'D12',
          severity: 'info',
          title: 'Scale ladder gap',
          tokens: [`${prefix}${present[i - 1]}`, `${prefix}${present[i]}`],
          message: `${prefix}* jumps from -${present[i - 1]} straight to -${present[i]}, skipping -${missing.join('/-')}.`,
          evidence: [],
          grep: grep([`${prefix.replace(/-$/, '')}`], ['src/tokens/ds/space.css']),
          allowlisted: false,
          rediscovers: 'drift-audit.md §8',
        })
      }
    }
  }
  return rows
}

// D13 — orphan theme file (no matching src/stores/<key>/ module).
function orphanThemes (ctx) {
  const rows = []
  for (const storeKey of ctx.storeKeys) {
    if (ctx.storeModuleKeys.includes(storeKey)) continue
    rows.push({
      rule: 'D13',
      severity: 'warn',
      title: 'Orphan theme file',
      tokens: [],
      message: `src/tokens/ds/themes/${storeKey}.css has no matching src/stores/${storeKey}/ module.`,
      evidence: [{ file: `src/tokens/ds/themes/${storeKey}.css`, line: 1 }],
      grep: `ls src/stores/${storeKey} 2>&1; echo "(should exist — it doesn't)"`,
      allowlisted: false,
    })
  }
  return rows
}

export const RULES = [
  { id: 'D01', run: deadThemeOverride },
  { id: 'D02', run: noRootDefaultPartialCoverage },
  { id: 'D03', run: readButUndeclared },
  { id: 'D04', run: unreachable },
  { id: 'D05', run: overriddenUnconsumed },
  { id: 'D06/D07', run: tierViolations },
  { id: 'D08', run: componentLocalDeclarations },
  { id: 'D10', run: namespaceCollisions },
  { id: 'D12', run: ladderGaps },
  { id: 'D13', run: orphanThemes },
]

export function runRules (ctx) {
  return RULES.flatMap((r) => r.run(ctx))
}
