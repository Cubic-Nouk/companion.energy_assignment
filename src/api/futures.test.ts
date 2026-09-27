import { describe, expect, it } from 'vitest'

import { FUTURES_HISTORY, queryFutures } from './futures'

const SEPTEMBER = { from: '2026-09-01', to: '2026-09-28' }

describe('futures API', () => {
  it('covers June to September 2026', () => {
    expect(FUTURES_HISTORY).toEqual({ from: '2026-06-01', to: '2026-09-28' })
  })

  it('lists the products of a granularity in delivery order', () => {
    const labels = (granularity: 'month' | 'quarter' | 'year') =>
      queryFutures({ market: 'be', granularity, range: SEPTEMBER }).map((p) => p.label)

    expect(labels('month')).toEqual(['Oct-26', 'Nov-26', 'Dec-26', 'Jan-27', 'Feb-27', 'Mar-27'])
    expect(labels('quarter')).toEqual(['Q4-26', 'Q1-27', 'Q2-27', 'Q3-27'])
    expect(labels('year')).toEqual(['Cal-27', 'Cal-28'])
  })

  it('keeps only the quotes inside the range', () => {
    const [product] = queryFutures({
      market: 'be',
      granularity: 'month',
      range: { from: '2026-09-21', to: '2026-09-27' },
    })

    expect(product?.quotes.map((q) => q.tradingDay)).toEqual([
      '2026-09-21',
      '2026-09-22',
      '2026-09-23',
      '2026-09-24',
      '2026-09-25',
    ])
  })

  it('returns the same prices for a day whatever the range around it', () => {
    const day = (range: typeof SEPTEMBER) =>
      queryFutures({ market: 'be', granularity: 'month', range })[0]?.quotes.find(
        (q) => q.tradingDay === '2026-09-15',
      )

    expect(day(SEPTEMBER)).toEqual(day(FUTURES_HISTORY))
  })
})
