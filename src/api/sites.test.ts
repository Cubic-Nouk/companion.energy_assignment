import { describe, expect, it } from 'vitest'

import { contractCoverage } from '../features/control-room/domain/site'
import { listSites } from './sites'

describe('sites API', () => {
  const sites = listSites()

  it('lists sites with unique ids', () => {
    expect(new Set(sites.map((site) => site.id)).size).toBe(sites.length)
  })

  it('mixes sites with no contract, one, and several', () => {
    expect(new Set(sites.map(contractCoverage))).toEqual(new Set(['none', 'single', 'multiple']))
  })

  it('includes standalone solar farms next to consuming sites', () => {
    expect(sites.filter((site) => site.category === 'solarFarm').length).toBeGreaterThanOrEqual(2)
  })

  it('packs several sites close together, so the map has clusters to show', () => {
    const antwerp = sites.filter((site) => site.address.city === 'Antwerp')

    expect(antwerp.length).toBeGreaterThanOrEqual(5)
  })
})
