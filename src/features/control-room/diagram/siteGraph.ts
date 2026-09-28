import type { Edge, Node } from '@xyflow/react'

import {
  ASSET_TYPE_LABELS,
  formatContractCount,
  type Asset,
  type AssetType,
  type Site,
} from '../domain/site'

/** What a card shows: the grid connection, or one of the assets behind it. */
export type CardKind = 'gridConnection' | AssetType

export interface AssetCardData extends Record<string, unknown> {
  kind: CardKind
  title: string
  subtitle: string
  /** Shown when hovering the icon at the card's right, e.g. whether a battery is steered. */
  hint?: string
}

export type AssetCardNode = Node<AssetCardData, 'assetCard'>

export const CARD_WIDTH = 260
export const CARD_HEIGHT = 80
/** Horizontal distance from the grid connection to the column of assets. */
const ASSET_COLUMN_X = 520
/** Vertical distance between two asset cards. */
const ASSET_ROW_GAP = 140

const GRID_CONNECTION_LABEL = 'Grid Connection'

function assetHint(asset: Asset): string | undefined {
  if (asset.type !== 'battery') return undefined
  return asset.isSteered ? 'Steering' : 'Not Steering'
}

/**
 * Lays a site out as its live dashboard does: the grid connection on the left, the assets behind
 * it stacked on the right and vertically centred on it, each linked back to the connection.
 */
export function buildSiteGraph(site: Site): { nodes: AssetCardNode[]; edges: Edge[] } {
  const gridId = `${site.id}-grid`
  const firstAssetY = -((site.assets.length - 1) * ASSET_ROW_GAP) / 2

  const gridNode: AssetCardNode = {
    id: gridId,
    type: 'assetCard',
    position: { x: 0, y: 0 },
    // Contracts apply at the grid connection, so its card says how many cover the site.
    data: {
      kind: 'gridConnection',
      title: GRID_CONNECTION_LABEL,
      subtitle: formatContractCount(site.contractIds.length),
    },
  }

  const assetNodes = site.assets.map((asset, index): AssetCardNode => {
    const hint = assetHint(asset)
    return {
      id: asset.id,
      type: 'assetCard',
      position: { x: ASSET_COLUMN_X, y: firstAssetY + index * ASSET_ROW_GAP },
      data: {
        kind: asset.type,
        title: ASSET_TYPE_LABELS[asset.type],
        subtitle: ASSET_TYPE_LABELS[asset.type],
        ...(hint === undefined ? {} : { hint }),
      },
    }
  })

  const edges = site.assets.map((asset): Edge => ({
    id: `${gridId}-${asset.id}`,
    source: gridId,
    target: asset.id,
  }))

  return { nodes: [gridNode, ...assetNodes], edges }
}
