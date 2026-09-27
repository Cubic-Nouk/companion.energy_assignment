import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import { NAVIGATION } from '../../app/navigation'
import type { User } from '../../data/currentUser'
import { Sidebar } from './Sidebar'

const user: User = { firstName: 'Alex', lastName: 'Martin', email: 'alex.martin@org-energy.com' }

function renderSidebar(path = '/contracts') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Sidebar organisationName="Org-Energy" categories={NAVIGATION} user={user} />
    </MemoryRouter>,
  )
}

describe('Sidebar', () => {
  it('shows the organisation name', () => {
    renderSidebar()

    expect(screen.getByText('Org-Energy')).toBeInTheDocument()
  })

  it('lists every page under its category', () => {
    renderSidebar()

    const system = screen.getByRole('list', { name: 'System' })
    expect(
      within(system)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['Control Room', 'Contracts', 'Budgets', 'Market Data'])
    expect(screen.getByRole('list', { name: 'Insights' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Flexibility' })).toBeInTheDocument()
  })

  it('marks the link for the current page', () => {
    renderSidebar('/contracts')

    expect(screen.getByRole('link', { name: 'Contracts' })).toHaveAttribute('aria-current', 'page')
  })

  it('shows pages the prototype does not build as disabled, without a destination', () => {
    renderSidebar()

    const budgets = screen.getByRole('link', { name: 'Budgets' })
    expect(budgets).toHaveAttribute('aria-disabled', 'true')
    expect(budgets).not.toHaveAttribute('href')
    expect(screen.getByRole('link', { name: 'Contracts' })).toHaveAttribute('href', '/contracts')
  })

  it('shows the user identity with their initials', () => {
    renderSidebar()

    expect(screen.getByText('Alex Martin')).toBeInTheDocument()
    expect(screen.getByText('alex.martin@org-energy.com')).toBeInTheDocument()
    expect(screen.getByText('AM')).toBeInTheDocument()
  })
})
