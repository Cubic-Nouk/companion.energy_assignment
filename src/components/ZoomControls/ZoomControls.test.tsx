import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ZoomControls } from './ZoomControls'

describe('ZoomControls', () => {
  it('zooms in and out', async () => {
    const onZoomIn = vi.fn()
    const onZoomOut = vi.fn()
    render(<ZoomControls onZoomIn={onZoomIn} onZoomOut={onZoomOut} />)

    await userEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    await userEvent.click(screen.getByRole('button', { name: 'Zoom out' }))

    expect(onZoomIn).toHaveBeenCalledOnce()
    expect(onZoomOut).toHaveBeenCalledOnce()
  })

  it('has a compact size for small surfaces', () => {
    render(<ZoomControls onZoomIn={vi.fn()} onZoomOut={vi.fn()} size="compact" />)

    expect(screen.getByRole('group', { name: 'Zoom' })).toHaveAttribute('data-size', 'compact')
  })
})
