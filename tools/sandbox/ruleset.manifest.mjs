/**
 * tools/sandbox/ruleset.manifest.mjs — the one place that decides WHICH
 * sections of the real skill files travel into the sandbox's ruleset docs.
 *
 * This is the explicit, versioned editorial choice Milestone 2 deliberately
 * keeps human — see the plan's Milestone 2 §3: a script can't reliably judge
 * "durable vs execution-only" from free-form prose on its own, so this
 * manifest names exactly which `## Heading` to pull from which skill file,
 * verbatim. generate-ruleset.mjs then keeps the ruleset docs in sync with
 * the skill's *wording* automatically — if a skill's text under a named
 * heading changes, regenerating (or `--check`ing) picks that up. What stays
 * a one-time human call is *which* headings belong here at all.
 *
 * Sections deliberately excluded (and why — see the Milestone 2 research
 * that grounds this file):
 *   - web-store-tokens §1/§3/§4/§5/§6 — cascade/file-placement/import-order/
 *     HDR/grep-gate mechanics; about DEFINING tokens, not consuming existing
 *     ones from an already-vendored component set.
 *   - web-store-components Patterns 1–3 — about AUTHORING new components
 *     (variant props, config-driven rendering, reactive strings), not
 *     composing pages from ones that already exist.
 *   - web-store-whitelabel §1/§2a/§3/§4/§5/§6 (+ sibling setup-checklist.md)
 *     — the store-module data layer and the "add a whole new store"
 *     playbook; irrelevant to composing a page in an already-vendored,
 *     already-single-or-multi-store bundle.
 *   - web-store-fe's "Fast AI Tooling"/§7/§8 — this repo's own CLI tooling
 *     (npm run harness/scaffold/preflight/vue:slice), Figma MCP usage, and
 *     vite-build/grep-gate verification — none of it exists in a sandbox
 *     bundle, which has its own guardrail (`npm run lint`) instead.
 *   - web-store-fe §2 (condense system) / §6 (overlay + safe-top) — flagged
 *     as a real gap during Milestone 2 research (an ideation agent composing
 *     a full page with a sticky header could plausibly trip these with no
 *     guidance today) but left out of this pass; add manifest entries here
 *     when picked up.
 */
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')

export const SKILL_PATHS = {
  'web-store-tokens': path.join(os.homedir(), '.claude/skills/web-store-tokens/SKILL.md'),
  'web-store-components': path.join(os.homedir(), '.claude/skills/web-store-components/SKILL.md'),
  'web-store-whitelabel': path.join(os.homedir(), '.claude/skills/web-store-whitelabel/SKILL.md'),
  'web-store-fe': path.join(ROOT, '.claude/skills/web-store-fe/SKILL.md'),
}

// Fully-generated ruleset docs — every word below the intro is
// manifest-extracted, verbatim, from the named skill sections.
export const RULESET_DOCS = {
  'ruleset/tokens.md': {
    intro:
      '# Token discipline\n\n' +
      "Distilled from the source repo's `web-store-tokens` skill — the parts " +
      "that don't depend on the source repo's own file paths.\n\n" +
      '## The one scanner limitation to respect\n\n' +
      "The guardrail's token check is a regex over your CSS text — it cannot " +
      'see through a token name built via string interpolation:\n\n' +
      '```js\n' +
      '// INVISIBLE to the guardrail — never do this:\n' +
      'const style = { background: `var(--x-bg-action-${variant})` }\n' +
      '```\n\n' +
      '```js\n' +
      '// Correct — a literal lookup object, so every possible token name ' +
      'appears\n' +
      '// as plain text somewhere in your source:\n' +
      'const BG = {\n' +
      "  primary: 'var(--x-bg-action-primary)',\n" +
      "  secondary: 'var(--x-bg-action-secondary)',\n" +
      '}\n' +
      'const style = { background: BG[variant] }\n' +
      '```\n\n' +
      '## Container queries, never viewport media queries\n\n' +
      'This component library has no `@media`-based responsive system — ' +
      'every component reflows via CSS container queries (`@container`). If ' +
      'you add layout CSS that needs to respond to width, wrap it in a ' +
      "container (`container-type: inline-size` on a parent) and use " +
      '`@container (min-width: …)`, never `@media (min-width: …)`.',
    sections: [
      { skill: 'web-store-tokens', heading: '2. THE RULE — what a component may consume' },
      {
        skill: 'web-store-tokens', heading: "2b. The semantic set is closed — stop and ask, don't extend it",
        // 2b's own body ends with a "### Authoring discipline" subsection
        // about DEFINING/aliasing tokens across tiers when authoring a
        // theme — a different, execution-time concern than 2b's own
        // "stop and ask before consuming a new one" rule. Cut there.
        stopBefore: 'Authoring discipline — alias only the tier directly above ⚠️',
      },
    ],
  },

  'ruleset/components.md': {
    intro:
      '# Composing with the curated components\n\n' +
      "Distilled from the source repo's `web-store-components` skill — the " +
      'parts that apply to composing a page from existing components, not ' +
      'to authoring new ones.\n\n' +
      "## Read the props, don't guess them\n\n" +
      "Every curated component's real prop names, variants, and states are " +
      "in `catalog.json`. Read a component's entry there before using it — " +
      "don't guess a prop name from a similar component elsewhere; prop " +
      'surfaces are deliberately not uniform.\n\n' +
      '## Layout building blocks\n\n' +
      '`Grid` + `Span` is the layout system every real page section uses:\n\n' +
      '```vue\n' +
      '<Grid>\n' +
      '  <Span size="content">\n' +
      '    <!-- your section -->\n' +
      '  </Span>\n' +
      '</Grid>\n' +
      '```\n\n' +
      '`Span` sizes: `content` (centred, capped width — most sections), ' +
      '`fluid`/`full` (edge-to-edge), `carousel` (full-bleed on narrow, ' +
      'centred on wide). Use `Span`, not raw `max-width`/`margin: 0 auto`, ' +
      "so your page's responsive behavior matches every other page in this " +
      'design system.',
    sections: [
      { skill: 'web-store-components', heading: 'Pattern 4 — Graceful-absent (nullable) props & assets' },
      { skill: 'web-store-components', heading: 'Pattern 5 — Single source of truth (one component per concept)' },
    ],
  },

  'ruleset/whitelabel.md': {
    intro:
      '# Why store-branching is never allowed, even with one store vendored\n\n' +
      "Distilled from the source repo's `web-store-whitelabel` skill — the " +
      'one rule that actually matters when composing a page.\n\n' +
      'A bundle exported by `export-sandbox.mjs` vendors one store by ' +
      'default, or several via `--store codm,fcm` (see `AGENTS.md`\'s note ' +
      'at the top if this bundle has more than one). Either way, the rule ' +
      'below is unconditional — it is not relaxed just because this bundle ' +
      'happens to carry only one store today.',
    sections: [
      { skill: 'web-store-whitelabel', heading: '2. The golden rule' },
    ],
  },
}

// AGENTS.md is hand-maintained prose with ONE generated block — its
// `<!-- GENERATED:HARD_RULES:BEGIN -->...END -->` markers — filled from
// this single entry rather than the whole file being regenerated.
export const AGENTS_HARD_RULES = {
  sections: [
    {
      skill: 'web-store-fe',
      heading: 'Pre-ship checklist',
      // The real checklist has a few items that reference this SOURCE
      // repo's own build/grep/docs workflow (§8) or its overlay/DeviceFrame
      // system, neither of which exists in a sandbox bundle — this filter
      // keeps only the items that are genuinely still true for an ideation
      // agent composing a page in this bundle. Editorial choice, versioned
      // here; if the checklist's wording for a KEPT item changes, this still
      // picks it up automatically on regen.
      filter: (line) =>
        /DS tokens only|text-style-\*|border-weight-|legacy ad-hoc|data-theme.*block|Qualitative tweak|@container/.test(line),
    },
  ],
}
