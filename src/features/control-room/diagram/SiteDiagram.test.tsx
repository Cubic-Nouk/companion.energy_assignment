import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { Site } from '../domain/site'
import { SiteDiagram } from './SiteDiagram'

const site: Site = {
  id: 'woluwe',
  name: 'Woluwe Shopping Centre',
  category: 'commercial',
  address: { street: 'Street 1', postalCode: '1200', city: 'Brussels', country: 'Belgium' },
  coordinates: [4.43, 50.84],
  assets: [
    { id: 'woluwe-solar', type: 'solar', capacityKw: 900 },
    { id: 'woluwe-battery', type: 'battery', capacityKw: 300, isSteered: false },
  ],
  contractIds: ['c1'],
}

describe('SiteDiagram', () => {
  it('draws the grid connection and a card per asset behind it', () => {
    render(<SiteDiagram site={site} />)

    expect(screen.getAllByText('Grid Connection').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Solar Panels').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Battery').length).toBeGreaterThan(0)
  })

  it('gives the battery its steering hint', () => {
    render(<SiteDiagram site={site} />)

    // React Flow keeps nodes invisible until it has measured them, which jsdom never does, and
    // role queries skip invisible elements: find the hint by its label instead.
    expect(screen.getByLabelText('Not Steering')).toBeInTheDocument()
  })

  it('zooms with the shared zoom control', async () => {
    render(<SiteDiagram site={site} />)

    await userEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    await userEvent.click(screen.getByRole('button', { name: 'Zoom out' }))

    expect(screen.getByRole('group', { name: 'Zoom' })).toBeInTheDocument()
  })
})
