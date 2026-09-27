/**
 * Load profiles of a power future. Base covers every hour of the week, peak the weekday hours
 * 08:00 to 20:00, off-peak the rest.
 */
export type Profile = 'base' | 'peak' | 'offPeak'

export const PROFILES: readonly Profile[] = ['base', 'peak', 'offPeak']

export const PROFILE_LABELS: Record<Profile, string> = {
  base: 'Base',
  peak: 'Peak',
  offPeak: 'Off-Peak',
}

export const PEAK_HOURS_PER_WEEK = 60
export const OFF_PEAK_HOURS_PER_WEEK = 108
export const HOURS_PER_WEEK = PEAK_HOURS_PER_WEEK + OFF_PEAK_HOURS_PER_WEEK

export type ProfilePrices = Record<Profile, number>

/**
 * Derives peak and off-peak from a base price and the peak premium (peak minus off-peak), so that
 * base is exactly their hour-weighted average, as it is on the market.
 */
export function pricesFromBase(base: number, peakPremium: number): ProfilePrices {
  return {
    base,
    peak: base + (peakPremium * OFF_PEAK_HOURS_PER_WEEK) / HOURS_PER_WEEK,
    offPeak: base - (peakPremium * PEAK_HOURS_PER_WEEK) / HOURS_PER_WEEK,
  }
}

/**
 * How a product is drawn for the selected profiles. With both peak and off-peak there is a band
 * between them; otherwise each selected profile is its own line.
 */
export function isBandShown(profiles: ReadonlySet<Profile>): boolean {
  return profiles.has('peak') && profiles.has('offPeak')
}
