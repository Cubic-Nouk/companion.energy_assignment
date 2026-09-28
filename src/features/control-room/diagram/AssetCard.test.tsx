import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider, type NodeProps } from '@xyflow/react'
import { Tooltip } from 'radix-ui'
import { describe, expect, it } from 'vitest'

import { AssetCard } from './AssetCard'
import type { AssetCardData, AssetCardNode } from './siteGraph'

function renderCard(data: AssetCardData) {
  // Only the fields the card reads; React Flow fills in the rest when it renders a real node.
  const props = { id: 'node', data } as NodeProps<AssetCardNode>
  return render(
    <ReactFlowProvider>
      <Tooltip.Provider delayDuration={0}>
        <AssetCard {...props} />
      </Tooltip.Provider>
    </ReactFlowProvider>,
  )
}

describe('AssetCard', () => {
  it('shows the name with what it is underneath', () => {
    renderCard({ kind: 'solar', title: 'Solar Panels', subtitle: 'Solar Panels' })

    expect(screen.getAllByText('Solar Panels')).toHaveLength(2)
  })

  it('tells the steering state when the right icon is hovered', async () => {
    renderCard({ kind: 'battery', title: 'Battery', subtitle: 'Battery', hint: 'Not Steering' })
    const icon = screen.getByLabelText('Not Steering')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    await userEvent.hover(icon)

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Not Steering')
  })

  it.each([
    ['single', '.lucide-file'],
    ['multiple', '.lucide-files'],
  ] as const)(
    'marks %s contracts on the grid connection with the map badge icon',
    (contracts, icon) => {
      const { container } = renderCard({
        kind: 'gridConnection',
        title: 'Grid Connection',
        subtitle: '1 contract',
        contracts,
      })

      expect(container.querySelector(icon)).not.toBeNull()
    },
  )

  it('shows no contract icon when no contract covers the site', () => {
    const { container } = renderCard({
      kind: 'gridConnection',
      title: 'Grid Connection',
      subtitle: 'No contract',
      contracts: 'none',
    })

    expect(container.querySelector('.lucide-file, .lucide-files')).toBeNull()
  })

  it.each([
    [15, 'low', 1],
    [50, 'medium', 2],
    [90, 'full', 3],
  ] as const)('at %i%% colours the battery %s and lights %i segments', (percent, level, lit) => {
    const { container } = renderCard({
      kind: 'battery',
      title: 'Battery',
      subtitle: '',
      battery: { stateOfChargePercent: percent, flow: 'idle' },
    })

    expect(container.querySelector('[data-kind="battery"]')).toHaveAttribute('data-level', level)
    expect(container.querySelectorAll('[data-lit="true"]')).toHaveLength(lit)
  })

  it.each([
    ['charging', '.lucide-zap', 'true'],
    ['discharging', '.lucide-arrow-up-from-line', 'false'],
    ['idle', '.lucide-pause', 'false'],
  ] as const)('while %s shows its flow icon, green only when charging', (flow, icon, animated) => {
    const { container } = renderCard({
      kind: 'battery',
      title: 'Battery',
      subtitle: '',
      battery: { stateOfChargePercent: 50, flow },
    })

    expect(container.querySelector(icon)).toHaveAttribute('data-charging', animated)
    // The battery icon animates its segments only while charging.
    expect(container.querySelector('svg[data-level]')).toHaveAttribute('data-charging', animated)
  })

  it('draws no charge level on cards that are not batteries', () => {
    const { container } = renderCard({ kind: 'solar', title: 'Solar Panels', subtitle: 'Solar' })

    expect(container.querySelector('[data-level]')).toBeNull()
    expect(container.querySelector('[data-lit]')).toBeNull()
  })

  it('gives the grid connection no drag grip and assets one', () => {
    const { container, unmount } = renderCard({
      kind: 'gridConnection',
      title: 'Grid Connection',
      subtitle: 'Grid Connection',
    })
    expect(container.querySelector('.lucide-grip')).toBeNull()
    unmount()

    const asset = renderCard({ kind: 'wind', title: 'Wind Turbine', subtitle: 'Wind Turbine' })
    expect(asset.container.querySelector('.lucide-grip')).not.toBeNull()
  })
})
