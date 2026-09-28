import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeAll, describe, expect, it } from 'vitest'

import { routes } from '../../app/routes'

// Load the lazy page up front: a cold compile inside a test can outlast its time limit.
beforeAll(async () => {
  await import('./FuturesSection')
})

/** Renders the app at a URL and waits for the lazily loaded futures section. */
async function renderAt(url: string) {
  const router = createMemoryRouter(routes, { initialEntries: [url] })
  render(<RouterProvider router={router} />)
  await screen.findByRole('group', { name: 'Futures filters' })
  return router
}

describe('FuturesSection', () => {
  it('opens on Belgian monthly products for September', async () => {
    await renderAt('/market-data/futures')

    expect(screen.getByRole('combobox', { name: 'Market' })).toHaveTextContent('Belgium')
    expect(screen.getByText('Oct-26')).toBeInTheDocument()
    expect(screen.getByText('Sep 01, 2026 – Sep 28, 2026')).toBeInTheDocument()
  })

  it('restores the filters from a shared URL', async () => {
    await renderAt('/market-data/futures?granularity=quarter&from=2026-09-21&to=2026-09-27')

    expect(screen.getByRole('combobox', { name: 'Product length' })).toHaveTextContent('Quarter')
    expect(screen.getByText('Q4-26')).toBeInTheDocument()
    expect(screen.queryByText('Oct-26')).not.toBeInTheDocument()
    expect(screen.getByText('Sep 21, 2026 – Sep 27, 2026')).toBeInTheDocument()
  })

  it('writes a filter change back to the URL', async () => {
    const router = await renderAt('/market-data/futures')

    await userEvent.click(screen.getByRole('button', { name: 'Remove Peak' }))

    expect(router.state.location.search).toContain('profiles=base%2CoffPeak')
  })

  it('asks for a profile when none is selected', async () => {
    await renderAt('/market-data/futures')

    await userEvent.click(screen.getByRole('button', { name: 'Clear all profiles' }))

    expect(screen.getByText('Select at least one profile to see prices.')).toBeInTheDocument()
  })

  it('says France has no futures data', async () => {
    await renderAt('/market-data/futures?market=fr')

    expect(screen.getByRole('combobox', { name: 'Market' })).toHaveTextContent('France')
    expect(screen.getByText('No futures data for France.')).toBeInTheDocument()
  })

  it('explains an empty period', async () => {
    // 2026-09-26 and 27 are a Saturday and a Sunday.
    await renderAt('/market-data/futures?from=2026-09-26&to=2026-09-27')

    expect(screen.getByText(/No trading days in this period/)).toBeInTheDocument()
  })
})
