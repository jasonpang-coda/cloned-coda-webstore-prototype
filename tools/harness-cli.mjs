#!/usr/bin/env node
/**
 * tools/harness-cli.mjs — Headless Agentic Design Harness CLI
 *
 * Provides a high-speed, headless testing and verification bench for components:
 * 1. Sweeps components across all 12 store themes to verify zero unresolved tokens.
 * 2. Verifies container query discipline.
 * 3. Contrast sanity — `--x-text-*`/`--sys-text-*` tokens the component consumes,
 *    paired against `--x-bg-*`/`--sys-bg-*` tokens it also consumes, resolved per
 *    store and checked against WCAG 2.1 via @coda/inspect-kit's contrastInfo (the same
 *    math the live inspector uses — see the color-math gotcha below). A pair that
 *    fails even the large-text threshold (ratio < 3) is a hard failure; a pair that
 *    only clears large-text (3 ≤ ratio < 4.5) is a non-blocking warning, since the
 *    static sweep has no way to know the actual rendered font size/weight for a given
 *    pairing. A component doesn't declare *which* text token sits on *which*
 *    background token, so pairing is name-based (shouldPair, below) rather than the
 *    true DOM nesting: a plain first pass paired EVERY consumed text token against
 *    EVERY consumed bg token and produced 1000+ false positives against this repo's
 *    real vocabulary (e.g. a "-inverse" text tone read as broken against a plain
 *    "--x-bg-navbar" it never actually renders on) — shouldPair only tests a pair
 *    when the trailing state/tone modifier matches (both "-inverse", both
 *    "-default", …) or a plain-toned text token against an unmodified base surface.
 *    Expect some real pairs to still go untested (this is deliberately narrower, not
 *    wider, than the true set) — use a story's `contrastWaivers: ['--x-text-a:--x-bg-b']`
 *    to suppress a specific false positive that does slip through. This also doesn't
 *    composite translucent backgrounds (same documented approximation as inspect-kit's
 *    own effectiveBackground) — a semi-transparent `--x-bg-*` is checked against its
 *    own value, not what's actually behind it.
 *
 * This is a STATIC token-resolution sweep only — token resolution doesn't
 * vary by viewport width, so there is no width dimension here. Width-
 * dependent rendering (container-query breaks) is covered by the render gate
 * (harness-render.mjs), which actually renders each variant at 3 widths.
 *
 * Usage:
 *   node tools/harness-cli.mjs test [ComponentName|all] [--sweep-themes] [--json]
 *   node tools/harness-cli.mjs list [--json]
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveTokensForStore } from '../scripts/resolve-css.mjs'
import { getAllTokens } from './token-cli.mjs'
import { getComponentConsumedTokens } from './lib/component-tokens.mjs'
import { normalizeColor } from './lib/color.mjs'
import { contrastInfo } from '@coda/inspect-kit'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const STORIES_DIR = path.join(ROOT, 'src/library/stories')
const THEMES_DIR = path.join(ROOT, 'src/tokens/ds/themes')
const COMPONENTS_DIR = path.join(ROOT, 'src/components')

const STORES = [
  'codm',
  'fcm',
  'efootball',
  'tdr',
  'ygodl',
  'roguetrader',
  'mgsse',
  'pvz3',
  'ygomd',
  'codashop',
  'diabloimmortal',
  'zzz'
]

/**
 * Extract the substring of `content` inside the array that follows
 * `${key}: [`, tracking bracket depth so a nested array/object inside the
 * block (e.g. a variant's own `props: (...) => ({...})`) doesn't truncate
 * the extraction early. Returns null if the key isn't found or the brackets
 * never balance.
 */
function extractBalancedArrayBlock(content, key) {
  const startMatch = content.match(new RegExp(`${key}\\s*:\\s*\\[`))
  if (!startMatch) return null
  let depth = 1
  let i = startMatch.index + startMatch[0].length
  const bodyStart = i
  for (; i < content.length && depth > 0; i++) {
    if (content[i] === '[') depth++
    else if (content[i] === ']') depth--
  }
  if (depth !== 0) return null
  return content.slice(bodyStart, i - 1)
}

/**
 * Extract the substring of `content` inside the parentheses of the first
 * `${fnName}(...)` call, tracking paren depth so nested calls/objects inside
 * the arguments (e.g. an inline `props: (assets) => ({...})` factory) don't
 * truncate the extraction early. Returns null if the call isn't found or the
 * parens never balance.
 */
function extractBalancedCallBlock(content, fnName) {
  const startMatch = content.match(new RegExp(`${fnName}\\s*\\(`))
  if (!startMatch) return null
  let depth = 1
  let i = startMatch.index + startMatch[0].length
  const bodyStart = i
  for (; i < content.length && depth > 0; i++) {
    if (content[i] === '(') depth++
    else if (content[i] === ')') depth--
  }
  if (depth !== 0) return null
  return content.slice(bodyStart, i - 1)
}

// A resolved oklch(...) value's alpha, or 1 (opaque) if it has none/isn't
// parseable. Used to skip a genuinely translucent bg token from the contrast
// check rather than silently mis-scoring it — see hexToRgbString's doc: we
// can't composite what's actually behind a translucent fill (e.g.
// --x-bg-action-tertiary is a deliberate 10%-opacity "frost" over a dark
// surface — treating it as opaque near-white against near-white text
// produced a guaranteed, spurious ~1:1 "fail" in every store).
function alphaOf(resolvedValue) {
  const m = /oklch\([^)]*\/\s*([\d.]+)(%?)\s*\)/i.exec(String(resolvedValue))
  if (!m) return 1
  const raw = Number(m[1])
  return m[2] ? raw / 100 : raw
}

// Known trailing state/tone modifiers a --x-text-*/--x-bg-* token name ends
// in. A token whose last segment isn't one of these is treated as an
// "unmodified base surface" (e.g. --x-bg-navbar, --x-bg-page, --x-bg-sheet).
const KNOWN_MODIFIERS = new Set([
  'default', 'hover', 'pressed', 'selected', 'disabled', 'focused', 'active',
  'subtle', 'soft', 'dim', 'strong', 'muted', 'faint', 'placeholder',
  'inverse', 'success', 'error', 'warning', 'brand', 'neutral',
  'positive', 'destructive', 'caution', 'highlighted', 'highlight', 'prominent',
  'primary', 'secondary', 'tertiary', 'alt', 'bonus', 'subtitle', 'signin',
])

function modifierOf(token) {
  const last = token.slice(token.lastIndexOf('-') + 1)
  return KNOWN_MODIFIERS.has(last) ? last : null
}

// "Normal reading" text tones — the ones legitimately expected to sit on a
// plain, unmodified surface (a bare --x-bg-navbar/--x-bg-page/--x-bg-sheet,
// with no state/tone suffix of its own). Deliberately excludes 'inverse' and
// the semantic-state tones (success/error/warning/…): those are authored to
// sit on a MATCHING background (an inverse action surface, an error banner),
// never on a plain default-toned surface — pairing them against one is
// exactly the false-positive shape a naive cartesian sweep produced (e.g.
// --x-text-header-inverse read as broken on --x-bg-navbar in every store,
// when in the real UI that text never renders there at all).
// Deliberately excludes `null` (an unrecognized, one-off trailing word like
// "-popular" or "-amount") — a token whose suffix isn't a known reading tone
// is more likely a distinct, narrowly-scoped label than a generic body/header
// tone, so it's left unpaired rather than guessed onto every bare surface.
const BASE_SURFACE_TEXT_TONES = new Set(['default', 'subtle', 'soft', 'dim', 'muted', 'faint'])

/**
 * Should `textToken` be checked against `bgToken` at all? A token pair is
 * only tested when there's real name-based evidence they're meant to
 * co-occur — same trailing modifier (both "-inverse", both "-default", …),
 * or a plain-toned text token against a background with no modifier of its
 * own. Anything else (e.g. an "-inverse" text token against an unmodified
 * base surface, or two unrelated semantic states) is left unpaired rather
 * than guessed at — see the file-header doc's note on this being narrower
 * than the true DOM pairing, on purpose, after an unconstrained cartesian
 * product produced over a thousand false positives against this repo's real
 * token vocabulary.
 */
function shouldPair(textToken, bgToken) {
  const tMod = modifierOf(textToken)
  const bMod = modifierOf(bgToken)
  if (tMod !== null && tMod === bMod) return true
  if (bMod === null && BASE_SURFACE_TEXT_TONES.has(tMod)) return true
  return false
}

/**
 * hex ('#rrggbb' or '#rrggbbaa') -> 'rgb(r, g, b)', for handing off to
 * @coda/inspect-kit's contrastInfo, whose parseRgb only understands
 * rgb()/rgba() strings (not hex, not oklch — this repo's token values are
 * oklch(...), so the caller normalizes to hex via tools/lib/color.mjs first).
 * Alpha is intentionally dropped here, not composited — see the file-header
 * doc's note on translucent backgrounds.
 */
function hexToRgbString(hex) {
  if (!hex || hex.length < 7) return null
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  if ([r, g, b].some(Number.isNaN)) return null
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * Discovers and parses story metadata from disk
 */
export function loadAllStories() {
  if (!existsSync(STORIES_DIR)) return []
  const files = readdirSync(STORIES_DIR).filter((f) => f.endsWith('.stories.js'))

  return files.map((file) => {
    const fullPath = path.join(STORIES_DIR, file)
    const content = readFileSync(fullPath, 'utf8')

    // Scope id/title/group extraction to the defineStory({...}) call itself,
    // not a first-match scan of the whole file — a file that builds demo data
    // with its own `title:`/`id:` object-literal keys above the defineStory()
    // call (e.g. a wrapper composing several real cards) would otherwise have
    // those literal values misattributed as the story's own id/title.
    const defineStoryBlock = extractBalancedCallBlock(content, 'defineStory') ?? content

    const idMatch = defineStoryBlock.match(/id:\s*['"`]([^'"`]+)['"`]/)
    const titleMatch = defineStoryBlock.match(/title:\s*['"`]([^'"`]+)['"`]/)
    const groupMatch = defineStoryBlock.match(/group:\s*['"`]([^'"`]+)['"`]/)
    const compMatch = content.match(/import\s+([A-Za-z0-9_$]+)\s+from\s+['"`]@\/components\/([^'"`]+\.vue)['"`]/)

    // Extract variants — scoped to the variants: [...] block itself (via
    // bracket-depth tracking), not a `name:` scan of the whole file, which
    // would also pick up an unrelated `name:` prop inside a variant's own
    // `props: (...) => ({...})` factory.
    const variantsBlock = extractBalancedArrayBlock(content, 'variants')
    const variantMatches = variantsBlock
      ? [...variantsBlock.matchAll(/name:\s*['"`]([^'"`]+)['"`]/g)].map((m) => m[1])
      : []

    // Extract states
    const statesMatch = content.match(/states:\s*\[([^\]]+)\]/)
    const states = statesMatch
      ? statesMatch[1].replace(/['"`\s]/g, '').split(',').filter(Boolean)
      : ['default']

    // Extract explicit tokens
    const tokensMatch = content.match(/tokens:\s*\[([^\]]+)\]/)
    const explicitTokens = tokensMatch
      ? tokensMatch[1].replace(/['"`\s]/g, '').split(',').filter(Boolean)
      : []

    // Explicit, human-authored acknowledgement that a component genuinely
    // consumes zero --x-/--sys- design tokens (e.g. MaterialIcon inherits
    // colour via `currentColor` rather than a token; Media has no <style>
    // block at all). Without this flag NO_TOKENS_TESTED fails loud on
    // purpose — see the comment at that check below — so a real token-free
    // atom needs a deliberate opt-out, not a silent skip.
    const tokenFree = /tokenFree:\s*true/.test(content)

    // Explicit, human-authored acknowledgement that a component has no
    // interactive affordance (icon, static banner, layout primitive) — see
    // story.js's doc. Without it, a story left at the default
    // states: ['default'] gets a non-blocking STATE_COVERAGE_WARNING below.
    const presentational = /presentational:\s*true/.test(content)

    // Explicit, human-authored acknowledgement that a specific text/bg token
    // pair the contrast sweep would otherwise flag is not a real UI (the
    // sweep pairs every consumed text token against every consumed bg token,
    // cartesian-product style, since a component doesn't declare which text
    // sits on which background) — format is '<textToken>:<bgToken>'.
    const contrastWaiversBlock = extractBalancedArrayBlock(content, 'contrastWaivers')
    const contrastWaivers = new Set(
      contrastWaiversBlock
        ? [...contrastWaiversBlock.matchAll(/['"`]([^'"`]+)['"`]/g)].map((m) => m[1])
        : []
    )

    const componentName = compMatch ? compMatch[1] : file.replace(/\.stories\.js$/, '')
    const componentFile = compMatch ? compMatch[2] : `${componentName}.vue`

    // See story.js's doc — an explicit index/name, else the capture rig
    // (tools/harness-capture.mjs) falls back to the LAST variant.
    const captureVariantMatch = content.match(/captureVariant:\s*(\d+|['"`]([^'"`]+)['"`])/)
    const captureVariant = captureVariantMatch
      ? (captureVariantMatch[2] ?? Number(captureVariantMatch[1]))
      : null

    return {
      file,
      id: idMatch ? idMatch[1] : file.replace(/\.stories\.js$/, '').toLowerCase(),
      title: titleMatch ? titleMatch[1] : componentName,
      group: groupMatch ? groupMatch[1] : 'Components',
      componentName,
      componentFile,
      variants: variantMatches.length > 0 ? variantMatches : ['Default'],
      captureVariant,
      states,
      explicitTokens,
      tokenFree,
      presentational,
      contrastWaivers
    }
  })
}

/**
 * Run Headless Harness Tests for a Story
 */
function testStory(story) {
  const consumed = getComponentConsumedTokens(path.join(COMPONENTS_DIR, story.componentFile))
  const tokenMap = new Map()
  for (const c of consumed) tokenMap.set(c.name, c.fallback)
  for (const t of story.explicitTokens) {
    if (!tokenMap.has(t)) tokenMap.set(t, null)
  }

  const allTokenNames = [...tokenMap.keys()]

  // Contrast pairing candidates. `--x-bg-indicator-*`/`--sys-bg-indicator-*`
  // are excluded outright — in this design system they're small decorative
  // dot/pip/hover-highlight fills (nav item indicators, milestone dots, list
  // hover backgrounds; see BundleItem.vue, NavBar.vue, MilestoneRewardsRail.vue),
  // never a surface a component's own body/header/status text actually
  // renders on, so pairing them by a coincidentally-matching "-default"
  // suffix was pure noise.
  const textTokens = allTokenNames.filter((t) => /^--(x|sys)-text-/.test(t))
  const bgTokens = allTokenNames.filter((t) => /^--(x|sys)-bg-/.test(t) && !/^--(x|sys)-bg-indicator-/.test(t))

  const results = {
    story: story.title,
    component: story.componentName,
    variantsCount: story.variants.length,
    states: story.states,
    tokensTested: allTokenNames.length,
    themeMatrix: {},
    failures: [],
    contrastWarnings: [],
    stateCoverageWarnings: [],
    optionalOverrides: []
  }

  // 0. A story testing zero tokens isn't verifying anything — fail loud
  // rather than silently reporting a clean pass with tokensTested: 0,
  // UNLESS the story explicitly acknowledges it via `tokenFree: true`
  // (a deliberate human confirmation, not an auto-detected silent pass).
  if (allTokenNames.length === 0 && !story.tokenFree) {
    results.failures.push({
      type: 'NO_TOKENS_TESTED',
      message: `${story.title} consumes and declares zero design tokens — nothing was actually swept across store themes. If this is intentional (a token-free component), confirm rather than trusting a silent pass (add tokenFree: true to the story).`
    })
  }

  // 0b. A story left at the default states: ['default'] never gets its
  // hover/focus/pressed/disabled pseudo-states simulated — no interaction
  // feedback is verified at all. Non-blocking (a warning, not a failure):
  // unlike NO_TOKENS_TESTED, "only default" is the correct answer for a
  // presentational component, not a mistake — so this surfaces a backlog to
  // triage rather than demanding every one of the 86 stories react to it.
  // `presentational: true` is the deliberate opt-out, same pattern as
  // `tokenFree` — see story.js's doc.
  if (story.states.length === 1 && story.states[0] === 'default' && !story.presentational) {
    results.stateCoverageWarnings.push({
      type: 'SINGLE_STATE_COVERAGE',
      message: `${story.title} only declares states: ['default'] — hover/focus/pressed/disabled are never simulated. If this component genuinely has no interactive affordance, confirm rather than leaving it unstated (add presentational: true to the story); otherwise author the missing states.`
    })
  }

  // 1. Container query discipline check
  const compPath = path.join(COMPONENTS_DIR, story.componentFile)
  if (existsSync(compPath)) {
    const compContent = readFileSync(compPath, 'utf8')
    // Check each @media occurrence individually — a file-wide substring
    // check for 'prefers-reduced-motion' exempted every @media in the file
    // as soon as ANY of them (anywhere, even unrelated) mentioned it.
    // [^{;\n]* (not [^{]*) keeps the match on one line — an unrelated
    // "@media" mentioned in a /* comment */ has no brace on its own line, so
    // it correctly finds no match instead of spanning across the comment
    // into the next real selector's `{` (which happened with a [^{]* class).
    const mediaQueries = [...compContent.matchAll(/@media([^{;\n]*)\{/g)].map((m) => m[1])
    const forbidden = mediaQueries.filter(
      (q) => !/prefers-reduced-motion|\bprint\b/.test(q)
    )
    if (forbidden.length > 0) {
      results.failures.push({
        type: 'MEDIA_QUERY_VIOLATION',
        message: `${story.componentFile} contains ${forbidden.length} forbidden @media quer${forbidden.length === 1 ? 'y' : 'ies'} (${forbidden.map((q) => q.trim()).join(', ')}). Enforce @container; only prefers-reduced-motion/print are exempt.`
      })
    }
  }

  // 2. Theme Cascade Sweeper
  for (const store of STORES) {
    const resolved = resolveTokensForStore(allTokenNames, store)
    const storeStatus = { resolved: 0, unresolved: [], fallbackUsed: [] }

    for (const token of allTokenNames) {
      const val = resolved[token]
      const fallback = tokenMap.get(token)

      if (val === null || (typeof val === 'string' && val.includes('(unresolved:'))) {
        if (fallback) {
          storeStatus.fallbackUsed.push({ token, fallback })
        } else {
          storeStatus.unresolved.push(token)
          results.failures.push({
            type: 'UNRESOLVED_MANDATORY_TOKEN',
            store,
            token,
            message: `Mandatory token "${token}" has no fallback and failed to resolve in store theme "${store}"`
          })
        }
      } else {
        storeStatus.resolved++
      }
    }

    results.themeMatrix[store] = storeStatus

    // 3. Contrast sanity — every resolved text/bg pair, this store's cascade.
    if (textTokens.length > 0 && bgTokens.length > 0) {
      for (const textToken of textTokens) {
        for (const bgToken of bgTokens) {
          if (!shouldPair(textToken, bgToken)) continue
          const waiverKey = `${textToken}:${bgToken}`
          if (story.contrastWaivers.has(waiverKey)) continue
          if (alphaOf(resolved[bgToken]) < 0.9) continue // translucent — can't composite what's actually behind it

          const textHex = normalizeColor(resolved[textToken])
          const bgHex = normalizeColor(resolved[bgToken])
          if (!textHex || !bgHex) continue // unresolved/non-color — already reported above

          const info = contrastInfo(hexToRgbString(textHex), hexToRgbString(bgHex))
          if (!info) continue

          if (!info.aaLarge) {
            results.failures.push({
              type: 'CONTRAST_FAIL',
              store,
              token: waiverKey,
              message: `${textToken} on ${bgToken} in store "${store}" is ${info.ratio}:1 — fails even the large-text AA threshold (3:1). If this pairing never actually occurs in the rendered UI, add "${waiverKey}" to the story's contrastWaivers.`
            })
          } else if (!info.aa) {
            results.contrastWarnings.push({
              store,
              token: waiverKey,
              ratio: info.ratio,
              message: `${textToken} on ${bgToken} in store "${store}" is ${info.ratio}:1 — passes large-text AA (3:1) but not normal-text AA (4.5:1); fine for large/bold text only.`
            })
          }
        }
      }
    }
  }

  return results
}

/**
 * Handle harness:test command
 */
function handleTest(target, options) {
  const stories = loadAllStories()
  if (stories.length === 0) {
    console.log('No stories found in src/library/stories/')
    process.exit(0)
  }

  const toTest = target && target.toLowerCase() !== 'all'
    ? stories.filter((s) =>
        s.componentName.toLowerCase() === target.toLowerCase() ||
        s.id.toLowerCase() === target.toLowerCase() ||
        s.title.toLowerCase().includes(target.toLowerCase())
      )
    : stories

  if (toTest.length === 0) {
    console.error(`Error: No matching story found for "${target}". Run "npm run harness list" to view available stories.`)
    process.exit(1)
  }

  if (!options.json) {
    console.log(`=== Agentic Design Harness: Sweeping ${toTest.length} Component Story/Stories ===\n`)
  }

  const summary = []
  let totalFailures = 0

  for (const story of toTest) {
    const result = testStory(story)
    summary.push(result)

    const failCount = result.failures.length
    totalFailures += failCount

    if (options.json) continue

    const statusMark = failCount === 0 ? '✓' : '✗'
    const colorStatus = failCount === 0 ? '[PASS]' : '[FAIL]'

    console.log(`${colorStatus} ${story.title} (${story.componentFile})`)
    console.log(`    Variants: [${story.variants.join(', ')}] | States: [${story.states.join(', ')}]`)
    console.log(`    Tokens: ${result.tokensTested} tested across 12 store themes (${result.tokensTested * 12} evaluations)`)

    if (failCount > 0) {
      console.log(`    Issues found (${failCount}):`)
      for (const f of result.failures) {
        console.log(`      - [${f.type}] ${f.message}`)
      }
    }
    if (result.contrastWarnings.length > 0) {
      console.log(`    Contrast warnings (non-blocking, ${result.contrastWarnings.length}):`)
      for (const w of result.contrastWarnings) {
        console.log(`      - ${w.message}`)
      }
    }
    if (result.stateCoverageWarnings.length > 0) {
      console.log(`    State coverage warnings (non-blocking, ${result.stateCoverageWarnings.length}):`)
      for (const w of result.stateCoverageWarnings) {
        console.log(`      - ${w.message}`)
      }
    }
    console.log()
  }

  if (options.json) {
    console.log(JSON.stringify({ passed: totalFailures === 0, failuresCount: totalFailures, results: summary }, null, 2))
    process.exit(totalFailures === 0 ? 0 : 1)
  }

  // Tallied separately from PASS/FAIL — a warning buried inside 86 mostly-PASS
  // blocks is easy to scroll past; the whole point of this being a warning
  // (not a failure) is that it stays visible as a backlog instead of either
  // silently passing OR blocking every PR that touches one of these stories.
  const storiesWithStateWarnings = summary.filter((r) => r.stateCoverageWarnings.length > 0)
  if (storiesWithStateWarnings.length > 0) {
    console.log(`${storiesWithStateWarnings.length} of ${toTest.length} stor${toTest.length === 1 ? 'y' : 'ies'} left at states: ['default'] without presentational: true — see State coverage warnings above.`)
  }

  if (totalFailures === 0) {
    console.log(`[HARNESS PASS] All ${toTest.length} component(s) passed all store theme and container query matrices!`)
    process.exit(0)
  } else {
    console.log(`[HARNESS FAIL] Found ${totalFailures} issue(s) across components.`)
    process.exit(1)
  }
}

/**
 * Handle harness:list command
 */
function handleList(options) {
  const stories = loadAllStories()
  if (options.json) {
    console.log(JSON.stringify(stories, null, 2))
    return
  }

  console.log(`=== Registered Stories in Design Harness (${stories.length} stories) ===\n`)
  for (const s of stories) {
    console.log(`• ${s.title.padEnd(20)} [${s.group}] -> Component: ${s.componentFile}`)
    console.log(`    Variants (${s.variants.length}): ${s.variants.join(', ')}`)
    console.log(`    States: ${s.states.join(', ')}`)
    console.log()
  }
}

// CLI Argument Parsing
const args = process.argv.slice(2)
const command = args[0]
const flags = {}
const positional = []

for (let i = 1; i < args.length; i++) {
  const arg = args[i]
  if (arg.startsWith('--')) {
    const key = arg.slice(2)
    if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
      flags[key] = args[i + 1]
      i++
    } else {
      flags[key] = true
    }
  } else {
    positional.push(arg)
  }
}

// Only dispatch the CLI when this file is run directly (`node tools/harness-cli.mjs …`),
// not when another script imports `loadAllStories` from it (tools/harness-capture.mjs
// does exactly this) — without this guard, importing the module ALSO ran this switch
// against the IMPORTER's argv, printing this file's usage banner as an unrelated
// side effect of an unrelated script's own CLI parsing.
const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMainModule) {
  switch (command) {
    case 'test':
      handleTest(positional[0], flags)
      break
    case 'list':
      handleList(flags)
      break
    default:
      console.log(`
Usage:
  node tools/harness-cli.mjs test [ComponentName|all] [--json]
  node tools/harness-cli.mjs list [--json]
      `.trim())
      break
  }
}
