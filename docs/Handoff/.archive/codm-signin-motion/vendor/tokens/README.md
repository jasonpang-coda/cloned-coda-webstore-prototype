# Vendored motion tokens

Copies of `src/tokens/{motion,motion-sku,keyframes}.css` from the SKU Card 3.0 prototype.

Vercel builds with Root Directory `docs/Handoff/codm-signin-motion` cannot read files outside that folder, so these committed copies are imported at build time.

After changing prototype motion tokens locally, refresh:

```bash
npm run sync-tokens
```

Then commit the updated files in this folder.
