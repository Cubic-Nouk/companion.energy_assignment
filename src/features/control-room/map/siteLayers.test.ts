import { describe, expect, it } from 'vitest'

import { SITES_ANCHOR_LAYER, SITES_SOURCE, sitesSource } from './siteLayers'

describe('site map source', () => {
  it('clusters the sites', () => {
    const source = sitesSource({ type: 'FeatureCollection', features: [] })

    expect(source.cluster).toBe(true)
  })

  it('keeps the source live through a layer that draws nothing', () => {
    expect(SITES_ANCHOR_LAYER.source).toBe(SITES_SOURCE)
    expect(SITES_ANCHOR_LAYER.paint?.['circle-opacity']).toBe(0)
  })
})
