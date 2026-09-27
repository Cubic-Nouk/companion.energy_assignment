import { describe, expect, it } from 'vitest'

import { HOURS_PER_WEEK, isBandShown, pricesFromBase, type Profile } from './profiles'

describe('pricesFromBase', () => {
  it('keeps base the hour-weighted average of peak and off-peak', () => {
    const { base, peak, offPeak } = pricesFromBase(157.68, 32.65)

    expect((60 * peak + 108 * offPeak) / HOURS_PER_WEEK).toBeCloseTo(base, 10)
  })

  it('makes peak minus off-peak equal to the premium', () => {
    const { peak, offPeak } = pricesFromBase(160, 40)

    expect(peak - offPeak).toBeCloseTo(40, 10)
  })

  it('lets peak fall below off-peak when the premium is negative', () => {
    const { peak, offPeak } = pricesFromBase(80, -5)

    expect(peak).toBeLessThan(offPeak)
  })
})

describe('isBandShown', () => {
  it.each<[Profile[], boolean]>([
    [['base', 'peak', 'offPeak'], true],
    [['peak', 'offPeak'], true],
    [['base', 'peak'], false],
    [['base'], false],
  ])('with %j returns %s', (profiles, expected) => {
    expect(isBandShown(new Set(profiles))).toBe(expected)
  })
})
