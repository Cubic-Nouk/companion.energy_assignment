/** Production and storage equipment that sits behind a grid connection. */
export type AssetType = 'solar' | 'battery' | 'wind'

export const ASSET_TYPES: readonly AssetType[] = ['solar', 'battery', 'wind']

interface AssetBase {
  id: string
  capacityKw: number
}

/** A battery can be steered: charged and discharged by the platform to follow prices. */
export interface BatteryAsset extends AssetBase {
  type: 'battery'
  isSteered: boolean
}

export interface GenerationAsset extends AssetBase {
  type: 'solar' | 'wind'
}

export type Asset = BatteryAsset | GenerationAsset

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  solar: 'Solar Panels',
  battery: 'Battery',
  wind: 'Wind Turbine',
}

export interface Address {
  street: string
  postalCode: string
  city: string
  country: string
}

/** `Scheldelaan 450, 2040 Antwerp, Belgium`: street, then postal code and city, then country. */
export function formatAddress({ street, postalCode, city, country }: Address): string {
  return `${street}, ${postalCode} ${city}, ${country}`
}

/** What a site is, which is what someone recognises it by on a map. */
export type SiteCategory =
  'industrial' | 'logistics' | 'commercial' | 'public' | 'dataCentre' | 'solarFarm'

export const SITE_CATEGORY_LABELS: Record<SiteCategory, string> = {
  industrial: 'Industrial plant',
  logistics: 'Warehouse & logistics',
  commercial: 'Commercial & offices',
  public: 'Public & healthcare',
  dataCentre: 'Data centre',
  solarFarm: 'Solar farm',
}

export const SITE_CATEGORIES = Object.keys(SITE_CATEGORY_LABELS) as SiteCategory[]

export const isSiteCategory = (value: string): value is SiteCategory =>
  (SITE_CATEGORIES as string[]).includes(value)

/**
 * A customer site: one grid connection, the equipment behind it, and the contracts covering it.
 * Contracts usually apply at the grid connection, which is why a site is the unit on the map.
 */
export interface Site {
  id: string
  name: string
  category: SiteCategory
  address: Address
  /** WGS84 `[longitude, latitude]`, the order GeoJSON and map libraries expect. */
  coordinates: readonly [number, number]
  assets: readonly Asset[]
  contractIds: readonly string[]
}

/** `No contract`, `1 contract`, `3 contracts`: the wording shared by the map and the diagram. */
export function formatContractCount(count: number): string {
  if (count === 0) return 'No contract'
  return count === 1 ? '1 contract' : `${String(count)} contracts`
}

/** How many contracts cover a site, in the three states the map tells apart. */
export type ContractCoverage = 'none' | 'single' | 'multiple'

export function contractCoverage(site: Site): ContractCoverage {
  const count = site.contractIds.length
  if (count === 0) return 'none'
  return count === 1 ? 'single' : 'multiple'
}

export const isAssetType = (value: string): value is AssetType =>
  (ASSET_TYPES as readonly string[]).includes(value)
