# House rules (codapayments-codashop-client)

Cited, not restated — read the source before relying on this summary.

| Rule | Source |
|---|---|
| All user-facing copy through i18n, never hardcoded | `.agents/skills/add-translations`, `AGENTS.md` |
| No tenant-name branching (`isEa*`/`isCodm*`) — use `isSiteFeatureOn()` | `AGENTS.md`, `composables/store-config.ts` |
| New tokens only on the `theme-preset-edge--*` / `.theme--styled-edge` branch | `.cursor/rules/sitebuilder-edge-only-tokens.mdc` |
| Motion tokens chosen by interaction intent, propose a table + wait for approval, never bulk-replace | `.cursor/rules/sitebuilder-motion-tokens-by-intent.mdc` |
| No new `.vue` component without explicit permission | `skills/figma-implement-design/SKILL.md` |
| Token-existence verification mandatory before writing any styles | `skills/figma-implement-design/SKILL.md` |
| Component CSS lives in the mirrored `assets/css/sitebuilder/components/**` file, not inline in the SFC | `assets/css/sitebuilder/README.md` |
| Test in the lightest sufficient tier: `.unit.ts` → `.test.ts` → `.spec.ts` | `AGENTS.md` |
| Never `git commit`/push/open a PR unless explicitly asked | `.cursor/rules/no-auto-git-commit-push.mdc` |
| Verify AWS Lambda runtime compatibility before adding a dependency | `AGENTS.md` |
