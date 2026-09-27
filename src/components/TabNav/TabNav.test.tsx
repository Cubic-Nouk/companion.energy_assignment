import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import type { NavItem } from '../../app/navigation'
import { TabNav } from './TabNav'

const items: NavItem[] = [
  { label: 'Day-Ahead', path: '/market-data/day-ahead', isEnabled: false },
  { label: 'Futures', path: '/market-data/futures', isEnabled: true },
]

describe('TabNav', () => {
  it('marks the tab for the current route and disables the ones not built', () => {
    render(
      <MemoryRouter initialEntries={['/market-data/futures']}>
        <TabNav label="Market data sections" items={items} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('navigation', { name: 'Market data sections' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Futures' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Day-Ahead' })).toHaveAttribute('aria-disabled', 'true')
  })
})
