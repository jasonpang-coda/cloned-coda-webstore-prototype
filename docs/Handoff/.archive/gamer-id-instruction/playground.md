# Playground

Interactive demo of the Gamer ID Instruction animations. Use the token sliders to adjust durations and observe every transition live.

<GamerIdPlayground />

## Choreography timeline

Scrub through the two animation sequences: the **disclosure open** flow (chevron + instructions block + panel accordion) and the **lookup** flow (spinner cycles + Player Card fade-in).

<GamerIdTimeline />

## Easing curves

<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));">
  <EasingCurve token="--motion-sys-ease-decelerate" />
  <EasingCurve token="--motion-sys-ease-accelerate" />
  <EasingCurve token="--motion-sys-ease-standard" />
</div>
