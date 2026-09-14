/**
 * rollup.js — the `{count, total, pct}` shape every stat in the dashboard
 * renders from. Never let the UI compute a percentage itself — build it
 * here so a stat card and a table row derived from the same numbers can
 * never disagree.
 */

/** @returns {{count:number, total:number, pct:number}} */
export function stat (count, total) {
  return { count, total, pct: total > 0 ? (count / total) * 100 : 0 }
}

export function statOf (predicate, items) {
  const count = items.filter(predicate).length
  return stat(count, items.length)
}
