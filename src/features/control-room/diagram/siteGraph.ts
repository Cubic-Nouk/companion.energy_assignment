import type { Edge, Node } from '@xyflow/react'

import {
  ASSET_TYPE_LABELS,
  contractCoverage,
  formatContractCount,
  BATTERY_FLOW_LABELS,
  type BatteryFlow,
  type ContractCoverage,
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
  /** On the grid connection, which carries the contracts: drawn as an icon next to the count. */
  contracts?: ContractCoverage
  /** On a battery: how full it is and which way energy moves, drawn by its icons. */
  battery?: { stateOfChargePercent: number; flow: BatteryFlow }
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

/** A battery tells what it is doing; other assets keep their type, as on the live dashboard. */
function assetSubtitle(asset: Asset): string {
  if (asset.type !== 'battery') return ASSET_TYPE_LABELS[asset.type]
  return `${BATTERY_FLOW_LABELS[asset.flow]} · ${String(asset.stateOfChargePercent)}%`
}

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
      contracts: contractCoverage(site),
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
        title: asset.name ?? ASSET_TYPE_LABELS[asset.type],
        subtitle: assetSubtitle(asset),
        ...(hint === undefined ? {} : { hint }),
        ...(asset.type === 'battery'
          ? { battery: { stateOfChargePercent: asset.stateOfChargePercent, flow: asset.flow } }
          : {}),
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
