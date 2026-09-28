import { describe, expect, it } from 'vitest'

import type { Site } from '../domain/site'
import { buildSiteGraph } from './siteGraph'

const site = (assets: Site['assets']): Site => ({
  id: 'antwerp',
  name: 'Scheldt Cold Storage',
  category: 'logistics',
  address: { street: 'Scheldelaan 450', postalCode: '2040', city: 'Antwerp', country: 'Belgium' },
  coordinates: [4.3, 51.29],
  assets,
  contractIds: [],
})

describe('buildSiteGraph', () => {
  it.each([
    [[], 'No contract', 'none'],
    [['c1'], '1 contract', 'single'],
    [['c1', 'c2'], '2 contracts', 'multiple'],
  ])('with contracts %j subtitles the grid connection "%s"', (contractIds, subtitle, contracts) => {
    const { nodes } = buildSiteGraph({ ...site([]), contractIds })

    expect(nodes[0]?.data.subtitle).toBe(subtitle)
    expect(nodes[0]?.data.contracts).toBe(contracts)
  })

  it('draws only the grid connection for a site with no assets', () => {
    const { nodes, edges } = buildSiteGraph(site([]))

    expect(nodes.map((n) => n.data.kind)).toEqual(['gridConnection'])
    expect(edges).toEqual([])
  })

  it('links every asset back to the grid connection', () => {
    const { edges } = buildSiteGraph(
      site([
        { id: 'solar', type: 'solar', capacityKw: 850 },
        { id: 'battery', type: 'battery', capacityKw: 500, isSteered: false },
      ]),
    )

    expect(edges.map((e) => [e.source, e.target])).toEqual([
      ['antwerp-grid', 'solar'],
      ['antwerp-grid', 'battery'],
    ])
  })

  it('stacks assets to the right, centred on the grid connection', () => {
    const { nodes } = buildSiteGraph(
      site([
        { id: 'solar', type: 'solar', capacityKw: 850 },
        { id: 'wind', type: 'wind', capacityKw: 2000 },
      ]),
    )
    const [grid, first, second] = nodes

    expect(first?.position.x).toBeGreaterThan(grid?.position.x ?? 0)
    expect(first?.position.x).toBe(second?.position.x)
    expect(((first?.position.y ?? 0) + (second?.position.y ?? 0)) / 2).toBe(grid?.position.y)
  })

  it('labels assets by type and hints at whether a battery is steered', () => {
    const { nodes } = buildSiteGraph(
      site([
        { id: 'solar', type: 'solar', capacityKw: 850 },
        { id: 'battery', type: 'battery', capacityKw: 500, isSteered: false },
        { id: 'steered', type: 'battery', capacityKw: 500, isSteered: true },
      ]),
    )

    expect(nodes.map((n) => [n.data.title, n.data.hint])).toEqual([
      ['Grid Connection', undefined],
      ['Solar Panels', undefined],
      ['Battery', 'Not Steering'],
      ['Battery', 'Steering'],
    ])
  })
})
