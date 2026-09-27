import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { DateRange } from '../../lib/dateRange'
import { DateRangeStepper } from './DateRangeStepper'

const bounds: DateRange = { from: '2026-06-01', to: '2026-09-28' }

function renderStepper(value: DateRange) {
  const onChange = vi.fn<(range: DateRange) => void>()
  render(
    <DateRangeStepper label="Trading days" value={value} bounds={bounds} onChange={onChange} />,
  )
  return onChange
}

describe('DateRangeStepper', () => {
  it('shows the selected range', () => {
    renderStepper({ from: '2026-09-01', to: '2026-09-28' })

    expect(screen.getByText('Sep 01, 2026 – Sep 28, 2026')).toBeInTheDocument()
  })

  it('steps back by the length of the range', async () => {
    const onChange = renderStepper({ from: '2026-09-21', to: '2026-09-27' })

    await userEvent.click(screen.getByRole('button', { name: 'Previous period' }))

    expect(onChange).toHaveBeenCalledWith({ from: '2026-09-14', to: '2026-09-20' })
  })

  it('cannot step past the latest trading day', () => {
    renderStepper({ from: '2026-09-22', to: '2026-09-28' })

    expect(screen.getByRole('button', { name: 'Next period' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous period' })).toBeEnabled()
  })

  it('cannot step before the earliest day', () => {
    renderStepper({ from: '2026-06-01', to: '2026-06-07' })

    expect(screen.getByRole('button', { name: 'Previous period' })).toBeDisabled()
  })
})
