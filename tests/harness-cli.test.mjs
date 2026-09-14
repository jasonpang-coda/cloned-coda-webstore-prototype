import { test } from 'node:test'
import assert from 'node:assert/strict'
import { writeFileSync, rmSync, existsSync } from 'node:fs'
import path from 'node:path'
import { runNode, ROOT } from './helpers.mjs'

// harness-cli.mjs statically parses .stories.js source text (it never
// imports/executes the story or its component), so a plain text fixture is
// enough — no working Vue component required. Fixtures are written directly
// into the real stories/components dirs (harness-cli.mjs has no override for
// that path) with a ZZZTest-prefixed name unlikely to collide with anything
// real, and always removed in `finally`.

const STORY_PATH = path.join(ROOT, 'src/library/stories/ZZZTestNoTokens.stories.js')
const COMPONENT_PATH = path.join(ROOT, 'src/components/ZZZTestNoTokens.vue')

test('harness-cli: a story with zero tokens fails loud instead of silently passing', () => {
  writeFileSync(COMPONENT_PATH, '<template><div class="zzz-test-no-tokens">no tokens here</div></template>\n')
  writeFileSync(STORY_PATH, `
import ZZZTestNoTokens from '@/components/ZZZTestNoTokens.vue'
export default {
  id: 'zzz-test-no-tokens',
  title: 'ZZZ Test No Tokens',
  group: 'Components',
  component: ZZZTestNoTokens,
  variants: [{ name: 'Default', props: () => ({}) }],
}
`)
  try {
    const { code, stdout } = runNode('tools/harness-cli.mjs', ['test', 'ZZZTestNoTokens', '--json'])
    const result = JSON.parse(stdout)
    assert.equal(code, 1, 'a zero-token story must fail the sweep, not pass silently')
    const failureTypes = result.results[0].failures.map((f) => f.type)
    assert.ok(failureTypes.includes('NO_TOKENS_TESTED'), `expected NO_TOKENS_TESTED, got: ${JSON.stringify(failureTypes)}`)
  } finally {
    rmSync(STORY_PATH, { force: true })
    rmSync(COMPONENT_PATH, { force: true })
  }
})

const MEDIA_STORY_PATH = path.join(ROOT, 'src/library/stories/ZZZTestMediaComment.stories.js')
const MEDIA_COMPONENT_PATH = path.join(ROOT, 'src/components/ZZZTestMediaComment.vue')

test('harness-cli: "@media" mentioned in a comment is not flagged as a real @media query', () => {
  // Regression fixture reproducing the exact SkuCard.vue false positive: an
  // @media MENTIONED in a comment (no brace on the same line), followed by
  // an unrelated selector's `{`. The old [^{]* regex spanned across the
  // comment into that selector and reported a fabricated violation.
  writeFileSync(MEDIA_COMPONENT_PATH, `<template><div class="zzz-media-test"></div></template>
<style scoped>
/* mirrors an HDR @media block
   defined elsewhere, not here */
.zzz-media-test {
  color: red;
}
@media (prefers-reduced-motion: reduce) {
  .zzz-media-test { color: blue; }
}
</style>
`)
  writeFileSync(MEDIA_STORY_PATH, `
import ZZZTestMediaComment from '@/components/ZZZTestMediaComment.vue'
export default {
  id: 'zzz-test-media-comment',
  title: 'ZZZ Test Media Comment',
  group: 'Components',
  component: ZZZTestMediaComment,
  tokens: ['--x-text-header-default'],
  variants: [{ name: 'Default', props: () => ({}) }],
}
`)
  try {
    const { stdout } = runNode('tools/harness-cli.mjs', ['test', 'ZZZTestMediaComment', '--json'])
    const result = JSON.parse(stdout)
    const mediaFailures = result.results[0].failures.filter((f) => f.type === 'MEDIA_QUERY_VIOLATION')
    assert.deepEqual(mediaFailures, [], `expected no MEDIA_QUERY_VIOLATION false positive, got: ${JSON.stringify(mediaFailures)}`)
  } finally {
    rmSync(MEDIA_STORY_PATH, { force: true })
    rmSync(MEDIA_COMPONENT_PATH, { force: true })
  }
})

const GRID_STORY_PATH = path.join(ROOT, 'src/library/stories/ZZZTestGrid.stories.js')
const GRID_COMPONENT_PATH = path.join(ROOT, 'src/components/ZZZTestGrid.vue')

test('harness-cli: title/id extraction is scoped to defineStory(...), not the whole file', () => {
  // Regression fixture reproducing the Grid/BundleGrid/GiftGrid false label:
  // demo-data object literals with their own `title:`/`id:` keys sit ABOVE
  // the defineStory({...}) call. A first-match-over-the-whole-file regex
  // grabs those literal values instead of the real story's id/title.
  writeFileSync(GRID_COMPONENT_PATH, '<template><div class="zzz-test-grid"></div></template>\n')
  writeFileSync(GRID_STORY_PATH, `
import ZZZTestGrid from '@/components/ZZZTestGrid.vue'
import { defineStory } from '../story.js'

function cards () {
  return [
    { id: 'bundle-offer-1', title: 'BUNDLE OFFER 1' },
    { id: 'bundle-offer-2', title: 'BUNDLE OFFER 2' },
  ]
}

export default defineStory({
  id: 'zzz-test-grid',
  title: 'ZZZ Test Grid',
  group: 'Components',
  component: ZZZTestGrid,
  tokens: ['--x-text-header-default'],
  variants: [{ name: 'Default', props: () => ({ cards: cards() }) }],
})
`)
  try {
    const { stdout } = runNode('tools/harness-cli.mjs', ['list', '--json'])
    const stories = JSON.parse(stdout)
    const story = stories.find((s) => s.componentFile === 'ZZZTestGrid.vue')
    assert.ok(story, 'expected the fixture story to be discovered')
    assert.equal(story.id, 'zzz-test-grid', `id must come from defineStory(), got: ${story.id}`)
    assert.equal(story.title, 'ZZZ Test Grid', `title must come from defineStory(), got: ${story.title}`)
  } finally {
    rmSync(GRID_STORY_PATH, { force: true })
    rmSync(GRID_COMPONENT_PATH, { force: true })
  }
})

const STATE_STORY_PATH = path.join(ROOT, 'src/library/stories/ZZZTestSingleState.stories.js')
const STATE_COMPONENT_PATH = path.join(ROOT, 'src/components/ZZZTestSingleState.vue')

test('harness-cli: states: [\'default\'] without presentational gets a non-blocking SINGLE_STATE_COVERAGE warning', () => {
  writeFileSync(STATE_COMPONENT_PATH, '<template><button class="zzz-test-single-state">click me</button></template>\n')
  writeFileSync(STATE_STORY_PATH, `
import ZZZTestSingleState from '@/components/ZZZTestSingleState.vue'
export default {
  id: 'zzz-test-single-state',
  title: 'ZZZ Test Single State',
  group: 'Components',
  component: ZZZTestSingleState,
  tokens: ['--x-text-header-default'],
  states: ['default'],
  variants: [{ name: 'Default', props: () => ({}) }],
}
`)
  try {
    const { code, stdout } = runNode('tools/harness-cli.mjs', ['test', 'ZZZTestSingleState', '--json'])
    assert.equal(code, 0, 'a state-coverage warning must NOT fail the sweep — it is a warning, not a failure')
    const result = JSON.parse(stdout)
    const warningTypes = result.results[0].stateCoverageWarnings.map((w) => w.type)
    assert.ok(warningTypes.includes('SINGLE_STATE_COVERAGE'), `expected SINGLE_STATE_COVERAGE, got: ${JSON.stringify(warningTypes)}`)
    assert.deepEqual(result.results[0].failures, [], 'a state-coverage issue must not also appear in failures')
  } finally {
    rmSync(STATE_STORY_PATH, { force: true })
    rmSync(STATE_COMPONENT_PATH, { force: true })
  }
})

test('harness-cli: presentational: true suppresses the SINGLE_STATE_COVERAGE warning', () => {
  writeFileSync(STATE_COMPONENT_PATH, '<template><div class="zzz-test-single-state">static content</div></template>\n')
  writeFileSync(STATE_STORY_PATH, `
import ZZZTestSingleState from '@/components/ZZZTestSingleState.vue'
export default {
  id: 'zzz-test-single-state',
  title: 'ZZZ Test Single State',
  group: 'Components',
  component: ZZZTestSingleState,
  tokens: ['--x-text-header-default'],
  states: ['default'],
  presentational: true,
  variants: [{ name: 'Default', props: () => ({}) }],
}
`)
  try {
    const { code, stdout } = runNode('tools/harness-cli.mjs', ['test', 'ZZZTestSingleState', '--json'])
    assert.equal(code, 0)
    const result = JSON.parse(stdout)
    assert.deepEqual(result.results[0].stateCoverageWarnings, [], 'presentational: true must suppress the warning entirely, not just downgrade it')
  } finally {
    rmSync(STATE_STORY_PATH, { force: true })
    rmSync(STATE_COMPONENT_PATH, { force: true })
  }
})

test('harness-cli: a story with more than the default state gets no SINGLE_STATE_COVERAGE warning', () => {
  writeFileSync(STATE_COMPONENT_PATH, '<template><button class="zzz-test-single-state">click me</button></template>\n')
  writeFileSync(STATE_STORY_PATH, `
import ZZZTestSingleState from '@/components/ZZZTestSingleState.vue'
export default {
  id: 'zzz-test-single-state',
  title: 'ZZZ Test Single State',
  group: 'Components',
  component: ZZZTestSingleState,
  tokens: ['--x-text-header-default'],
  states: ['default', 'hover', 'pressed'],
  variants: [{ name: 'Default', props: () => ({}) }],
}
`)
  try {
    const { stdout } = runNode('tools/harness-cli.mjs', ['test', 'ZZZTestSingleState', '--json'])
    const result = JSON.parse(stdout)
    assert.deepEqual(result.results[0].stateCoverageWarnings, [])
  } finally {
    rmSync(STATE_STORY_PATH, { force: true })
    rmSync(STATE_COMPONENT_PATH, { force: true })
  }
})

test('harness-cli: cleanup left no stray fixtures behind', () => {
  assert.equal(existsSync(STORY_PATH), false)
  assert.equal(existsSync(COMPONENT_PATH), false)
  assert.equal(existsSync(MEDIA_STORY_PATH), false)
  assert.equal(existsSync(MEDIA_COMPONENT_PATH), false)
  assert.equal(existsSync(GRID_STORY_PATH), false)
  assert.equal(existsSync(GRID_COMPONENT_PATH), false)
  assert.equal(existsSync(STATE_STORY_PATH), false)
  assert.equal(existsSync(STATE_COMPONENT_PATH), false)
})
