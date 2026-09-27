import { describe, expect, it } from 'vitest'

import { niceDomain, sharedPriceDomain } from './scale'
import type { FuturesProduct } from './types'

describe('niceDomain', () => {
  it('rounds outwards to round gridlines', () => {
    expect(niceDomain(127.7, 229.4)).toEqual({ min: 100, max: 250, ticks: [100, 150, 200, 250] })
  })

  it('does not start the scale at zero', () => {
    expect(niceDomain(141, 178).min).toBe(140)
  })

  it('widens a flat range instead of dividing by zero', () => {
    const domain = niceDomain(150, 150)

    expect(domain.min).toBeLessThan(150)
    expect(domain.max).toBeGreaterThan(150)
  })
})

describe('sharedPriceDomain', () => {
  const product = (label: string, base: number, peak: number, offPeak: number): FuturesProduct => ({
    id: label,
    label,
    quotes: [{ tradingDay: '2026-09-01', base, peak, offPeak }],
  })
  const products = [product('Oct-26', 160, 180, 148), product('Mar-27', 137, 150, 128)]

  it('spans every product so charts share one scale', () => {
    const domain = sharedPriceDomain(products, new Set(['base', 'peak', 'offPeak']))

    expect(domain.min).toBeLessThanOrEqual(128)
    expect(domain.max).toBeGreaterThanOrEqual(180)
  })

  it('ignores profiles that are not selected', () => {
    const domain = sharedPriceDomain(products, new Set(['base']))

    expect(domain.min).toBeGreaterThan(128)
    expect(domain.max).toBeLessThan(180)
  })
})
