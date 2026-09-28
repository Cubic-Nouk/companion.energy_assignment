import { describe, expect, it } from 'vitest'

import { contractCoverage } from '../features/control-room/domain/site'
import { listSites, parseAsset, type RawAsset } from './sites'

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

describe('parseAsset', () => {
  const battery: RawAsset = {
    id: 'battery',
    type: 'battery',
    capacityKw: 500,
    isSteered: false,
    stateOfChargePercent: 50,
    flow: 'charging',
  }

  it('keeps a valid battery with its charge and flow', () => {
    expect(parseAsset(battery, 'site')).toMatchObject({
      stateOfChargePercent: 50,
      flow: 'charging',
    })
  })

  it('keeps a name when there is one', () => {
    expect(parseAsset({ ...battery, name: 'Battery 1' }, 'site')).toMatchObject({
      name: 'Battery 1',
    })
  })

  // The valid battery with one field missing, as a hand-edited fixture could leave it.
  const noCharge: RawAsset = {
    id: 'battery',
    type: 'battery',
    capacityKw: 500,
    isSteered: false,
    flow: 'charging',
  }
  const noSteering: RawAsset = {
    id: 'battery',
    type: 'battery',
    capacityKw: 500,
    stateOfChargePercent: 50,
    flow: 'charging',
  }

  it.each<[string, RawAsset]>([
    ['an empty name', { ...battery, name: '' }],
    ['a blank name', { ...battery, name: '   ' }],
    ['a charge below 0', { ...battery, stateOfChargePercent: -1 }],
    ['a charge above 100', { ...battery, stateOfChargePercent: 101 }],
    ['a charge that is not a number', { ...battery, stateOfChargePercent: Number.NaN }],
    ['no charge', noCharge],
    ['an unknown flow', { ...battery, flow: 'sleeping' }],
    ['no steering state', noSteering],
    ['an unknown type', { ...battery, type: 'nuclear' }],
    ['no capacity', { ...battery, capacityKw: 0 }],
  ])('rejects a battery with %s', (_case, raw) => {
    expect(() => parseAsset(raw, 'site')).toThrow(/asset battery on site site/)
  })
})
