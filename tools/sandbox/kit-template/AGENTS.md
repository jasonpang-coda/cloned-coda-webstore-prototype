# @coda/sandbox-kit — agent entry point

You've installed this as a dependency in your **own** project — this is not
an `export-sandbox.mjs` bundle (there is no canvas app, no `npm run dev`
here; that's your own project's job). It carries the same real, production
components, composables, tokens, and store data an exported bundle does —
vendored read-only, this time as an installed package rather than a
throwaway folder.

Stores vendored in this copy: **{{STORES}}**. Version: **{{VERSION}}**.

## What's here

- `components/`, `composables/`, `directives/`, `tokens/`, `stores/<key>/`,
  `shared/`, `locale/` — **read-only.** Import them directly, e.g.
  `import Button from '@coda/sandbox-kit/components/Button.vue'`. Never edit
  these in `node_modules/` — if you need different behavior, compose around
  it in your own code.
- `active-stores.js` — a static array of every vendored store's data, in the
  same shape the source repo's own `@active-stores` virtual module produces.
  Point your own bundler's `@active-stores` alias at it if a vendored
  composable imports that bare specifier (`useTheme`/`useStoreAssets`/etc. do).
- `catalog.json` — every curated component's props/variants/states/rules and
  its resolved token contract for the primary store.
- `guardrail/` — the same static linter an exported bundle uses
  (`node node_modules/@coda/sandbox-kit/guardrail/preflight.mjs`). Wire it
  into your own `package.json` as a `lint` script if you want it.
- `ruleset/` — the same token/component/whitelabel discipline an exported
  bundle ships, generated from the source repo's real skill files.

## Using it

1. Your bundler needs a `vue` peer dependency and an alias so the vendored
   files' own `@/...` imports resolve — point `@` at this package's root
   (e.g. Vite: `{ find: '@', replacement: require.resolve('@coda/sandbox-kit') }`).
2. Import real components directly by subpath and compose your page.
3. Run `guardrail/preflight.mjs` against your own page files before shipping
   anything.

See `ruleset/tokens.md`, `ruleset/components.md`, `ruleset/whitelabel.md` for
the full rules (auto-generated from the source repo's own skill files — see
`tools/sandbox/ruleset.manifest.mjs` in the source repo if you want to know
exactly where a rule came from).
