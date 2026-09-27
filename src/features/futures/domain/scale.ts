import type { Profile } from './profiles'
import type { FuturesProduct } from './types'

export interface PriceDomain {
  min: number
  max: number
  ticks: readonly number[]
}

const NICE_STEPS = [1, 2, 5, 10]
/** Enough gridlines for a small chart to be read against, without clutter. */
const SHARED_TICK_COUNT = 5

/** Rounds a value range outwards to "nice" gridline values (steps of 1, 2 or 5 × 10ⁿ). */
export function niceDomain(min: number, max: number, targetTickCount = 4): PriceDomain {
  if (min === max) return niceDomain(min - 1, max + 1, targetTickCount)

  const rawStep = (max - min) / targetTickCount
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const step = (NICE_STEPS.find((s) => s * magnitude >= rawStep) ?? 10) * magnitude
  const niceMin = Math.floor(min / step) * step
  const niceMax = Math.ceil(max / step) * step
  const count = Math.round((niceMax - niceMin) / step)
  const ticks = Array.from({ length: count + 1 }, (_, i) => niceMin + i * step)

  return { min: niceMin, max: niceMax, ticks }
}

/**
 * One price scale shared by every product, covering the selected profiles only. Sharing it is
 * what makes the heights of different charts comparable.
 */
export function sharedPriceDomain(
  products: readonly FuturesProduct[],
  profiles: ReadonlySet<Profile>,
): PriceDomain {
  const values = products.flatMap((product) =>
    product.quotes.flatMap((quote) => [...profiles].map((profile) => quote[profile])),
  )
  if (values.length === 0) return niceDomain(0, 100)

  return niceDomain(Math.min(...values), Math.max(...values), SHARED_TICK_COUNT)
}
