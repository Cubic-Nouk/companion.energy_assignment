import fixture from '../../data/sites.json'
import {
  isAssetType,
  isBatteryFlow,
  isSiteCategory,
  type Address,
  type Asset,
  type Site,
} from '../features/control-room/domain/site'

/**
 * Stands in for the sites API. The records come from data/sites.json; this module checks them
 * once, at load, so the rest of the app can trust their shape.
 */

// Rough bounding box of Belgium: catches a swapped latitude and longitude, the usual slip.
const BELGIUM = { minLng: 2.5, maxLng: 6.5, minLat: 49.4, maxLat: 51.6 }

function parseCoordinates(raw: readonly number[], siteId: string): [number, number] {
  const [lng, lat] = raw
  const isInside =
    lng !== undefined &&
    lat !== undefined &&
    lng >= BELGIUM.minLng &&
    lng <= BELGIUM.maxLng &&
    lat >= BELGIUM.minLat &&
    lat <= BELGIUM.maxLat
  if (raw.length !== 2 || !isInside) {
    throw new Error(`data/sites.json: site ${siteId} is not at a [longitude, latitude] in Belgium`)
  }
  return [lng, lat]
}

const BELGIAN_POSTAL_CODE = /^\d{4}$/

function parseAddress(raw: Address, siteId: string): Address {
  const isComplete = [raw.street, raw.city, raw.country].every((part) => part.trim() !== '')
  if (!isComplete || !BELGIAN_POSTAL_CODE.test(raw.postalCode)) {
    throw new Error(`data/sites.json: site ${siteId} has an incomplete address`)
  }
  return { ...raw }
}

/** An asset as the fixture stores it, before its fields are checked. */
export interface RawAsset {
  id: string
  name?: string
  type: string
  capacityKw: number
  isSteered?: boolean
  stateOfChargePercent?: number
  flow?: string
}

const isPercent = (value: number | undefined): value is number =>
  value !== undefined && value >= 0 && value <= 100

/** Checks one asset from the fixture; exported so its rules are tested directly. */
export function parseAsset(raw: RawAsset, siteId: string): Asset {
  const invalid = () => new Error(`data/sites.json: asset ${raw.id} on site ${siteId} is invalid`)
  if (!isAssetType(raw.type) || raw.capacityKw <= 0) throw invalid()

  if (raw.name?.trim() === '') throw invalid()
  const base = { id: raw.id, capacityKw: raw.capacityKw, ...(raw.name ? { name: raw.name } : {}) }
  if (raw.type === 'battery') {
    const { isSteered, stateOfChargePercent, flow } = raw
    if (isSteered === undefined || !isPercent(stateOfChargePercent)) throw invalid()
    if (flow === undefined || !isBatteryFlow(flow)) throw invalid()
    return { ...base, type: 'battery', isSteered, stateOfChargePercent, flow }
  }
  return { ...base, type: raw.type }
}

function parseCategory(raw: string, siteId: string): Site['category'] {
  if (!isSiteCategory(raw)) throw new Error(`data/sites.json: site ${siteId} has no known category`)
  return raw
}

function loadSites(): Site[] {
  const ids = new Set<string>()
  return fixture.map((raw) => {
    if (ids.has(raw.id)) throw new Error(`data/sites.json: duplicate site id ${raw.id}`)
    ids.add(raw.id)
    return {
      id: raw.id,
      name: raw.name,
      category: parseCategory(raw.category, raw.id),
      address: parseAddress(raw.address, raw.id),
      coordinates: parseCoordinates(raw.coordinates, raw.id),
      assets: raw.assets.map((asset) => parseAsset(asset, raw.id)),
      contractIds: raw.contractIds,
    }
  })
}

const SITES: readonly Site[] = loadSites()

export function listSites(): readonly Site[] {
  return SITES
}
