import styles from './BatteryIcon.module.css'
import { LIT_SEGMENTS, type BatteryLevel } from './batteryDisplay'

const SEGMENTS = [0, 1, 2] as const
const SEGMENT_X = 4.5
const SEGMENT_STEP = 4.5

interface BatteryIconProps {
  level: BatteryLevel
  isCharging: boolean
}

/**
 * A battery drawn in the level's colour with its segments lit up to the charge. While charging,
 * the empty segments above the charge light up in turn, so the level stays readable as it fills.
 * Decorative: the card's text says the same.
 */
export function BatteryIcon({ level, isCharging }: BatteryIconProps) {
  const lit = LIT_SEGMENTS[level]

  return (
    <svg
      className={styles.icon}
      data-charging={isCharging}
      data-level={level}
      viewBox="0 0 24 24"
      width={22}
      height={22}
      aria-hidden="true"
    >
      <rect
        x="2"
        y="7"
        width="17"
        height="10"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M21.5 10.5v3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      {SEGMENTS.map((index) => (
        <rect
          key={index}
          className={styles.segment}
          data-lit={index < lit}
          x={SEGMENT_X + index * SEGMENT_STEP}
          y="9.5"
          width="3.5"
          height="5"
          rx="0.75"
          fill="currentColor"
        />
      ))}
    </svg>
  )
}
