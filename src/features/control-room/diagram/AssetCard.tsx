import { Handle, Position, type NodeProps } from '@xyflow/react'
import { BatteryMedium, Grip, Plug, Sun, Wind, type LucideIcon } from 'lucide-react'
import { Tooltip } from 'radix-ui'

import { CONTRACT_ICONS } from '../siteIcons'
import styles from './AssetCard.module.css'
import { CARD_HEIGHT, CARD_WIDTH, type AssetCardNode, type CardKind } from './siteGraph'

const ICONS: Record<CardKind, LucideIcon> = {
  gridConnection: Plug,
  battery: BatteryMedium,
  solar: Sun,
  wind: Wind,
}

/** A diagram card: the icon on a tinted strip, then the name with what it is underneath. */
export function AssetCard({ data }: NodeProps<AssetCardNode>) {
  const Icon = ICONS[data.kind]
  const isGridConnection = data.kind === 'gridConnection'
  // Same icon as the map badge; only the grid connection card carries contracts.
  const ContractIcon = data.contracts === undefined ? null : CONTRACT_ICONS[data.contracts]

  return (
    <div
      className={styles.card}
      data-kind={data.kind}
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
    >
      {/* Links are drawn from the data; handles only anchor them, nobody drags new ones. */}
      <Handle type="target" position={Position.Left} className={styles.handle} />
      <span className={styles.iconArea} aria-hidden="true">
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <span className={styles.text}>
        <span className={styles.title}>{data.title}</span>
        <span className={styles.subtitle}>
          {ContractIcon && (
            <ContractIcon
              size={14}
              strokeWidth={1.75}
              className={styles.subtitleIcon}
              aria-hidden="true"
            />
          )}
          {data.subtitle}
        </span>
      </span>
      {!isGridConnection && <AssetGrip hint={data.hint} />}
      {isGridConnection && (
        <Handle type="source" position={Position.Right} className={styles.handle} />
      )}
    </div>
  )
}

/** The icon at an asset card's right; hovering or focusing it tells its state, when it has one. */
function AssetGrip({ hint }: { hint: string | undefined }) {
  const grip = <Grip size={16} aria-hidden="true" />
  if (!hint) return <span className={styles.grip}>{grip}</span>

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        {/* A button so keyboard users can reach the hint too; nodrag keeps a press from moving the card. */}
        <button type="button" className={`${styles.grip ?? ''} nodrag`} aria-label={hint}>
          {grip}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className={styles.tooltip} side="top" align="start" sideOffset={6}>
          {hint}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
