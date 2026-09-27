import { describe, expect, it } from 'vitest'

import {
  dayColumnX,
  dayIndexAt,
  priceY,
  stepBandPath,
  stepLinePath,
  type PlotArea,
} from './geometry'

const area: PlotArea = { left: 10, top: 0, width: 100, height: 50 }

describe('dayColumnX', () => {
  it('splits the plot into one equal column per trading day', () => {
    const x = dayColumnX(area, 4)

    expect(x.columnWidth).toBe(25)
    expect(x.start(1)).toBe(35)
    expect(x.centre(1)).toBe(47.5)
  })
})

describe('priceY', () => {
  it('maps the top of the domain to the top of the plot', () => {
    const y = priceY(area, { min: 100, max: 200, ticks: [] })

    expect(y(200)).toBe(0)
    expect(y(150)).toBe(25)
    expect(y(100)).toBe(50)
  })
})

describe('dayIndexAt', () => {
  it('returns the column under the pointer', () => {
    expect(dayIndexAt(36, area, 4)).toBe(1)
  })

  it('returns null outside the plot', () => {
    expect(dayIndexAt(5, area, 4)).toBeNull()
    expect(dayIndexAt(111, area, 4)).toBeNull()
  })
})

describe('step paths', () => {
  const x = (i: number) => i * 10
  const y = (v: number) => v

  it('draws each value flat across its column', () => {
    expect(stepLinePath([5, 8], x, y)).toBe('M0,5H10L10,8H20')
  })

  it('closes a band by walking the lower edge back', () => {
    expect(stepBandPath([2, 3], [5, 8], x, y)).toBe('M0,5H10L10,8H20L20,3H10L10,2H0Z')
  })
})
