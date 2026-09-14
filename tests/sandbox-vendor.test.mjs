import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { walkClosure } from '../tools/sandbox/lib/vendor.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'src')

function baseCtx(overrides = {}) {
  return {
    ROOT, SRC, VENDOR: '/tmp/unused-in-these-tests', stores: ['codm'],
    CURATED_COMPONENTS: [],
    ALWAYS_VENDOR: [],
    EXCLUDED_COMPONENT_DIRS: ['checkout', 'steps', 'base'],
    EXCLUDED_COMPONENT_FILES: ['App.vue', 'NavBar.vue'],
    TOKEN_FILES: [],
    WHOLESALE_DIRS: [],
    ...overrides,
  }
}

test('walkClosure() throws when an excluded file is a curated SEED itself (not just a transitive import)', () => {
  // Regression lock: the boundary check originally only fired on files
  // discovered while walking imports — a component added directly to
  // CURATED_COMPONENTS from an excluded dir/file bypassed it entirely and
  // exported successfully with no error. walkClosure() must validate every
  // seed up front, before it ever starts walking imports.
  const ctx = baseCtx({ CURATED_COMPONENTS: ['checkout/PcCard.vue'] })
  assert.throws(
    () => walkClosure(ctx),
    /Boundary violation: "checkout\/PcCard\.vue" is excluded/,
  )
})

test('walkClosure() throws when an excluded file is only reached transitively', () => {
  const ctx = baseCtx({ CURATED_COMPONENTS: ['NavBar.vue'] })
  assert.throws(() => walkClosure(ctx), /Boundary violation: "NavBar\.vue" is excluded/)
})

test('walkClosure() succeeds for a real curated component with no excluded imports', () => {
  // Grid.vue is one of the actual curated seeds — a plain layout primitive
  // with no checkout/nav-chrome dependency. This also locks that legitimate
  // curated components still export cleanly after the throw refactor.
  const ctx = baseCtx({ CURATED_COMPONENTS: ['Grid.vue'] })
  const closure = walkClosure(ctx)
  assert.ok(closure.size > 0)
  const relPaths = [...closure].map((p) => path.relative(SRC, p))
  assert.ok(relPaths.includes(path.join('components', 'Grid.vue')))
})
