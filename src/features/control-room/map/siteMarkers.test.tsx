import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { act } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Site } from '../domain/site'
import { createSiteMarkers, type SiteMarkers } from './siteMarkers'

// A stand-in for MapLibre's Marker: it mounts the element into the page instead of a map.
vi.mock('maplibre-gl', () => ({
  Marker: class {
    private readonly element: HTMLElement

    constructor({ element }: { element: HTMLElement }) {
      this.element = element
    }

    setLngLat() {
      return this
    }

    addTo() {
      document.body.append(this.element)
      return this
    }

    remove() {
      this.element.remove()
    }

    getElement() {
      return this.element
    }
  },
}))

interface FakeFeature {
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: Record<string, unknown>
}

/** Just enough of a MapLibre map: render events, a clustered source, camera moves. */
class FakeMap {
  features: FakeFeature[] = []
  readonly source = {
    setData: vi.fn(() => Promise.resolve()),
    getClusterExpansionZoom: vi.fn(() => Promise.resolve(11)),
  }
  readonly easeTo = vi.fn()
  private readonly renderListeners = new Set<() => void>()

  on(_type: 'render', listener: () => void) {
    this.renderListeners.add(listener)
  }

  off(_type: 'render', listener: () => void) {
    this.renderListeners.delete(listener)
  }

  getSource() {
    return this.source
  }

  isSourceLoaded() {
    return true
  }

  querySourceFeatures() {
    return this.features
  }

  /** Plays one frame: the markers sync to the current features. */
  render() {
    act(() => {
      for (const listener of this.renderListeners) listener()
    })
  }
}

const site = (id: string, name: string, contractIds: string[] = []): Site => ({
  id,
  name,
  category: 'industrial',
  address: { street: 'Street 1', postalCode: '1000', city: 'Brussels', country: 'Belgium' },
  coordinates: [4.35, 50.85],
  assets: [],
  contractIds,
})

const SITES = [site('a', 'Alpha Works', ['c1']), site('b', 'Beta Plant'), site('c', 'Gamma Mill')]

const pointOf = (siteId: string): FakeFeature => ({
  geometry: { type: 'Point', coordinates: [4.35, 50.85] },
  properties: { siteId },
})

const clusterOf = (clusterId: number, count: number): FakeFeature => ({
  geometry: { type: 'Point', coordinates: [4.4, 50.9] },
  properties: { cluster: true, cluster_id: clusterId, point_count: count },
})

let markers: SiteMarkers | null = null

function setUp() {
  const map = new FakeMap()
  const onSelectSite = vi.fn()
  markers = createSiteMarkers(map as unknown as MapLibreMap, SITES, { onSelectSite })
  return { map, onSelectSite }
}

// Roots unmount in a microtask; let them finish before the next test.
const flushMicrotasks = () => act(() => Promise.resolve())

afterEach(async () => {
  act(() => {
    markers?.destroy()
  })
  markers = null
  await flushMicrotasks()
  document.body.innerHTML = ''
})

describe('createSiteMarkers', () => {
  it('draws one marker per visible site or cluster, even when a feature repeats across tiles', () => {
    const { map } = setUp()
    map.features = [pointOf('a'), pointOf('a'), clusterOf(7, 2)]

    map.render()

    expect(screen.getAllByRole('button', { name: /Alpha Works/ })).toHaveLength(1)
    expect(screen.getByRole('button', { name: /2 sites close together/ })).toBeInTheDocument()
  })

  it('removes the markers whose feature is no longer visible', async () => {
    const { map } = setUp()
    map.features = [pointOf('a'), pointOf('b')]
    map.render()

    map.features = [pointOf('a')]
    map.render()
    await flushMicrotasks()

    expect(screen.queryByRole('button', { name: /Beta Plant/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Alpha Works/ })).toBeInTheDocument()
  })

  it('zooms into a cluster to the zoom where its sites separate', async () => {
    const { map } = setUp()
    map.features = [clusterOf(7, 2)]
    map.render()

    await userEvent.click(screen.getByRole('button', { name: /2 sites close together/ }))

    expect(map.source.getClusterExpansionZoom).toHaveBeenCalledWith(7)
    expect(map.easeTo).toHaveBeenCalledWith({ center: [4.4, 50.9], zoom: 11 })
  })

  it('selects a site on click without letting the click reach the map', async () => {
    const { map, onSelectSite } = setUp()
    map.features = [pointOf('b')]
    map.render()
    const mapClick = vi.fn()
    document.body.addEventListener('click', mapClick)

    await userEvent.click(screen.getByRole('button', { name: /Beta Plant/ }))

    expect(onSelectSite).toHaveBeenCalledWith('b')
    expect(mapClick).not.toHaveBeenCalled()
    document.body.removeEventListener('click', mapClick)
  })

  it('lifts the selected site out of the clustered data and draws it on its own', () => {
    const { map } = setUp()

    act(() => {
      markers?.setSelectedSite('b')
    })

    const clustered = markers?.sourceData().features.map((f) => f.properties.siteId)
    expect(clustered).toEqual(['a', 'c'])
    expect(map.source.setData).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: /Beta Plant/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('keeps the other markers in place when the selection changes, so nothing flickers', () => {
    const { map } = setUp()
    map.features = [pointOf('a'), pointOf('c')]
    map.render()
    const alpha = screen.getByRole('button', { name: /Alpha Works/ })

    act(() => {
      markers?.setSelectedSite('b')
    })
    map.render()

    expect(screen.getByRole('button', { name: /Alpha Works/ })).toBe(alpha)
  })

  it('replaces a cluster whose count changed under the same id', async () => {
    const { map } = setUp()
    map.features = [clusterOf(7, 3)]
    map.render()

    map.features = [clusterOf(7, 2)]
    map.render()
    await flushMicrotasks()

    expect(screen.getByRole('button', { name: /2 sites close together/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /3 sites close together/ })).not.toBeInTheDocument()
  })

  it('puts the site back into the clusters once deselected', async () => {
    setUp()
    act(() => {
      markers?.setSelectedSite('b')
    })

    act(() => {
      markers?.setSelectedSite(null)
    })
    await flushMicrotasks()

    expect(markers?.sourceData().features).toHaveLength(3)
    expect(screen.queryByRole('button', { name: /Beta Plant/ })).not.toBeInTheDocument()
  })

  it('ignores a selection that does not change', () => {
    const { map } = setUp()
    act(() => {
      markers?.setSelectedSite('b')
      markers?.setSelectedSite('b')
    })

    expect(map.source.setData).toHaveBeenCalledOnce()
  })
})
