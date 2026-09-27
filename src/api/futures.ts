import fixture from '../../data/futures.json'
import {
  isGranularity,
  isMarketId,
  type Granularity,
  type MarketId,
} from '../features/futures/domain/catalogue'
import type { FuturesProduct } from '../features/futures/domain/types'
import type { DateRange } from '../lib/dateRange'

/**
 * Stands in for the futures API. The prices come from data/futures.json, a fixture written by
 * `npm run data:generate`; this module checks its shape once, at load, and answers queries.
 */

interface Catalogue {
  history: DateRange
  products: Map<string, FuturesProduct[]>
}

const catalogueKey = (market: MarketId, granularity: Granularity) => `${market}:${granularity}`

function priceOn(prices: readonly number[], day: number, productId: string): number {
  const price = prices[day]
  if (price === undefined || !Number.isFinite(price)) {
    throw new Error(
      `data/futures.json: product ${productId} has no valid price on day ${String(day)}`,
    )
  }
  return price
}

function loadCatalogue(): Catalogue {
  const { tradingDays } = fixture
  const firstDay = tradingDays[0]
  const lastDay = tradingDays[tradingDays.length - 1]
  if (firstDay === undefined || lastDay === undefined) {
    throw new Error('data/futures.json has no trading days')
  }

  const products = new Map<string, FuturesProduct[]>()
  for (const raw of fixture.products) {
    const { market, granularity } = raw
    if (!isMarketId(market) || !isGranularity(granularity)) {
      throw new Error(`data/futures.json: unknown market or granularity on product ${raw.id}`)
    }
    if ([raw.base, raw.peak, raw.offPeak].some((prices) => prices.length !== tradingDays.length)) {
      throw new Error(`data/futures.json: product ${raw.id} does not price every trading day`)
    }

    const product: FuturesProduct = {
      id: raw.id,
      label: raw.label,
      quotes: tradingDays.map((tradingDay, day) => ({
        tradingDay,
        base: priceOn(raw.base, day, raw.id),
        peak: priceOn(raw.peak, day, raw.id),
        offPeak: priceOn(raw.offPeak, day, raw.id),
      })),
    }
    const key = catalogueKey(market, granularity)
    products.set(key, [...(products.get(key) ?? []), product])
  }

  return { history: { from: firstDay, to: lastDay }, products }
}

const catalogue = loadCatalogue()

/** The trading days the data covers. */
export const FUTURES_HISTORY: DateRange = catalogue.history

export interface FuturesQuery {
  market: MarketId
  granularity: Granularity
  range: DateRange
}

/** Every product of a market and granularity, in delivery order, quoted within the range. */
export function queryFutures({ market, granularity, range }: FuturesQuery): FuturesProduct[] {
  const products = catalogue.products.get(catalogueKey(market, granularity)) ?? []
  return products.map((product) => ({
    ...product,
    quotes: product.quotes.filter(
      (quote) => quote.tradingDay >= range.from && quote.tradingDay <= range.to,
    ),
  }))
}
