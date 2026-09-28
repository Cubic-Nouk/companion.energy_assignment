import type { FeatureCollection, Point } from 'geojson'

import type { Site } from '../domain/site'

/** A point only carries the site id: markers look the site up to draw everything else. */
export interface SiteFeatureProperties {
  siteId: string
}

export function toSiteFeatures(
  sites: readonly Site[],
): FeatureCollection<Point, SiteFeatureProperties> {
  return {
    type: 'FeatureCollection',
    features: sites.map((site) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [...site.coordinates] },
      properties: { siteId: site.id },
    })),
  }
}
