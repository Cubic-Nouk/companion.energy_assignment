export type MarketId = 'be' | 'fr'

export interface Market {
  id: MarketId
  label: string
}

export const MARKETS: readonly Market[] = [
  { id: 'be', label: 'Belgium' },
  { id: 'fr', label: 'France' },
]

/** Length of the delivery period a product covers. */
export type Granularity = 'month' | 'quarter' | 'year'

export interface GranularityOption {
  id: Granularity
  label: string
}

export const GRANULARITIES: readonly GranularityOption[] = [
  { id: 'month', label: 'Month' },
  { id: 'quarter', label: 'Quarter' },
  { id: 'year', label: 'Year' },
]

export const isMarketId = (value: string): value is MarketId =>
  MARKETS.some((market) => market.id === value)

export const isGranularity = (value: string): value is Granularity =>
  GRANULARITIES.some((granularity) => granularity.id === value)
