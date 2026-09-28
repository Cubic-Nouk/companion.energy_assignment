import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { routes } from './routes'

// MapLibre needs WebGL, which jsdom lacks; routing is what is under test here.
vi.mock('../features/control-room/map/SiteMap', () => ({ SiteMap: () => null }))

/** The map page pulls in MapLibre; compiling it cold, with every test file running in parallel,
 * can outlast the 10 s default for a hook. */
const PRELOAD_TIMEOUT_MS = 30_000

// Load the lazy pages up front: a cold compile inside a test can outlast its time limit.
beforeAll(async () => {
  await Promise.all([
    import('../pages/control-room/ControlRoomPage'),
    import('../pages/market-data/FuturesSection'),
  ])
}, PRELOAD_TIMEOUT_MS)

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

describe('routes', () => {
  it('opens the control room by default', async () => {
    const router = renderAt('/')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Control Room' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/control-room')
  })

  it('opens the futures section of market data', async () => {
    const router = renderAt('/market-data')

    expect(await screen.findByRole('heading', { name: 'Futures Market Data' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/market-data/futures')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Market Data')
  })

  it('sends paths without a page back to the control room', async () => {
    const router = renderAt('/budgets')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Control Room' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/control-room')
  })
})
