import styles from './ClusterMarker.module.css'

/** Past these counts a cluster grows a step, so a bigger group reads as one at a glance. */
const SIZE_STEPS = [
  { from: 10, size: 'large' },
  { from: 5, size: 'medium' },
] as const

interface ClusterMarkerProps {
  count: number
  onExpand: () => void
}

/** Nearby sites merged into one marker; pressing it zooms in until they separate. */
export function ClusterMarker({ count, onExpand }: ClusterMarkerProps) {
  const size = SIZE_STEPS.find((step) => count >= step.from)?.size ?? 'small'

  return (
    <button
      type="button"
      className={styles.cluster}
      data-size={size}
      aria-label={`${String(count)} sites close together, zoom in to separate them`}
      onClick={onExpand}
    >
      {count}
    </button>
  )
}
