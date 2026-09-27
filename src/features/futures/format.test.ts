import { describe, expect, it } from 'vitest'

import { formatPrice, formatShortDay, formatTradingDay } from './format'

describe('format', () => {
  it('shows prices with two decimals', () => {
    expect(formatPrice(157.6)).toBe('157.60')
  })

  it('formats trading days', () => {
    expect(formatTradingDay('2026-09-28')).toMatch(/^Mon 28 Sept? 2026$/)
    expect(formatShortDay('2026-09-07')).toBe('07/09')
  })
})
