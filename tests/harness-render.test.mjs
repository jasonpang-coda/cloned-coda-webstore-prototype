import { test } from 'node:test'
import assert from 'node:assert/strict'
import { writeFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { runNode, ROOT } from './helpers.mjs'

test('harness-render: renders every variant at all 3 widths (not just iphone)', () => {
  const { code, stdout } = runNode('tools/harness-render.mjs', ['NavBar', '--json'])
  assert.equal(code, 0)
  const result = JSON.parse(stdout)
  assert.equal(result.passed, true)
  const widths = new Set(result.results.map((r) => r.width))
  assert.deepEqual([...widths].sort(), ['iphone', 'responsive', 'samsung'])
  // NavBar has 1 known variant — 1 variant * 3 widths.
  assert.equal(result.renderedCount, result.results.length)
  assert.equal(result.renderedCount % 3, 0, 'render count should be a multiple of 3 (one per width)')
})

const STORY_PATH = path.join(ROOT, 'src/library/stories/ZZZTestRenderCrash.stories.js')
const COMPONENT_PATH = path.join(ROOT, 'src/components/ZZZTestRenderCrash.vue')

test('harness-render: a real setup()-time crash is still caught (the gate\'s whole purpose, REG-RETRO01)', () => {
  writeFileSync(COMPONENT_PATH, `<script setup>
const boom = thisBindingDoesNotExist.value
</script>
<template><div>{{ boom }}</div></template>
`)
  writeFileSync(STORY_PATH, `
import ZZZTestRenderCrash from '@/components/ZZZTestRenderCrash.vue'
export default {
  id: 'zzz-test-render-crash',
  title: 'ZZZ Test Render Crash',
  group: 'Components',
  component: ZZZTestRenderCrash,
  variants: [{ name: 'Default', props: () => ({}) }],
}
`)
  try {
    const { code, stdout } = runNode('tools/harness-render.mjs', ['ZZZTestRenderCrash', '--json'])
    assert.equal(code, 1)
    const result = JSON.parse(stdout)
    assert.equal(result.passed, false)
    assert.ok(result.results.every((r) => r.status === 'FAIL'))
    assert.match(result.results[0].error, /thisBindingDoesNotExist/)
    // Every width should have attempted (and failed) the render, not bailed
    // after the first failure.
    assert.equal(result.results.length, 3)
  } finally {
    rmSync(STORY_PATH, { force: true })
    rmSync(COMPONENT_PATH, { force: true })
  }
})

test('harness-render: requesting a nonexistent story fails loud, not a silent no-op', () => {
  const { code, stderr } = runNode('tools/harness-render.mjs', ['nonexistent-story-name-zzz', '--json'])
  assert.equal(code, 1)
  assert.match(stderr, /No story matches/)
})

test('harness-render: --locales unset stays exactly the default en-only 3-render sweep (no cost regression)', () => {
  const { code, stdout } = runNode('tools/harness-render.mjs', ['NavBar', '--json'])
  const result = JSON.parse(stdout)
  assert.equal(code, 0)
  assert.equal(result.results.length, 3)
  assert.ok(result.results.every((r) => r.locale === 'en'))
})

test('harness-render: --locales stress adds real ar/ja content (not a synthetic string), 3x the render count', () => {
  const { code, stdout } = runNode('tools/harness-render.mjs', ['NavBar', '--locales', 'stress', '--json'])
  assert.equal(code, 0)
  const result = JSON.parse(stdout)
  assert.equal(result.passed, true)
  // 1 variant * 3 widths * 3 locales (en, ar, ja).
  assert.equal(result.results.length, 9)
  const locales = new Set(result.results.map((r) => r.locale))
  assert.deepEqual([...locales].sort(), ['ar', 'en', 'ja'])
})

test('harness-render: --locales <csv> accepts an explicit list and de-dupes an explicit "en"', () => {
  const { code, stdout } = runNode('tools/harness-render.mjs', ['NavBar', '--locales', 'en,ar', '--json'])
  assert.equal(code, 0)
  const result = JSON.parse(stdout)
  // 1 variant * 3 widths * 2 locales — not 3, even though the caller passed
  // "en" explicitly alongside it (en is always included; it should not be
  // double-counted).
  assert.equal(result.results.length, 6)
})

test('harness-render: a locale-stress render still catches a real setup()-time crash', () => {
  writeFileSync(COMPONENT_PATH, `<script setup>
const boom = thisBindingDoesNotExist.value
</script>
<template><div>{{ boom }}</div></template>
`)
  writeFileSync(STORY_PATH, `
import ZZZTestRenderCrash from '@/components/ZZZTestRenderCrash.vue'
export default {
  id: 'zzz-test-render-crash',
  title: 'ZZZ Test Render Crash',
  group: 'Components',
  component: ZZZTestRenderCrash,
  variants: [{ name: 'Default', props: () => ({}) }],
}
`)
  try {
    const { code, stdout } = runNode('tools/harness-render.mjs', ['ZZZTestRenderCrash', '--locales', 'stress', '--json'])
    assert.equal(code, 1)
    const result = JSON.parse(stdout)
    assert.equal(result.passed, false)
    // 1 variant * 3 widths * 3 locales, every single one failing — a locale
    // pass must not silently swallow a crash any of the other dimensions
    // would have caught.
    assert.equal(result.results.length, 9)
    assert.ok(result.results.every((r) => r.status === 'FAIL'))
  } finally {
    rmSync(STORY_PATH, { force: true })
    rmSync(COMPONENT_PATH, { force: true })
  }
})
