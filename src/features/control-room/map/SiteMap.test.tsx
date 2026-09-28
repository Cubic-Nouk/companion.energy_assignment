import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { Site } from '../domain/site'
import { SiteMap } from './SiteMap'

// jsdom has no WebGL, so MapLibre is replaced by a recorder of what the component asks of it.
const maps = vi.hoisted(() => [] as FakeMapInstance[])

interface FakeMapInstance {
  options: Record<string, unknown>
  emit: (type: string) => void
  zoomIn: ReturnType<typeof vi.fn>
  zoomOut: ReturnType<typeof vi.fn>
  easeTo: ReturnType<typeof vi.fn>
  remove: ReturnType<typeof vi.fn>
}

vi.mock('maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url', () => ({ default: 'worker.js' }))
vi.mock('maplibre-gl', () => {
  class FakeMap {
    readonly listeners = new Map<string, (() => void)[]>()
    readonly zoomIn = vi.fn()
    readonly zoomOut = vi.fn()
    readonly easeTo = vi.fn()
    readonly remove = vi.fn()
    readonly options: Record<string, unknown>

    constructor(options: Record<string, unknown>) {
      this.options = options
      maps.push(this)
    }

    on(type: string, listener: () => void) {
      this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener])
    }

    off() {
      // Listeners die with the fake map.
    }

    emit(type: string) {
      for (const listener of this.listeners.get(type) ?? []) listener()
    }

    addSource() {
      // Nothing to draw.
    }

    addLayer() {
      // Nothing to draw.
    }

    getSource() {
      return undefined
    }

    resize() {
      // No layout in jsdom.
    }
  }

  class LngLatBounds {
    extend() {
      return this
    }
  }

  class Marker {
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
  }

  return { Map: FakeMap, LngLatBounds, Marker, setWorkerUrl: vi.fn() }
})

const SITES: Site[] = [
  {
    id: 'kortrijk',
    name: 'Kortrijk Textiles',
    category: 'industrial',
    address: { street: 'Street 1', postalCode: '8500', city: 'Kortrijk', country: 'Belgium' },
    coordinates: [3.26, 50.83],
    assets: [],
    contractIds: [],
  },
]

function renderMap(selectedSiteId: string | null = null) {
  const onSelectSite = vi.fn()
  const view = render(
    <SiteMap
      sites={SITES}
      selectedSiteId={selectedSiteId}
      onSelectSite={onSelectSite}
      isCompact={false}
    />,
  )
  const map = maps.at(-1)
  if (!map) throw new Error('SiteMap did not create a map')
  return { ...view, map, onSelectSite }
}

describe('SiteMap', () => {
  it('opens framed on the sites', () => {
    const { map } = renderMap()

    expect(map.options).toHaveProperty('bounds')
    expect(screen.getByRole('region', { name: 'Map of sites' })).toBeInTheDocument()
  })

  it('opens on Belgium when there is no site to frame', () => {
    render(<SiteMap sites={[]} selectedSiteId={null} onSelectSite={vi.fn()} isCompact={false} />)

    expect(maps.at(-1)?.options).toMatchObject({ zoom: 7 })
  })

  it('drives the map from the shared zoom control', async () => {
    const { map } = renderMap()

    await userEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    await userEvent.click(screen.getByRole('button', { name: 'Zoom out' }))

    expect(map.zoomIn).toHaveBeenCalledOnce()
    expect(map.zoomOut).toHaveBeenCalledOnce()
  })

  it('clears the selection on a click that reaches the map', () => {
    const { map, onSelectSite } = renderMap('kortrijk')

    act(() => {
      map.emit('click')
    })

    expect(onSelectSite).toHaveBeenCalledWith(null)
  })

  it('moves to the site that gets selected', () => {
    const { map, rerender } = renderMap()

    rerender(
      <SiteMap sites={SITES} selectedSiteId="kortrijk" onSelectSite={vi.fn()} isCompact={false} />,
    )

    expect(map.easeTo).toHaveBeenCalledWith({ center: [3.26, 50.83] })
  })

  it('shrinks its zoom control when shown as an embed', () => {
    render(<SiteMap sites={SITES} selectedSiteId={null} onSelectSite={vi.fn()} isCompact />)

    expect(screen.getByRole('group', { name: 'Zoom' })).toHaveAttribute('data-size', 'compact')
  })

  it('removes the map when it unmounts', () => {
    const { map, unmount } = renderMap()

    unmount()

    expect(map.remove).toHaveBeenCalledOnce()
  })
})
