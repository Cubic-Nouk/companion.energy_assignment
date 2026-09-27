import type { PriceDomain } from '../domain/scale'

export interface PlotArea {
  left: number
  top: number
  width: number
  height: number
}

/**
 * Trading days are evenly spaced columns, so weekends leave no flat gaps. A settlement price holds
 * for its whole day, which is why series are drawn as steps across each column.
 */
export function dayColumnX(area: PlotArea, dayCount: number) {
  const columnWidth = area.width / dayCount
  return {
    columnWidth,
    start: (index: number) => area.left + index * columnWidth,
    centre: (index: number) => area.left + (index + 0.5) * columnWidth,
  }
}

export function priceY(area: PlotArea, domain: PriceDomain) {
  return (price: number) =>
    area.top + ((domain.max - price) / (domain.max - domain.min)) * area.height
}

/** Index of the trading-day column under a horizontal position, or null outside the plot. */
export function dayIndexAt(x: number, area: PlotArea, dayCount: number): number | null {
  const index = Math.floor(((x - area.left) / area.width) * dayCount)
  return index >= 0 && index < dayCount ? index : null
}

type ColumnX = (index: number) => number

/** SVG path of a step line: each value runs flat across its column. */
export function stepLinePath(values: readonly number[], x: ColumnX, y: (v: number) => number) {
  return values.map((value, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(value)}H${x(i + 1)}`).join('')
}

/** Closed SVG path filling between two step lines, e.g. off-peak below and peak above. */
export function stepBandPath(
  lows: readonly number[],
  highs: readonly number[],
  x: ColumnX,
  y: (v: number) => number,
) {
  const top = stepLinePath(highs, x, y)
  const bottom = lows
    .map((value, i) => ({ value, i }))
    .reverse()
    .map(({ value, i }) => `L${x(i + 1)},${y(value)}H${x(i)}`)
    .join('')
  return `${top}${bottom}Z`
}
