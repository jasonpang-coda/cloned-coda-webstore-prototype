# Playground

Live demos of the SKU-card family, wired to the **real prototype tokens** (the
full 11-file cascade — colour, space, typography, shadow, keyframes and the
`.fx-*` effect classes). Edit the duration/easing sliders and watch every card
respond. These are faithful demo stubs, not the production `.vue` files (the real
cards are composable-bound) — but every visual value is the genuine token.

<SkuCardsPlayground />

## Choreography timeline

Scrub or play the page-load **entrance cascade**: each card runs `sku-enter` at
`index × 90ms`, and its price block fades in one `--motion-sys-duration-slow`
*after* the card settles (the deliberate two-beat reveal). The beat positions are
read live from the tokens, so editing `--motion-sys-duration-slow` reshapes the
timeline.

<SkuCardsTimeline />

## Easing curves

The curves the cards use — entrances **decelerate**, on-screen moves use
**standard**, and the badge `pop` is the one **spring** (delight only).

<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));">
  <EasingCurve token="--motion-sys-ease-decelerate" />
  <EasingCurve token="--motion-sys-ease-standard" />
  <EasingCurve token="--motion-sys-ease-accelerate" />
  <EasingCurve token="--motion-sys-ease-spring" />
</div>
