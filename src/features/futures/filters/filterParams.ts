import { isGranularity, isMarketId, type Granularity, type MarketId } from '../domain/catalogue'
import { isIsoDay, isRangeWithin, type DateRange } from '../../../lib/dateRange'
import { PROFILES, type Profile } from '../domain/profiles'

export interface FuturesFilters {
  market: MarketId
  granularity: Granularity
  profiles: ReadonlySet<Profile>
  range: DateRange
}

const PARAM = {
  market: 'market',
  granularity: 'granularity',
  profiles: 'profiles',
  from: 'from',
  to: 'to',
} as const

const isProfile = (value: string): value is Profile =>
  (PROFILES as readonly string[]).includes(value)

/**
 * Reads the filters from the URL, so a filtered view can be shared. Anything missing or invalid
 * falls back to its default rather than failing: a stale link still opens a working page.
 */
export function parseFilters(
  params: URLSearchParams,
  defaults: FuturesFilters,
  bounds: DateRange,
): FuturesFilters {
  const market = params.get(PARAM.market) ?? ''
  const granularity = params.get(PARAM.granularity) ?? ''
  const profilesParam = params.get(PARAM.profiles)
  const from = params.get(PARAM.from) ?? ''
  const to = params.get(PARAM.to) ?? ''
  const range = { from, to }

  return {
    market: isMarketId(market) ? market : defaults.market,
    granularity: isGranularity(granularity) ? granularity : defaults.granularity,
    // An empty value is a deliberate "no profile" selection; only a missing one means default.
    profiles:
      profilesParam === null
        ? defaults.profiles
        : new Set(profilesParam.split(',').filter(isProfile)),
    range: isIsoDay(from) && isIsoDay(to) && isRangeWithin(range, bounds) ? range : defaults.range,
  }
}

/** Writes the filters to URL parameters, in a stable order so equal filters give equal URLs. */
export function serializeFilters(filters: FuturesFilters): URLSearchParams {
  return new URLSearchParams([
    [PARAM.market, filters.market],
    [PARAM.granularity, filters.granularity],
    [PARAM.profiles, PROFILES.filter((profile) => filters.profiles.has(profile)).join(',')],
    [PARAM.from, filters.range.from],
    [PARAM.to, filters.range.to],
  ])
}
