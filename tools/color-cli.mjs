#!/usr/bin/env node
/**
 * tools/color-cli.mjs — hex ↔ oklch conversion, ad-hoc from the terminal.
 * Thin wrapper over generators/color.mjs (zero-dep OKLab/OKLCH math) — no
 * Python, no coloraide, no skill invocation needed for a single lookup.
 *
 * Usage:
 *   node tools/color-cli.mjs to-oklch <#hex> [--precision <n>]
 *   node tools/color-cli.mjs to-hex "oklch(l c h)"
 *   node tools/color-cli.mjs to-hex <l> <c> <h>
 */

import { hexToOklchString, oklchToHex } from './cms/generators/color.mjs'

function usage () {
  console.error(
    'Usage:\n' +
    '  node tools/color-cli.mjs to-oklch <#hex> [--precision <n>]\n' +
    '  node tools/color-cli.mjs to-hex "oklch(l c h)"\n' +
    '  node tools/color-cli.mjs to-hex <l> <c> <h>',
  )
  process.exit(1)
}

const [cmd, ...rest] = process.argv.slice(2)

if (cmd === 'to-oklch') {
  const [hex, ...flags] = rest
  if (!hex) usage()
  const precisionFlagIdx = flags.indexOf('--precision')
  const precision = precisionFlagIdx >= 0 ? Number(flags[precisionFlagIdx + 1]) : 3
  console.log(hexToOklchString(hex, precision))
} else if (cmd === 'to-hex') {
  if (rest.length === 0) usage()
  const input = rest.length === 1 ? rest[0] : { l: Number(rest[0]), c: Number(rest[1]), h: Number(rest[2]) }
  console.log(oklchToHex(input))
} else {
  usage()
}
