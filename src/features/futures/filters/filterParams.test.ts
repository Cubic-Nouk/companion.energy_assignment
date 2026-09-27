import { describe, expect, it } from 'vitest'

import { parseFilters, serializeFilters, type FuturesFilters } from './filterParams'

const bounds = { from: '2026-06-01', to: '2026-09-28' }
const defaults: FuturesFilters = {
  market: 'be',
  granularity: 'month',
  profiles: new Set(['base', 'peak', 'offPeak']),
  range: { from: '2026-09-01', to: '2026-09-28' },
}

const parse = (query: string) => parseFilters(new URLSearchParams(query), defaults, bounds)

describe('parseFilters', () => {
  it('uses the defaults for an empty URL', () => {
    expect(parse('')).toEqual(defaults)
  })

  it('reads every filter from the URL', () => {
    expect(
      parse('market=fr&granularity=quarter&profiles=base,peak&from=2026-09-21&to=2026-09-27'),
    ).toEqual({
      market: 'fr',
      granularity: 'quarter',
      profiles: new Set(['base', 'peak']),
      range: { from: '2026-09-21', to: '2026-09-27' },
    })
  })

  it('treats an empty profiles value as no profile selected', () => {
    expect(parse('profiles=').profiles).toEqual(new Set())
  })

  it('drops unknown values instead of failing', () => {
    const filters = parse('market=xx&granularity=decade&profiles=base,weekend')

    expect(filters.market).toBe('be')
    expect(filters.granularity).toBe('month')
    expect(filters.profiles).toEqual(new Set(['base']))
  })

  it('falls back to the default range when the one in the URL is unusable', () => {
    expect(parse('from=2026-09-27&to=2026-09-21').range).toEqual(defaults.range)
    expect(parse('from=2025-01-01&to=2025-01-31').range).toEqual(defaults.range)
    expect(parse('from=yesterday&to=today').range).toEqual(defaults.range)
  })
})

describe('serializeFilters', () => {
  it('round-trips through parseFilters', () => {
    const filters: FuturesFilters = {
      market: 'fr',
      granularity: 'year',
      profiles: new Set(['offPeak', 'base']),
      range: { from: '2026-07-01', to: '2026-07-31' },
    }

    expect(parseFilters(serializeFilters(filters), defaults, bounds)).toEqual(filters)
  })

  it('writes profiles in a stable order', () => {
    const params = serializeFilters({ ...defaults, profiles: new Set(['offPeak', 'base']) })

    expect(params.get('profiles')).toBe('base,offPeak')
  })
})
