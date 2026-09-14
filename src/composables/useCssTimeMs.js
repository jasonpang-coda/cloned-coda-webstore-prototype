/**
 * Converts a computed CSS <time> string to milliseconds.
 *
 * getComputedStyle normalizes whole-second <time> values to `s` units
 * (e.g. a token declared `5000ms` computes back as `"5s"`, `2600ms` as
 * `"2.6s"`) — a bare `parseInt(...)` on that string silently reads the
 * numeric part as milliseconds (`parseInt("5s", 10) === 5`), producing an
 * interval a thousand times too fast instead of falling back, since the
 * result is truthy. Always route a computed interval/duration through this
 * before handing it to setInterval/setTimeout.
 */
export function cssTimeToMs(value, fallback) {
  const n = parseFloat(value)
  if (!Number.isFinite(n)) return fallback
  return value.trim().endsWith('ms') ? n : n * 1000
}
