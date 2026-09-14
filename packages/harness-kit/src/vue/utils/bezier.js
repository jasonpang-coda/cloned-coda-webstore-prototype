/** Parse cubic-bezier(a, b, c, d) from a CSS value string. */
export function parseBezier(str) {
  if (!str) return null
  const match = String(str).match(
    /cubic-bezier\(\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)/,
  )
  if (!match) return null
  return {
    x1: parseFloat(match[1]),
    y1: parseFloat(match[2]),
    x2: parseFloat(match[3]),
    y2: parseFloat(match[4]),
  }
}

function bezierPoint(t, p0, p1, p2, p3) {
  const mt = 1 - t
  const mt2 = mt * mt
  const mt3 = mt2 * mt
  const t2 = t * t
  const t3 = t2 * t
  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
  }
}

/** Sample the easing curve at `steps` intervals (t: 0→1, y may overshoot). */
export function sampleBezierCurve(bezier, steps = 80) {
  const p0 = { x: 0, y: 0 }
  const p1 = { x: bezier.x1, y: bezier.y1 }
  const p2 = { x: bezier.x2, y: bezier.y2 }
  const p3 = { x: 1, y: 1 }
  const points = []
  for (let i = 0; i <= steps; i++) {
    points.push(bezierPoint(i / steps, p0, p1, p2, p3))
  }
  return points
}

/**
 * Evaluate a cubic-bezier timing function at a given time fraction (x: 0→1),
 * returning its eased output (y — may overshoot past [0,1] for a spring
 * curve). Used to drive a live choreography preview's opacity/transform off
 * the REAL easing token instead of linear interpolation. Bezier curves are
 * parameterized by t, not x, so this samples the curve and picks the point
 * whose x is closest — fine for a scrub preview, not meant to be exact.
 */
export function easeAt(bezier, x, steps = 200) {
  if (!bezier) return x
  const points = sampleBezierCurve(bezier, steps)
  let closest = points[0]
  for (const p of points) {
    if (Math.abs(p.x - x) < Math.abs(closest.x - x)) closest = p
  }
  return closest.y
}

/** Build an SVG path `d` from sampled points within a padded viewBox. */
export function pointsToSvgPath(points, width, height, padding = 12) {
  const ys = points.map((p) => p.y)
  const minY = Math.min(0, ...ys)
  const maxY = Math.max(1, ...ys)
  const rangeY = maxY - minY || 1
  const innerW = width - padding * 2
  const innerH = height - padding * 2

  const coords = points.map((p) => ({
    x: padding + p.x * innerW,
    y: padding + innerH - ((p.y - minY) / rangeY) * innerH,
  }))

  return {
    path: coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(' '),
    minY,
    maxY,
    toSvg: (p) => ({
      x: padding + p.x * innerW,
      y: padding + innerH - ((p.y - minY) / rangeY) * innerH,
    }),
  }
}
