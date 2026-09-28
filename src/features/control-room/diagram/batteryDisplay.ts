import { ArrowUpFromLine, Pause, Zap, type LucideIcon } from 'lucide-react'

import type { BatteryFlow } from '../domain/site'

export type BatteryLevel = 'low' | 'medium' | 'full'

/** A third of the capacity or less reads as low; two thirds or more as full. */
const LOW_UP_TO_PERCENT = 33
const FULL_FROM_PERCENT = 67

export function batteryLevel(stateOfChargePercent: number): BatteryLevel {
  if (stateOfChargePercent <= LOW_UP_TO_PERCENT) return 'low'
  return stateOfChargePercent >= FULL_FROM_PERCENT ? 'full' : 'medium'
}

/** How many of the battery icon's three segments are lit at each level. */
export const LIT_SEGMENTS: Record<BatteryLevel, number> = { low: 1, medium: 2, full: 3 }

/**
 * Charging shows as energy (a bolt), discharging as energy leaving. A lookup table rather than a
 * function, so React sees fixed components, not ones made during render.
 */
export const BATTERY_FLOW_ICONS: Record<BatteryFlow, LucideIcon> = {
  charging: Zap,
  discharging: ArrowUpFromLine,
  idle: Pause,
}

/** The bolt keeps full size to draw the eye; supplying and standby sit quieter. */
export const BATTERY_FLOW_ICON_SIZES: Record<BatteryFlow, number> = {
  charging: 14,
  discharging: 12,
  idle: 12,
}
