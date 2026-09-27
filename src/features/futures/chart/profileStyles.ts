import type { Profile } from '../domain/profiles'

/**
 * Line style per profile, used whenever there is no band to draw. Shared by the charts and their
 * key so the two can never disagree.
 */
export const PROFILE_DASH: Record<Profile, string | undefined> = {
  base: undefined,
  peak: '6 4',
  offPeak: '1.5 3',
}
