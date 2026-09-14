# Figma plugin-script (`use_figma`) working notes

Durable process notes from importing Codashop tokens + Button/SkuCard
components (2026-09-05). Read before writing another `use_figma` script for
this project — see also `token-map-codashop.md` (CSS var → Figma variable)
and the sprint-retro ledger (`audits/retro-ledger.json`, `process`/`quality`
categories) for the full lesson writeups these notes summarize.

## Known-safe variable scopes

`variable.scopes = ["ALL_FILLS", "TEXT_FILL", "STROKE_COLOR", ...]` throws
`If ALL_FILLS is set, other fill scopes cannot be set`. `ALL_FILLS` is
exclusive — either use it alone, or list the individual fill scopes:

```js
// Use this (individual scopes), not ALL_FILLS + others:
const COLOR_SCOPES = ["FRAME_FILL", "SHAPE_FILL", "TEXT_FILL", "STROKE_COLOR", "EFFECT_COLOR"];
```

## Dry-run risky options before a big data-driven call

A `use_figma` call that both embeds a large (10KB+) literal data payload
*and* exercises an unverified API option (a new scope combination, an
untested `setBoundVariable` property name, etc.) pays the full payload cost
again on every retry. Test the risky option alone, on one throwaway
variable/node, before writing the full bulk-creation script.

## Published library ≠ current local state

Importing a variable from a **published team library** (`importVariableByKeyAsync`)
gets whatever was last published — publishing requires a manual click in
Figma's Assets panel, unreachable from the Plugin API. If you just rebuilt a
source file's local variables in the same session, the library a *different*
file imports from may still be stale. After importing, read back the actual
value (e.g. the resolved fill) before computing anything derived from it
(hover/pressed color-mix, etc.) — don't assume it matches the rebuild.

## Reusable helper snippets

Paste-and-adapt helpers used for the Button/SkuCard build — saves
re-authoring the same boilerplate (and re-introducing the bug below) per
component.

```js
// Bind a COLOR variable to a node's fill (paints are read-only — always
// build a fresh paint object and reassign, never mutate node.fills[i] in place)
function bindFill(node, variable) {
  const paint = figma.variables.setBoundVariableForPaint(
    { type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", variable
  );
  node.fills = [paint];
}

// Create a text node with font/size/color already applied.
// IMPORTANT: do NOT set layoutSizingHorizontal/Vertical here — text nodes
// hug by default via textAutoResize, and setting layoutSizing before the
// node is appended to an auto-layout parent throws
// "node must be an auto-layout frame or a child of an auto-layout frame"
// (this bug recurred in the SkuCard build the same session the rule was
// read — see RETRO-MTOISWVK). Only set layoutSizing AFTER appendChild, and
// only if you need to override the default hug behavior.
function text(str, style, size, colorVar, opts = {}) {
  const t = figma.createText();
  t.fontName = { family: "Inter", style };   // must loadFontAsync({family, style}) first
  t.characters = str;
  t.fontSize = size;
  if (colorVar) bindFill(t, colorVar);
  if (opts.strike) t.textDecoration = "STRIKETHROUGH";
  return t;
}
```

## Visual QA against the right backdrop

A translucent/alpha token (e.g. `bg/SKU card/default`, a 4%-alpha white
overlay) is designed to sit on the store's dark page background, not
Figma's default white canvas — it will look "broken" (nearly invisible or
inverted) in isolation. Drop a plain rectangle filled with the store's
`bg/page` value behind new component work before screenshotting for visual
verification, or the token binding will look wrong when it isn't.
