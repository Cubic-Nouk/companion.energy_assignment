import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TEST_ELEMENT_WIDTH } from '../../../test/constants'
import { queryFutures } from '../../../api/futures'
import type { Profile } from '../domain/profiles'
import { FuturesSmallMultiples } from './FuturesSmallMultiples'

const ALL_PROFILES = new Set<Profile>(['base', 'peak', 'offPeak'])
const MOCK_FUTURES = queryFutures({
  market: 'be',
  granularity: 'month',
  range: { from: '2026-09-01', to: '2026-09-28' },
})

// Must match the chart's own padding to aim the pointer at a given trading day.
const PLOT_LEFT = 32
const PLOT_RIGHT_PADDING = 8

function pointerXForDay(dayIndex: number, dayCount: number) {
  const plotWidth = TEST_ELEMENT_WIDTH - PLOT_LEFT - PLOT_RIGHT_PADDING
  return PLOT_LEFT + ((dayIndex + 0.5) / dayCount) * plotWidth
}

function renderChart(profiles: ReadonlySet<Profile> = ALL_PROFILES) {
  return render(<FuturesSmallMultiples products={MOCK_FUTURES} profiles={profiles} />)
}

describe('FuturesSmallMultiples', () => {
  it('draws one chart per delivery product', () => {
    renderChart()

    expect(screen.getAllByRole('img')).toHaveLength(MOCK_FUTURES.length)
    expect(screen.getByText('Oct-26')).toBeInTheDocument()
    expect(screen.getByText('Mar-27')).toBeInTheDocument()
  })

  it('shows the latest trading day once, above the charts', () => {
    renderChart()

    expect(screen.getAllByText(/28 Sept? 2026/)).toHaveLength(1)
    expect(screen.getByText('Latest trading day')).toBeInTheDocument()
  })

  it('moves every chart to the hovered day and shows that date once', () => {
    renderChart()
    const [firstChart] = screen.getAllByRole('img')
    const dayCount = MOCK_FUTURES[0]?.quotes.length ?? 0

    // Day index 6 is Wednesday 9 September 2026.
    fireEvent.pointerMove(firstChart as Element, { clientX: pointerXForDay(6, dayCount) })

    expect(screen.getAllByText(/9 Sept? 2026/)).toHaveLength(1)
    expect(screen.queryByText('Latest trading day')).not.toBeInTheDocument()
    screen.getAllByRole('img').forEach((chart) => {
      expect(chart.querySelector('line[class*="crosshair"]')).not.toBeNull()
      expect(chart).toHaveAccessibleName(/9 Sept? 2026/)
    })
  })

  it('returns to the latest day when the pointer leaves', () => {
    renderChart()
    const [firstChart] = screen.getAllByRole('img')

    fireEvent.pointerMove(firstChart as Element, { clientX: pointerXForDay(6, 20) })
    fireEvent.pointerLeave(firstChart as Element)

    expect(screen.getByText('Latest trading day')).toBeInTheDocument()
  })

  it('keys a band when peak and off-peak are both selected', () => {
    renderChart()

    const key = screen.getByRole('list', { name: 'Chart key' })
    expect(within(key).getByText('Off-Peak to Peak')).toBeInTheDocument()
  })

  it('falls back to one line per profile without a band', () => {
    renderChart(new Set<Profile>(['base', 'peak']))

    const key = screen.getByRole('list', { name: 'Chart key' })
    expect(within(key).queryByText('Off-Peak to Peak')).not.toBeInTheDocument()
    expect(within(key).getByText('Peak')).toBeInTheDocument()
  })
})
