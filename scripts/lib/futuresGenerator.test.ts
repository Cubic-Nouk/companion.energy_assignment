// @vitest-environment node
import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { HOURS_PER_WEEK } from '../../src/features/futures/domain/profiles.ts'
import { generateFuturesFixture, serializeFixture, tradingDaysIn } from './futuresGenerator.ts'

const SEPTEMBER = { from: '2026-09-01', to: '2026-09-28' }

describe('tradingDaysIn', () => {
  it('skips weekends', () => {
    // 2026-09-04 is a Friday, 2026-09-07 the next Monday.
    expect(tradingDaysIn({ from: '2026-09-04', to: '2026-09-07' })).toEqual([
      '2026-09-04',
      '2026-09-07',
    ])
  })

  it('counts the 20 working days of 1 to 28 September 2026', () => {
    expect(tradingDaysIn(SEPTEMBER)).toHaveLength(20)
  })
})

describe('generateFuturesFixture', () => {
  const fixture = generateFuturesFixture(SEPTEMBER)

  it('is deterministic', () => {
    expect(generateFuturesFixture(SEPTEMBER)).toEqual(fixture)
  })

  it('covers Belgium only: 6 months + 4 quarters + 2 years', () => {
    expect(fixture.products).toHaveLength(12)
    expect(new Set(fixture.products.map((p) => p.market))).toEqual(new Set(['be']))
  })

  it('gives every product one price per trading day and profile', () => {
    fixture.products.forEach((product) => {
      expect(product.base).toHaveLength(20)
      expect(product.peak).toHaveLength(20)
      expect(product.offPeak).toHaveLength(20)
    })
  })

  it('keeps base the hour-weighted average of peak and off-peak', () => {
    fixture.products.forEach((product) => {
      product.base.forEach((base, day) => {
        const weighted =
          (60 * (product.peak[day] ?? 0) + 108 * (product.offPeak[day] ?? 0)) / HOURS_PER_WEEK
        // Each price is rounded to the cent, so allow a cent of drift.
        expect(Math.abs(weighted - base)).toBeLessThanOrEqual(0.01)
      })
    })
  })
})

describe('data/futures.json', () => {
  it('is up to date with the generator (run `npm run data:generate` after changing it)', () => {
    const onDisk = readFileSync(new URL('../../data/futures.json', import.meta.url), 'utf8')

    expect(onDisk).toBe(serializeFixture(generateFuturesFixture()))
  })
})
