import { test } from 'node:test'
import assert from 'node:assert/strict'
import { section, tableCells, truncateBeforeHeading, parseSpecMd } from '../tools/sandbox/lib/markdown.mjs'

test('section() extracts a heading body up to the next `## ` heading', () => {
  const content = [
    '## 1. First',
    'alpha',
    'beta',
    '## 2. Second',
    'gamma',
  ].join('\n')
  assert.equal(section(content, '1. First'), 'alpha\nbeta')
  assert.equal(section(content, '2. Second'), 'gamma')
  assert.equal(section(content, 'Missing'), '')
})

test('section() handles headings containing regex-special characters (parens, ⚠️)', () => {
  // Regression fixture: a prior bug double-escaped the heading string before
  // passing it to section() (the CALLER escaped it, then section() escaped
  // it again), silently producing a regex that could never match a heading
  // like "Token Contract (Resolved per Store)" — section() must be the ONLY
  // place that escapes, and callers must pass the raw heading text.
  const content = [
    '## Token Contract (Resolved per Store)',
    '| Token | CODM |',
    '|---|---|',
    '| `--x-bg-page` | `oklch(0 0 0)` |',
    '## Next',
  ].join('\n')
  const body = section(content, 'Token Contract (Resolved per Store)')
  assert.ok(body.includes('--x-bg-page'), `expected the parenthesized heading to match, got: ${JSON.stringify(body)}`)

  const warnContent = ['## 2b. Closed set ⚠️', 'body text', '## 3. Next'].join('\n')
  assert.equal(section(warnContent, '2b. Closed set ⚠️'), 'body text')
})

test('tableCells() splits a markdown table row, dropping the outer empty pipes', () => {
  assert.deepEqual(tableCells('| a | b | c |'), ['a', 'b', 'c'])
  assert.deepEqual(tableCells('| `--x-bg-page` | `oklch(0 0 0)` |'), ['`--x-bg-page`', '`oklch(0 0 0)`'])
})

test('truncateBeforeHeading() cuts a section body right before a nested subheading', () => {
  // Regression fixture: extracting web-store-tokens' "2b" section originally
  // ran past its own scope into a nested "### Authoring discipline"
  // subsection — a different, execution-time concern than 2b's own
  // consuming-tokens rule. truncateBeforeHeading() is how a manifest entry
  // cuts that off.
  const body = [
    'Stop and ask before adding a token.',
    '',
    '### Authoring discipline — alias only the tier directly above ⚠️',
    'This is definition-time guidance that should not appear in 2b.',
  ].join('\n')
  const truncated = truncateBeforeHeading(body, 'Authoring discipline — alias only the tier directly above ⚠️')
  assert.equal(truncated, 'Stop and ask before adding a token.')

  // No matching subheading present — returns the body unchanged.
  assert.equal(truncateBeforeHeading('plain body, no subheadings', 'Nonexistent'), 'plain body, no subheadings')
})

test('parseSpecMd() resolves the correct store column from the token contract table', () => {
  const specMd = [
    '---',
    'group: Primitives',
    '---',
    '',
    '## Usage Rules',
    '- Enforce @container query layouts (never @media).',
    '- Use semantic tokens for colors and spacing.',
    '',
    '## Variants & Interaction States',
    '',
    '- **Supported Interaction States**: `default`, `hover`',
    '',
    '| Variant Name | Index |',
    '|---|---|',
    '| Primary | 0 |',
    '| Secondary | 1 |',
    '',
    '## Token Contract (Resolved per Store)',
    '',
    '| Token | CODM | FCM |',
    '|---|---|---|',
    '| `--x-bg-action-primary` | `oklch(0.9 0.2 100)` | `oklch(0.6 0.2 150)` |',
  ].join('\n')

  const codm = parseSpecMd(specMd, 'CODM')
  assert.equal(codm.group, 'Primitives')
  assert.deepEqual(codm.rules, [
    'Enforce @container query layouts (never @media).',
    'Use semantic tokens for colors and spacing.',
  ])
  assert.deepEqual(codm.states, ['default', 'hover'])
  assert.deepEqual(codm.variants, ['Primary', 'Secondary'])
  assert.deepEqual(codm.tokens, [{ name: '--x-bg-action-primary', value: 'oklch(0.9 0.2 100)' }])

  const fcm = parseSpecMd(specMd, 'FCM')
  assert.deepEqual(fcm.tokens, [{ name: '--x-bg-action-primary', value: 'oklch(0.6 0.2 150)' }])

  // Regression fixture: a prior bug's double-escape silently zeroed EVERY
  // component's token contract (not just special-character headings) —
  // asserting the tokens array is non-empty here is the direct lock.
  assert.ok(codm.tokens.length > 0, 'expected at least one resolved token, got none (the double-escape regression)')
})
