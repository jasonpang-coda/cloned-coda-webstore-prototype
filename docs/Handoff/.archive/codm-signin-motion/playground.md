# Playground

Full interactive sandbox — edit motion tokens live and see every sign-in surface update instantly.

<TokenPlayground />

## Choreography timeline

Scrub or play the full sign-in sequence. Speed control helps review the 10.5s flow without waiting in real time.

<ChoreographyTimeline />

## Easing curves

Compare the easing primitives used across the flow.

<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));">
  <EasingCurve token="--motion-ease-decelerate" />
  <EasingCurve token="--motion-ease-accelerate" />
  <EasingCurve token="--motion-ease-spring" />
  <EasingCurve token="--motion-ease-standard" />
</div>
