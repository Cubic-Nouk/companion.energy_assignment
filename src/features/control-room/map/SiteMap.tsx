import 'maplibre-gl/dist/maplibre-gl.css'

import { LngLatBounds, Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl'
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { useEffect, useRef } from 'react'

import { ZoomControls } from '../../../components/ZoomControls/ZoomControls'
import type { Site } from '../domain/site'
import { SITES_ANCHOR_LAYER, SITES_SOURCE, sitesSource } from './siteLayers'
import styles from './SiteMap.module.css'
import { createSiteMarkers, type SiteMarkers } from './siteMarkers'

// MapLibre finds its worker next to its own script at runtime, a path bundlers cannot follow.
// Vite bundles the worker (with the chunk it imports) and hands its URL over explicitly.
setWorkerUrl(mapWorkerUrl)

/** Free vector tiles with no API key, in a light style that suits the white theme. */
const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'
/** Room kept around the sites when framing them; the left clears the key floating there. */
const FIT_PADDING = { top: 48, right: 72, bottom: 48, left: 220 }
const ZOOM_ANIMATION_MS = 200
/** Where the map opens when there is no site to frame. */
const BELGIUM_VIEW = { center: [4.47, 50.5] as [number, number], zoom: 7 }

function boundsOf(sites: readonly Site[]): LngLatBounds {
  return sites.reduce((bounds, site) => bounds.extend([...site.coordinates]), new LngLatBounds())
}

interface SiteMapProps {
  /** Keep the same array across renders: a new one rebuilds the whole map. */
  sites: readonly Site[]
  selectedSiteId: string | null
  onSelectSite: (siteId: string | null) => void
  /** Shown small, as an embed: its controls shrink to match. */
  isCompact: boolean
}

export function SiteMap({ sites, selectedSiteId, onSelectSite, isCompact }: SiteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef<SiteMarkers | null>(null)
  // Where the selected site is, so a resize (the map shrinking to an embed) keeps it in view.
  const selectedCenterRef = useRef<[number, number] | null>(null)
  // The map's handlers are bound once; this keeps them calling the latest callback.
  const onSelectRef = useRef(onSelectSite)
  useEffect(() => {
    onSelectRef.current = onSelectSite
  }, [onSelectSite])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const map = new MapLibreMap({
      container,
      style: MAP_STYLE_URL,
      ...(sites.length > 0
        ? { bounds: boundsOf(sites), fitBoundsOptions: { padding: FIT_PADDING } }
        : BELGIUM_VIEW),
      attributionControl: { compact: true },
    })
    mapRef.current = map
    const markers = createSiteMarkers(map, sites, {
      onSelectSite: (siteId) => {
        onSelectRef.current(siteId)
      },
    })
    markersRef.current = markers

    map.on('load', () => {
      map.addSource(SITES_SOURCE, sitesSource(markers.sourceData()))
      map.addLayer(SITES_ANCHOR_LAYER)
    })

    // Markers keep their clicks to themselves, so any click that reaches the map is on empty
    // ground: it clears the selection.
    map.on('click', () => {
      onSelectRef.current(null)
    })

    // The map only tracks window resizes; shrinking to an embed resizes the container too.
    const observer = new ResizeObserver(() => {
      map.resize()
      if (selectedCenterRef.current) map.easeTo({ center: selectedCenterRef.current })
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
      markersRef.current?.destroy()
      markersRef.current = null
      map.remove()
      mapRef.current = null
    }
    // Sites come from a fixed list, so in practice the map is built once per page visit.
  }, [sites])

  useEffect(() => {
    markersRef.current?.setSelectedSite(selectedSiteId)
    const site = sites.find((candidate) => candidate.id === selectedSiteId)
    selectedCenterRef.current = site ? [...site.coordinates] : null
    if (site) mapRef.current?.easeTo({ center: [...site.coordinates] })
  }, [selectedSiteId, sites])

  return (
    <div className={styles.root}>
      <div ref={containerRef} className={styles.map} role="region" aria-label="Map of sites" />
      <ZoomControls
        size={isCompact ? 'compact' : 'default'}
        onZoomIn={() => mapRef.current?.zoomIn({ duration: ZOOM_ANIMATION_MS })}
        onZoomOut={() => mapRef.current?.zoomOut({ duration: ZOOM_ANIMATION_MS })}
      />
    </div>
  )
}
