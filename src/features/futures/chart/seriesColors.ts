const SERIES_COLORS = [
  'var(--color-series-1)',
  'var(--color-series-2)',
  'var(--color-series-3)',
  'var(--color-series-4)',
  'var(--color-series-5)',
  'var(--color-series-6)',
] as const

/**
 * Colour of the n-th product in delivery order. Past the palette the colour is reused: here it
 * only decorates, since every chart is identified by its own title, never by colour alone.
 */
export function seriesColor(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length] ?? SERIES_COLORS[0]
}
