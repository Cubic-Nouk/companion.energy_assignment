import type { CircleLayerSpecification, GeoJSONSourceSpecification } from 'maplibre-gl'

export const SITES_SOURCE = 'sites'

/** Sites merge into one marker until this zoom, then always show individually. */
const CLUSTER_MAX_ZOOM = 12
const CLUSTER_RADIUS_PX = 48

export function sitesSource(data: GeoJSONSourceSpecification['data']): GeoJSONSourceSpecification {
  return {
    type: 'geojson',
    data,
    cluster: true,
    clusterMaxZoom: CLUSTER_MAX_ZOOM,
    clusterRadius: CLUSTER_RADIUS_PX,
  }
}

/**
 * Markers are HTML buttons, not map paint. MapLibre only computes clusters for a source some layer
 * uses, so this invisible layer keeps the source live without drawing anything.
 */
export const SITES_ANCHOR_LAYER: CircleLayerSpecification = {
  id: 'sites-anchor',
  type: 'circle',
  source: SITES_SOURCE,
  paint: { 'circle-radius': 1, 'circle-opacity': 0 },
}
