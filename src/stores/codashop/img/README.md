# Codashop imagery — provenance

Most files in this folder are **placeholder/derived art**, not real Mobile Legends: Bang Bang assets.
They exist to exercise the Codashop layout and catalog shape end-to-end. Before this store ships
outside the prototype, every placeholder must be replaced with licensed art:

- `brand/cp-icon-placeholder.svg` — generic diamond/CP icon in the theme's indigo/acid-yellow palette.
- `content/placeholder-square.svg` — generic SKU/avatar square slot.

**Not placeholders — provided by the design team:**
- `content/identity-thumb.jpg` — the left-rail `CompactHero` thumbnail (`src/components/CompactHero.vue`, node `2189:2730`'s "Thumbnail" sub-component).
- `brand/codashop-logomark.svg` — the diamond brand mark. Used as `assets.brand.{wordmark,logomark,favicon,navSignInIcon}` (navbar block, footer, sign-in button icon, browser-tab favicon). It's a single light-fill (`#EAE8F7`) asset, so it reads correctly on the dark navbar/page but will be near-invisible on the footer's `.footer__tm` band, which is deliberately light for Codashop's light-card theme (`--bg-nav` → L2 fill). A dark-fill variant would be needed to fix that band properly — flagged, not yet built.
- `content/publishers/{mobile-legends.png,pubg-mobile.svg,genshin-impact.svg,free-fire.svg}` — real third-party game-publisher logos for `TrustBar.vue`'s "Officially partnered" card rotator (`assets.content.publisherLogos`). Only these 4 exist, so the rotator shows exactly 2 pairs rather than inventing logos for a larger roster. `pubg-mobile.svg` is a near-black mark (`#050000`) — `TrustBar.vue` backs every logo with a solid light tile (`.trust-bar__logo-tile`) rather than assuming light-on-dark polarity like the payment icons.

Confirm licensing on all of the above before this store ships outside the prototype.
