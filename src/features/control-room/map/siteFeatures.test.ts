import { describe, expect, it } from 'vitest'

import type { Site } from '../domain/site'
import { toSiteFeatures } from './siteFeatures'

const site: Site = {
  id: 'antwerp',
  name: 'Scheldt Cold Storage',
  category: 'logistics',
  address: { street: 'Scheldelaan 450', postalCode: '2040', city: 'Antwerp', country: 'Belgium' },
  coordinates: [4.3, 51.29],
  assets: [],
  contractIds: [],
}

describe('toSiteFeatures', () => {
  it('turns each site into a GeoJSON point at its coordinates, keyed by site id', () => {
    const [feature] = toSiteFeatures([site]).features

    expect(feature?.geometry).toEqual({ type: 'Point', coordinates: [4.3, 51.29] })
    expect(feature?.properties).toEqual({ siteId: 'antwerp' })
  })
})
