# AI Developer Efficiency & Token Optimization Tools

This suite of four Node.js CLI tools is designed to accelerate AI agent workflows, eliminate hallucinated edits, and drastically reduce LLM token consumption across the `coda-webstore-prototype` repository.

---

## Tool Summary & Token Savings

| Tool | CLI Command | Purpose | Typical Token Savings |
| :--- | :--- | :--- | :--- |
| **1. Token Fast-Lookup** | `npm run token search` / `resolve` | Instant token search, alias chain resolution, and theme lookups without reading 100KB+ CSS files. | **90% – 95%** (down from ~25k tokens to <100 tokens) |
| **2. Vue SFC Slicer** | `npm run vue:slice contract` / `outline` / `slice` | Compact interface extraction (props, emits, slots, tokens) and surgical line slicing of huge components like `App.vue`. | **95%** (extracts a 500-line component contract in ~80 tokens) |
| **3. Overlay Scaffolder** | `npm run scaffold overlay` | Deterministic generation of sheets/drawers with automated wiring into `useCloseAllOverlays.js`, `App.vue`, and `SURFACES`. | **100%** (zero tokens spent writing boilerplate or fixing missed wiring) |
| **4. Static Preflight** | `npm run preflight` | Instant local validation of container queries (`@container`), design tokens, and overlay registration parity. | Prevents costly trial-and-error regression cycles |

---

## 1. Token Fast-Lookup & Auditor (`tools/token-cli.mjs`)

### Commands
```bash
# Search for design tokens matching a keyword or tier
npm run token search "surface"
npm run token search "gap" -- --tier space
npm run token search "metal" -- --json

# Resolve a token's computed value for a specific store theme
npm run token resolve --x-sys-colour-surface-page -- --store codm
npm run token resolve --x-surface-primary -- --store fcm

# Audit a .vue component for token and CSS rule violations
npm run token audit src/components/SkuCard.vue

# List total token count breakdown across all tiers
npm run token list
```

---

## 2. Vue SFC Contract & Section Slicer (`tools/vue-slice.mjs`)

### Commands
```bash
# Extract component interface (props, emits, slots, child components, tokens)
npm run vue:slice contract src/components/SkuCard.vue
npm run vue:slice contract src/components/BuyNowBar.vue -- --json

# Outline top-level blocks and template sections with line ranges
npm run vue:slice outline src/App.vue

# Slice a specific section or line range with accurate 1-indexed line numbers
npm run vue:slice slice src/App.vue -- --lines 1240:1280
npm run vue:slice slice src/components/SkuCard.vue -- --section script
npm run vue:slice slice src/components/SkuCard.vue -- --section template
```

---

## 3. Deterministic Overlay & Component Scaffolder (`tools/scaffold.mjs`)

Automates all four integration points required when introducing a new sheet, drawer, or modal:
1. Generates `src/components/<Name>.vue` with container queries, accessible close button, and design tokens.
2. Generates `src/composables/use<Name>.js` with reactive visibility ref.
3. Automatically registers the closer in `src/composables/useCloseAllOverlays.js`.
4. Imports the composable, appends to `SURFACES`, and mounts the overlay in `src/App.vue`.

### Commands
```bash
# Dry-run preview
npm run scaffold overlay -- --name VipPassSheet --label "VIP Pass" --dry-run

# Scaffolding and auto-wiring
npm run scaffold overlay -- --name VipPassSheet --label "VIP Pass"
```

---

## 4. Fast Static Preflight Linter (`tools/preflight.mjs`)

Validates codebase hygiene against project conventions in <300ms:
- **Container Queries**: Disallows `@media (min-width: ...)` inside component `<style>` blocks (enforces `@container`).
- **Design Tokens**: Flags unregistered or mistyped `--x-*` and `--sys-*` variables.
- **Color Hygiene**: Flags raw `#hex` or `rgb(...)` color declarations in component styles.
- **Overlay Parity**: Checks that every active overlay surface declared in `App.vue` `SURFACES` has a corresponding dismissal in `useCloseAllOverlays.js`.

### Commands
```bash
# Check a single modified component
npm run preflight src/components/TrustBar.vue

# Full codebase sweep across all components
npm run preflight

# Machine-readable JSON output
npm run preflight -- --json
```

---

## 5. Beyond these four: the design harness

This repo also ships a story-driven design harness (isolated component staging,
cross-store token sweeps, Figma Code Connect sync) built on top of these same
four tools. See the `design-harness` skill and its command reference for
`npm run scaffold story`, `npm run harness test`, `npm run pipeline`,
`npm run harness:compound`, and `npm run figma:prime`/`figma:sync`.
