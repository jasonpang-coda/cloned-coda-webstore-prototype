import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toKebabCase, toCamelCase } from '../tools/lib/naming.mjs'

test('toKebabCase handles an acronym-led name (the SKUCard regression)', () => {
  assert.equal(toKebabCase('SKUCard'), 'sku-card')
})

test('toKebabCase handles ordinary PascalCase', () => {
  assert.equal(toKebabCase('NavBar'), 'nav-bar')
  assert.equal(toKebabCase('SkuPromotionCard'), 'sku-promotion-card')
})

test('toKebabCase handles a mid-word acronym', () => {
  assert.equal(toKebabCase('HTTPServer'), 'http-server')
})

test('toCamelCase round-trips a kebab name', () => {
  assert.equal(toCamelCase('sku-card'), 'skuCard')
})
