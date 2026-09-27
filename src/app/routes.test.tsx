import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import { routes } from './routes'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

describe('routes', () => {
  it('opens the contracts page by default', () => {
    const router = renderAt('/')

    expect(router.state.location.pathname).toBe('/contracts')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Contracts')
  })

  it('sends paths without a page back to contracts', () => {
    const router = renderAt('/budgets')

    expect(router.state.location.pathname).toBe('/contracts')
  })
})
