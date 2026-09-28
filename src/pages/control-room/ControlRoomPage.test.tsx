import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { listSites } from '../../api/sites'
import { contractCoverage } from '../../features/control-room/domain/site'
import { ControlRoomPage } from './ControlRoomPage'

// MapLibre and React Flow need a real layout engine (WebGL, measured nodes) that jsdom lacks.
// The stub map offers a button per site, standing in for a click on its pin.
vi.mock('../../features/control-room/map/SiteMap', () => ({
  SiteMap: ({ onSelectSite }: { onSelectSite: (id: string | null) => void }) => (
    <div role="region" aria-label="Map of sites">
      <button
        type="button"
        onClick={() => {
          onSelectSite('ghent-paper')
        }}
      >
        Ghent Paper Mill pin
      </button>
    </div>
  ),
}))
vi.mock('../../features/control-room/diagram/SiteDiagram', () => ({
  SiteDiagram: () => <div data-testid="site-diagram" />,
}))

describe('ControlRoomPage', () => {
  it('shows the sites map under the page title', () => {
    render(<ControlRoomPage />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Control Room')
    expect(screen.getByRole('region', { name: 'Map of sites' })).toBeInTheDocument()
  })

  it('counts sites by number of contracts in the key', () => {
    render(<ControlRoomPage />)
    const sites = listSites()
    const count = (coverage: string) =>
      String(sites.filter((site) => contractCoverage(site) === coverage).length)

    const key = screen.getByRole('list', { name: 'Contracts' })
    expect(within(key).getByText('One contract').textContent).toContain(count('single'))
    expect(within(key).getByText('Several contracts').textContent).toContain(count('multiple'))
    expect(within(key).getByText('No contract').textContent).toContain(count('none'))
  })

  it('lists the site types the marker icons stand for', () => {
    render(<ControlRoomPage />)

    const types = screen.getByRole('list', { name: 'Site types' })
    expect(within(types).getByText('Solar farm')).toBeInTheDocument()
    expect(within(types).getByText('Industrial plant')).toBeInTheDocument()
  })

  it('opens the diagram of the site picked on the map', async () => {
    render(<ControlRoomPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Ghent Paper Mill pin' }))

    const panel = screen.getByRole('region', { name: 'Ghent Paper Mill' })
    expect(within(panel).getByTestId('site-diagram')).toBeInTheDocument()
    expect(panel).toHaveTextContent('Pantserschipstraat 207, 9000 Ghent, Belgium')
  })

  it('moves focus to the panel it opens, so keyboard users land on it', async () => {
    render(<ControlRoomPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Ghent Paper Mill pin' }))

    expect(screen.getByRole('heading', { level: 2, name: 'Ghent Paper Mill' })).toHaveFocus()
  })

  it('closes the diagram with its button or with Escape', async () => {
    render(<ControlRoomPage />)
    const pin = screen.getByRole('button', { name: 'Ghent Paper Mill pin' })

    await userEvent.click(pin)
    await userEvent.click(screen.getByRole('button', { name: 'Close site diagram' }))
    expect(screen.queryByRole('heading', { name: 'Ghent Paper Mill' })).not.toBeInTheDocument()

    await userEvent.click(pin)
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('heading', { name: 'Ghent Paper Mill' })).not.toBeInTheDocument()
  })
})
