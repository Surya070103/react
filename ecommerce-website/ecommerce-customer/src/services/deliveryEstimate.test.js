import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getDeliveryEstimate } from './deliveryEstimate.js'

test('delivery estimates skip weekends', () => {
  const estimate = getDeliveryEstimate(new Date(2026, 10, 13, 12))

  assert.deepEqual(
    [estimate.earliest.getFullYear(), estimate.earliest.getMonth(), estimate.earliest.getDate()],
    [2026, 10, 18],
  )
  assert.deepEqual(
    [estimate.latest.getFullYear(), estimate.latest.getMonth(), estimate.latest.getDate()],
    [2026, 10, 20],
  )
})
