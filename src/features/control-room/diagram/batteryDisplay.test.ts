import { describe, expect, it } from 'vitest'

import { batteryLevel } from './batteryDisplay'

describe('batteryLevel', () => {
  it.each([
    [0, 'low'],
    [33, 'low'],
    [34, 'medium'],
    [66, 'medium'],
    [67, 'full'],
    [100, 'full'],
  ])('reads %i%% as %s', (percent, level) => {
    expect(batteryLevel(percent)).toBe(level)
  })
})
