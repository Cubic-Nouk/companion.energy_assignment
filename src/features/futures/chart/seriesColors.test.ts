import { describe, expect, it } from 'vitest'

import { seriesColor } from './seriesColors'

describe('seriesColor', () => {
  it('assigns the palette in order', () => {
    expect(seriesColor(0)).toBe('var(--color-series-1)')
    expect(seriesColor(5)).toBe('var(--color-series-6)')
  })

  it('reuses the palette past its end', () => {
    expect(seriesColor(6)).toBe('var(--color-series-1)')
  })
})
