import { Minus, Plus } from 'lucide-react'

import styles from './ZoomControls.module.css'

export type ZoomControlsSize = 'default' | 'compact'

interface ZoomControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  /** Compact for small surfaces, such as a map shown as an embed. */
  size?: ZoomControlsSize
}

const ICON_SIZE: Record<ZoomControlsSize, number> = { default: 16, compact: 12 }

/**
 * One zoom control for every canvas (map, diagram), so they look and behave the same.
 * It floats in the top-right corner of its positioned parent.
 */
export function ZoomControls({ onZoomIn, onZoomOut, size = 'default' }: ZoomControlsProps) {
  const iconSize = ICON_SIZE[size]

  return (
    <div className={styles.controls} data-size={size} role="group" aria-label="Zoom">
      <button type="button" className={styles.button} aria-label="Zoom in" onClick={onZoomIn}>
        <Plus size={iconSize} aria-hidden="true" />
      </button>
      <button type="button" className={styles.button} aria-label="Zoom out" onClick={onZoomOut}>
        <Minus size={iconSize} aria-hidden="true" />
      </button>
    </div>
  )
}
