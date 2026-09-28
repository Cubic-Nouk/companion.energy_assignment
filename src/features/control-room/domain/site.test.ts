import { describe, expect, it } from 'vitest'

import {
  contractCoverage,
  formatAddress,
  formatContractCount,
  isSiteCategory,
  type Site,
} from './site'

describe('formatAddress', () => {
  it('reads street, postal code and city, then country', () => {
    expect(
      formatAddress({
        street: 'Scheldelaan 450',
        postalCode: '2040',
        city: 'Antwerp',
        country: 'Belgium',
      }),
    ).toBe('Scheldelaan 450, 2040 Antwerp, Belgium')
  })
})

describe('contractCoverage', () => {
  const site = (contractIds: string[]): Site => ({
    id: 'site',
    name: 'Site',
    category: 'industrial',
    address: { street: 'Street 1', postalCode: '1000', city: 'Brussels', country: 'Belgium' },
    coordinates: [4.35, 50.85],
    assets: [],
    contractIds,
  })

  it.each([
    [[], 'none'],
    [['c1'], 'single'],
    [['c1', 'c2'], 'multiple'],
  ])('with contracts %j is %s', (contractIds, expected) => {
    expect(contractCoverage(site(contractIds))).toBe(expected)
  })
})

describe('formatContractCount', () => {
  it.each([
    [0, 'No contract'],
    [1, '1 contract'],
    [4, '4 contracts'],
  ])('reads %i as "%s"', (count, text) => {
    expect(formatContractCount(count)).toBe(text)
  })
})

describe('isSiteCategory', () => {
  it('accepts known categories only', () => {
    expect(isSiteCategory('solarFarm')).toBe(true)
    expect(isSiteCategory('castle')).toBe(false)
  })
})
