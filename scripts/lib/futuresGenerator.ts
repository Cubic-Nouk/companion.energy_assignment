import {
  GRANULARITIES,
  type Granularity,
  type MarketId,
} from '../../src/features/futures/domain/catalogue.ts'
import { pricesFromBase } from '../../src/features/futures/domain/profiles.ts'
import type { DateRange } from '../../src/lib/dateRange.ts'

/**
 * Generates the mock futures fixture: Belgian monthly, quarterly and yearly products, traded on
 * every working day from June to September 2026. France is listed as a market too but, as on the
 * live dashboard, has no futures data, so it gets no products.
 *
 * Starting levels mirror the live dashboard: winter dearer, spring and summer cheaper, with a small
 * peak premium in solar-heavy quarters that can even turn negative. Each day every product moves
 * with a shared market shock plus its own noise, the way futures on one market react to the same
 * news. Fixed seeds make every run produce the same file.
 */

export const HISTORY: DateRange = { from: '2026-06-01', to: '2026-09-28' }

/** Columnar layout: one price array per profile, aligned with `tradingDays`. */
export interface FixtureProduct {
  id: string
  market: string
  granularity: string
  label: string
  base: number[]
  peak: number[]
  offPeak: number[]
}

export interface FuturesFixture {
  tradingDays: string[]
  products: FixtureProduct[]
}

interface ProductSeed {
  label: string
  base: number
  peakPremium: number
}

const PRODUCT_SEEDS: Record<Granularity, readonly ProductSeed[]> = {
  month: [
    { label: 'Oct-26', base: 158, peakPremium: 33 },
    { label: 'Nov-26', base: 170, peakPremium: 54 },
    { label: 'Dec-26', base: 165, peakPremium: 54 },
    { label: 'Jan-27', base: 172, peakPremium: 43 },
    { label: 'Feb-27', base: 167, peakPremium: 41 },
    { label: 'Mar-27', base: 137, peakPremium: 26 },
  ],
  quarter: [
    { label: 'Q4-26', base: 164, peakPremium: 47 },
    { label: 'Q1-27', base: 159, peakPremium: 37 },
    { label: 'Q2-27', base: 96, peakPremium: 4 },
    { label: 'Q3-27', base: 104, peakPremium: 7 },
  ],
  year: [
    { label: 'Cal-27', base: 129, peakPremium: 24 },
    { label: 'Cal-28', base: 113, peakPremium: 21 },
  ],
}

const MARKETS_WITH_DATA: readonly MarketId[] = ['be']

const BASE_SEED = 20260928
const MARKET_VOLATILITY = 2.2
const PRODUCT_VOLATILITY = 0.9
const PREMIUM_VOLATILITY = 0.5
/** Later deliveries react a little less to today's news. */
const SENSITIVITY_DECAY_PER_PRODUCT = 0.08

/** Mulberry32: a tiny deterministic PRNG returning floats in [0, 1). */
export function createRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Weekdays of a range, both ends included. Markets do not trade at weekends. */
export function tradingDaysIn(range: DateRange): string[] {
  const days: string[] = []
  const end = Date.parse(`${range.to}T00:00:00Z`)
  for (let time = Date.parse(`${range.from}T00:00:00Z`); time <= end; time += 86_400_000) {
    const weekday = new Date(time).getUTCDay()
    if (weekday !== 0 && weekday !== 6) days.push(new Date(time).toISOString().slice(0, 10))
  }
  return days
}

const round2 = (value: number) => Math.round(value * 100) / 100

function generateSeries(
  market: MarketId,
  granularity: Granularity,
  dayCount: number,
): FixtureProduct[] {
  const seeds = PRODUCT_SEEDS[granularity]
  const seedOffset = GRANULARITIES.findIndex((g) => g.id === granularity) * 100
  const random = createRandom(BASE_SEED + seedOffset)
  // Sum of three uniforms: a cheap bell-shaped noise centred on 0, within [-3, 3].
  const noise = () => (random() + random() + random() - 1.5) * 2

  const states = seeds.map((seed) => ({ base: seed.base, premium: seed.peakPremium }))
  const products: FixtureProduct[] = seeds.map((seed) => ({
    id: `${market}-${seed.label.toLowerCase()}`,
    market,
    granularity,
    label: seed.label,
    base: [],
    peak: [],
    offPeak: [],
  }))

  for (let day = 0; day < dayCount; day++) {
    const marketMove = noise() * MARKET_VOLATILITY
    states.forEach((state, i) => {
      state.base +=
        marketMove * (1 - i * SENSITIVITY_DECAY_PER_PRODUCT) + noise() * PRODUCT_VOLATILITY
      state.premium += noise() * PREMIUM_VOLATILITY
      const prices = pricesFromBase(state.base, state.premium)
      const product = products[i]
      if (!product) return
      product.base.push(round2(prices.base))
      product.peak.push(round2(prices.peak))
      product.offPeak.push(round2(prices.offPeak))
    })
  }

  return products
}

export function generateFuturesFixture(range: DateRange = HISTORY): FuturesFixture {
  const tradingDays = tradingDaysIn(range)
  const products = MARKETS_WITH_DATA.flatMap((market) =>
    GRANULARITIES.flatMap((granularity) =>
      generateSeries(market, granularity.id, tradingDays.length),
    ),
  )
  return { tradingDays, products }
}

/** JSON with one product per line: small, and still readable in a diff. */
export function serializeFixture(fixture: FuturesFixture): string {
  const products = fixture.products.map((product) => `    ${JSON.stringify(product)}`).join(',\n')
  return `{\n  "tradingDays": ${JSON.stringify(fixture.tradingDays)},\n  "products": [\n${products}\n  ]\n}\n`
}
