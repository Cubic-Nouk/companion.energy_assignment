import { useSearchParams } from 'react-router'

import { startOfMonth, type DateRange } from '../../../lib/dateRange'
import { FUTURES_HISTORY } from '../../../api/futures'
import { PROFILES } from '../domain/profiles'
import { parseFilters, serializeFilters, type FuturesFilters } from './filterParams'

/** Month to date, ending on the latest trading day. */
const DEFAULT_RANGE: DateRange = {
  from: startOfMonth(FUTURES_HISTORY.to),
  to: FUTURES_HISTORY.to,
}

export const DEFAULT_FILTERS: FuturesFilters = {
  market: 'be',
  granularity: 'month',
  profiles: new Set(PROFILES),
  range: DEFAULT_RANGE,
}

/**
 * The futures filters, kept in the URL so a filtered view survives a refresh and can be shared.
 * Updates replace the history entry: stepping through filters should not flood the back button.
 */
export function useFuturesFilters(): [FuturesFilters, (next: FuturesFilters) => void] {
  const [params, setParams] = useSearchParams()
  const filters = parseFilters(params, DEFAULT_FILTERS, FUTURES_HISTORY)

  const setFilters = (next: FuturesFilters) => {
    setParams(serializeFilters(next), { replace: true })
  }

  return [filters, setFilters]
}
