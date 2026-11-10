import assert from 'node:assert/strict'
import test from 'node:test'
import { filterProductsByPrice } from './productFilter.js'

const products = [
  { id: 'shirt', price: 499 },
  { id: 'mouse', price: 999 },
  { id: 'phone', price: 24999 },
]

test('returns all products when no price limits are set', () => {
  assert.deepEqual(filterProductsByPrice(products, '', ''), products)
})

test('filters inclusively by minimum and maximum price', () => {
  assert.deepEqual(filterProductsByPrice(products, '499', '999'), products.slice(0, 2))
})

test('returns an empty list when no product matches the price range', () => {
  assert.deepEqual(filterProductsByPrice(products, '1000', '2000'), [])
})
