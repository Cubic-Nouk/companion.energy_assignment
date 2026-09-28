import { Marker, type GeoJSONSource, type Map as MapLibreMap } from 'maplibre-gl'
import { createRoot, type Root } from 'react-dom/client'

import type { Site } from '../domain/site'
import { ClusterMarker } from './ClusterMarker'
import { toSiteFeatures } from './siteFeatures'
import { SITES_SOURCE } from './siteLayers'
import { SiteMarker } from './SiteMarker'

interface RenderedMarker {
  marker: Marker
  root: Root
}

interface SiteMarkerHandlers {
  onSelectSite: (siteId: string) => void
}

export interface SiteMarkers {
  /** The clustered data: every site but the selected one, which is drawn on its own. */
  sourceData: () => ReturnType<typeof toSiteFeatures>
  /** Lifts a site out of the clusters and draws it as selected, or puts it back when null. */
  setSelectedSite: (siteId: string | null) => void
  destroy: () => void
}

function createRenderedMarker(map: MapLibreMap, center: [number, number]): RenderedMarker {
  const element = document.createElement('div')
  // A marker handles its own click; letting it reach the map would read as a click on empty
  // ground there, which clears the selection the marker just made.
  element.addEventListener('click', (event) => {
    event.stopPropagation()
  })
  return { marker: new Marker({ element }).setLngLat(center).addTo(map), root: createRoot(element) }
}

// Unmounting a root while React is committing is a nested render; defer it to right after.
function disposeMarker({ marker, root }: RenderedMarker) {
  marker.remove()
  queueMicrotask(() => {
    root.unmount()
  })
}

/**
 * Draws the sites as HTML markers. MapLibre decides what is a cluster and what is a single site;
 * after every frame this keeps one marker per visible feature, adding new ones and removing the
 * ones that merged or left the view (MapLibre's documented pattern for markers richer than map
 * paint). The selected site is kept out of the clusters and drawn on top, so it always shows.
 */
export function createSiteMarkers(
  map: MapLibreMap,
  sites: readonly Site[],
  handlers: SiteMarkerHandlers,
): SiteMarkers {
  const sitesById = new Map(sites.map((site) => [site.id, site]))
  const markers = new Map<string, RenderedMarker>()
  let selectedSiteId: string | null = null
  let selectedMarker: RenderedMarker | null = null

  const sourceData = () => toSiteFeatures(sites.filter((site) => site.id !== selectedSiteId))

  const renderSite = (root: Root, site: Site, isSelected: boolean) => {
    root.render(
      <SiteMarker
        site={site}
        isSelected={isSelected}
        onSelect={() => {
          handlers.onSelectSite(site.id)
        }}
      />,
    )
  }

  const expandCluster = (clusterId: number, center: [number, number]) => {
    const source = map.getSource<GeoJSONSource>(SITES_SOURCE)
    source
      ?.getClusterExpansionZoom(clusterId)
      .then((zoom) => {
        map.easeTo({ center, zoom })
      })
      .catch(() => {
        // The cluster is gone (new data or a closed map) before the zoom resolved: the press
        // no longer has a target, so there is nothing to recover.
      })
  }

  const addMarker = (
    key: string,
    center: [number, number],
    properties: Record<string, unknown>,
  ) => {
    const clusterId = properties.cluster_id
    if (typeof clusterId === 'number') {
      const entry = createRenderedMarker(map, center)
      markers.set(key, entry)
      entry.root.render(
        <ClusterMarker
          count={Number(properties.point_count)}
          onExpand={() => {
            expandCluster(clusterId, center)
          }}
        />,
      )
      return
    }
    const site = sitesById.get(String(properties.siteId))
    if (!site) return
    const entry = createRenderedMarker(map, center)
    markers.set(key, entry)
    renderSite(entry.root, site, false)
  }

  const sync = () => {
    if (!map.getSource(SITES_SOURCE) || !map.isSourceLoaded(SITES_SOURCE)) return
    const visible = new Set<string>()
    for (const feature of map.querySourceFeatures(SITES_SOURCE)) {
      if (feature.geometry.type !== 'Point') continue
      const properties = feature.properties
      const [lng = 0, lat = 0] = feature.geometry.coordinates
      // New data renumbers clusters, so an id alone can come back as a different group: the count
      // and position make the key unique to one group. Site keys never change.
      const key =
        typeof properties.cluster_id === 'number'
          ? `cluster:${String(properties.cluster_id)}:${String(properties.point_count)}:${String(lng)},${String(lat)}`
          : `site:${String(properties.siteId)}`
      // A feature near a tile edge is returned once per tile; draw it once.
      if (visible.has(key)) continue
      visible.add(key)
      if (!markers.has(key)) addMarker(key, [lng, lat], properties)
    }
    for (const [key, entry] of markers) {
      if (visible.has(key)) continue
      disposeMarker(entry)
      markers.delete(key)
    }
  }

  const showSelected = (site: Site | undefined) => {
    if (!site) {
      if (selectedMarker) disposeMarker(selectedMarker)
      selectedMarker = null
      return
    }
    selectedMarker ??= createRenderedMarker(map, [...site.coordinates])
    selectedMarker.marker.setLngLat([...site.coordinates])
    // Above every other marker, clusters included.
    selectedMarker.marker.getElement().style.zIndex = '1'
    renderSite(selectedMarker.root, site, true)
  }

  map.on('render', sync)

  return {
    sourceData,
    setSelectedSite: (siteId) => {
      if (siteId === selectedSiteId) return
      selectedSiteId = siteId
      // Not awaited: the next rendered frame holds the new clusters, and sync swaps in only the
      // markers that changed, so the others never flicker.
      void map.getSource<GeoJSONSource>(SITES_SOURCE)?.setData(sourceData())
      showSelected(siteId === null ? undefined : sitesById.get(siteId))
    },
    destroy: () => {
      map.off('render', sync)
      for (const entry of markers.values()) disposeMarker(entry)
      markers.clear()
      if (selectedMarker) disposeMarker(selectedMarker)
      selectedMarker = null
    },
  }
}
