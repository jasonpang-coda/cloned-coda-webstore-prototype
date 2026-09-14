# @coda/sandbox-kit

Real, production components from the COD:M/FCM web-store prototype, vendored
read-only for ideation in your own project — the installable counterpart to
`tools/sandbox/export-sandbox.mjs`'s throwaway bundles.

## Install

```bash
npm install git+https://github.com/<org>/<repo>.git
```

(Replace with wherever this kit was published — see `publish-kit.mjs` in the
source repo.)

## Use

```js
import Button from '@coda/sandbox-kit/components/Button.vue'
import SkuCard from '@coda/sandbox-kit/components/SkuCard.vue'
```

Point your bundler's module resolution at an `@active-stores` alias for
`@coda/sandbox-kit/active-stores.js` if you import any vendored composable
that reads store data (`useStoreAssets`, `useStoreConfig`, `useStoreStrings`,
`useTheme`, …) — see `AGENTS.md` for the full setup and the operating rules.

Stores in this copy: **{{STORES}}**. Version: **{{VERSION}}**.
