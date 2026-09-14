# eFootball™ Brand Assets

Assets needed before this store ships. All files in this directory are placeholders.

## Awaiting from brand / design

| File | Description | Status |
|------|-------------|--------|
| `wordmark.webp` | eFootball™ horizontal wordmark (navbar logo) — yellow on transparent, ™ removed | ✅ Supplied |
| `logomark.svg` | KONAMI / eFootball™ app icon (sign-in button) | ⏳ Placeholder |
| `efc-icon.svg` | eFootball Coins currency icon (SKU cards, checkout) | ⏳ Placeholder |
| `qr-placeholder.svg` | QR code stand-in for sign-in loader | ✅ Done (generic) |
| `qr-code.webp` | Real QR code for "Sign in with eFootball" mobile flow | ⏳ Missing |
| `bg.webp` | Page background hero (full-cover, fixed during scroll) | ✅ Supplied |

## Fonts

eFootball Sans woff2 files are in `../fonts/`:

| File | Weight | Status |
|------|--------|--------|
| `eFootballSans-Light.woff2` | 300 | ✅ Supplied |
| `eFootballSans-Regular.woff2` | 400 | ✅ Supplied |
| `eFootballSans-Bold.woff2` | 700 | ✅ Supplied |

`@font-face` blocks are live in `src/tokens/ds/themes/efootball.css`.
No Medium (500) cut — `--sys-weight-semibold` remapped to Regular 400.

## Content

`../content/` holds the story-carousel hero:

| File | Description | Status |
|------|-------------|--------|
| `kv-placeholder.svg` | Single 16:9 key-visual hero (one-slide carousel) | ⏳ Placeholder |
| *(real KV)* | Final landscape KV — drop in & repoint `storyHero` in `store.js` | ⏳ Missing |

The carousel hides its progress bar + auto-advance for a single slide, and uses
`config.carousel.aspectRatio: '16 / 9'` so the wide KV fits without cropping.

Still pending: SKU imagery + campaign banners, once the catalogue structure and
platform breakdown (iOS / Android / Steam) is confirmed.
