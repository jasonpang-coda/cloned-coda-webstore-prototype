# Collaborator Comments — Data Schema

Reference for the `public.comments` table (Supabase) and the two jsonb payloads
that carry a comment's anchoring + flow-state. For project setup / RLS / realtime
see [comments-backend.md](./comments-backend.md); for feature behaviour see
[comment-mode.md](./comment-mode.md).

One table is shared by every store deployment; the `store` column isolates rows
per store (FCM never sees COD:M), and `deployment_scope` isolates the internal
multi-store build from the locked per-store builds (see below) even when both
show the same store. A comment is either a **thread root** (`parent_id is
null`, `thread_id = id`) or a **reply** (`parent_id` = the root, `thread_id` =
the root's id).

## Columns

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key. |
| `thread_id` | uuid | Groups a root + its replies; equals `id` on a root. |
| `parent_id` | uuid null | `null` = thread root; else the root's `id` (FK, `on delete cascade`). |
| `store` | text | `useTheme().theme.value` — the per-store isolation key. |
| `deployment_scope` | text | `'internal'` (default multi-store build, runtime theme switcher) or `'locked'` (a `build:<store>` deployment, one fixed theme forever). Set by the client from the `__STORE_LOCKED__` compile-time flag — a plain column, not generated. Second isolation boundary alongside `store`; indexed together as `(store, deployment_scope)`. |
| `context` | jsonb | Flow state the comment was left in — see below. |
| `anchor` | jsonb | What element it's tagged to + where — see below. |
| `surface` | text | **Generated** `stored` column = `context->>'surface'`. Indexed; for filtering (e.g. `where surface = 'checkout'`). Never written by the client. `null` for pre-migration rows → read as `'storefront'`. |
| `author_id` | text | Per-browser token (localStorage `webstore:comments:authorId`); owns edit/delete client-side. |
| `author_name` | text | Display name entered at the identity gate. |
| `author_color` | text | Deterministic avatar colour derived from the name. |
| `body` | text | The comment text. |
| `resolved` | boolean | Thread-level; set on the root. |
| `created_at` / `updated_at` | timestamptz | `updated_at` bumps on edit. |

## `context` jsonb — flow state

Captured from `App.vue` at the moment the comment is placed, and used to decide
when a pin re-shows (a pin is on-canvas only when the current page/view/surface
all match).

| Key | Example | Meaning |
|---|---|---|
| `page` | `"storefront"`, `"cat-bundle"`, an FCM category id, `"transaction-history"` | Which page/category. Page-mode stores use the single `"storefront"` bucket. |
| `view` | `"store"` \| `"history"` | Storefront vs the transaction-history view swap. |
| `surface` | `"storefront"`, `"checkout"`, `"account"`, `"nav-drawer"`, `"item-summary"`, `"claim-gift"`, `"signin"`, `"region"`, `"language"`, `"ea-signin"`, `"konami-signin"`, `"signin-loader"` | Topmost open overlay when placed (static z-index priority). `"storefront"` = nothing open. |
| `surfaceLabel` | `"Checkout"` | Human-readable name for the list chip. |

Backward compat: a missing `surface`/`view` reads as `'storefront'`/`'store'`.

## `anchor` jsonb — element tag + position

| Key | Example | Meaning |
|---|---|---|
| `container` | `".device__screen"`, `".sheet__panel"`, `".account-popover"`, `".nav-drawer__panel"`, `".ea-page"`, `".konami-page"` | The scroll/positioned container the element lives in. The pin is Teleported into it and its selector/coords are relative to it. Missing → `".device__screen"`. |
| `selector` | `"div.sku-card > div.sku-card__price"` | Container-rooted `tag.bemRoot` CSS path; re-queried on resolve. |
| `index` | `0` | Which match of `selector` within the container (handles repeated cards). |
| `nx` / `ny` | `0.42` / `0.7` | Click point as a fraction of the element's box — pin lands where clicked and tracks resizes. |
| `sectionId` | `"cat-bundle"` | Nearest ancestor id — coarse fallback if the exact selector is gone. |
| `device` | `"iphone"` \| `"samsung"` \| `"none"` | Device frame at capture time (informational). |
| `component` | `"SkuCard"` | Vue component name (dev) or PascalCase BEM-root fallback (prod). |
| `label` | `"div.sku-card__price"` | Structural `tag.bemRoot` label. |
| `text` | `"1,200 CP"` | Short trimmed snippet of the element's text (≤60 chars). May contain localized store copy. |
| `breadcrumb` | `["App","SkuGrid","SkuCard"]` | Component ancestry (dev builds only; `[]` in production). |

## Worked examples

**A storefront comment on a SKU price, on the locked COD:M deployment:**
```json
{
  "store": "codm",
  "deployment_scope": "locked",
  "context": { "page": "storefront", "view": "store", "surface": "storefront", "surfaceLabel": "Storefront" },
  "anchor":  { "container": ".device__screen", "selector": "div.sku-card > div.sku-card__price",
               "index": 2, "nx": 0.5, "ny": 0.6, "sectionId": "cat-best-seller", "device": "iphone",
               "component": "SkuCard", "label": "div.sku-card__price", "text": "1,200 CP",
               "breadcrumb": ["App","SkuGrid","SkuCard"] }
}
```
→ generated `surface` = `"storefront"`. This row is invisible to the internal (all-stores) build even when it's showing COD:M, because its `deployment_scope` is `"locked"`, not `"internal"`.

**A comment on the checkout sheet's pay button, on the internal multi-store build:**
```json
{
  "store": "codm",
  "deployment_scope": "internal",
  "context": { "page": "storefront", "view": "store", "surface": "checkout", "surfaceLabel": "Checkout" },
  "anchor":  { "container": ".sheet__panel", "selector": "div.sheet__footer > button.sheet__pay",
               "index": 0, "nx": 0.5, "ny": 0.5, "sectionId": null, "device": "iphone",
               "component": "CheckoutSheet", "label": "button.sheet__pay", "text": "Pay now",
               "breadcrumb": ["App","CheckoutSheet"] }
}
```
→ generated `surface` = `"checkout"`; its pin renders only while the checkout sheet is open, and only within the internal build (never on the locked `sku-card-codm` deployment, despite the same `store: "codm"`).
