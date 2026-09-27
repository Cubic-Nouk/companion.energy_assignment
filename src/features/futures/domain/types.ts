import type { ProfilePrices } from './profiles'

/** Settlement prices of one product on one trading day, in €/MWh. */
export interface FuturesQuote extends ProfilePrices {
  /** Trading day, ISO `YYYY-MM-DD`. */
  tradingDay: string
}

/** A tradeable delivery period, such as the month of October 2026, with its daily quotes. */
export interface FuturesProduct {
  id: string
  /** Short market label, e.g. `Oct-26`. */
  label: string
  quotes: readonly FuturesQuote[]
}
