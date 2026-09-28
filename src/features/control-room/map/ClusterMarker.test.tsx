import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ClusterMarker } from './ClusterMarker'

describe('ClusterMarker', () => {
  it('shows how many sites it holds and zooms in when pressed', async () => {
    const onExpand = vi.fn()
    render(<ClusterMarker count={6} onExpand={onExpand} />)

    const cluster = screen.getByRole('button', { name: /6 sites close together/ })
    expect(cluster).toHaveTextContent('6')

    await userEvent.click(cluster)
    expect(onExpand).toHaveBeenCalledOnce()
  })

  it.each([
    [2, 'small'],
    [6, 'medium'],
    [12, 'large'],
  ])('with %i sites is %s', (count, size) => {
    render(<ClusterMarker count={count} onExpand={vi.fn()} />)

    expect(screen.getByRole('button')).toHaveAttribute('data-size', size)
  })
})
