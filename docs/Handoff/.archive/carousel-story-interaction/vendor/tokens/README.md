# Vendored tokens, fonts & images

Committed copies of the prototype assets the live `StoryCarousel` demo needs, synced by [`scripts/sync-tokens.mjs`](../../scripts/sync-tokens.mjs):

- **`vendor/tokens/`** — flattened copies of `src/tokens/ds/themes/codm.css`, `ds/system.css`, `ds/semantics.css`, `ds/space.css`, `ds/text-styles.css`, `ds/extensions.css`, and `motion.css`, `motion-sku.css`, `keyframes.css`, `effects.css`, `reduced-motion.css`. Imported in cascade order by `.vitepress/theme/index.js`. In `codm.css` the `@font-face` `url()`s are rewritten from `../../../stores/codm/fonts/` to `../fonts/`.
- **`vendor/fonts/`** — the Hitmarker Text VF `.woff2`/`.woff` files.
- **`vendor/img/`** — the four `slide-*` images used as the demo slides.

Vercel builds with Root Directory `docs/Handoff/carousel-story-interaction` cannot read files outside that folder, so these committed copies are imported at build time.

After changing prototype tokens, fonts, or slide art locally, refresh:

```bash
npm run sync-tokens
```

Then commit the updated files.
