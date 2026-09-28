import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Site } from '../domain/site'
import { SiteMarker } from './SiteMarker'

const site = (contractIds: string[]): Site => ({
  id: 'kortrijk',
  name: 'Kortrijk Textiles',
  category: 'industrial',
  address: { street: 'Street 1', postalCode: '8500', city: 'Kortrijk', country: 'Belgium' },
  coordinates: [3.26, 50.83],
  assets: [],
  contractIds,
})

function renderMarker(contractIds: string[], isSelected = false) {
  const onSelect = vi.fn()
  const { container } = render(
    <SiteMarker site={site(contractIds)} isSelected={isSelected} onSelect={onSelect} />,
  )
  return { onSelect, container }
}

describe('SiteMarker', () => {
  it('names the site, its type and its contracts for screen readers', () => {
    renderMarker(['c1', 'c2'])

    expect(
      screen.getByRole('button', { name: 'Kortrijk Textiles, Industrial plant, 2 contracts' }),
    ).toBeInTheDocument()
  })

  it.each([
    [[], null],
    [['c1'], 'single'],
    [['c1', 'c2'], 'multiple'],
  ])('with contracts %j shows the %s badge', (contractIds, coverage) => {
    const { container } = renderMarker(contractIds)

    const badge = container.querySelector('[data-coverage]')
    expect(badge?.getAttribute('data-coverage') ?? null).toBe(coverage)
  })

  it('selects the site when pressed and shows it as pressed once selected', async () => {
    const { onSelect } = renderMarker(['c1'])
    await userEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('reports the selected state', () => {
    renderMarker(['c1'], true)

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })
})
