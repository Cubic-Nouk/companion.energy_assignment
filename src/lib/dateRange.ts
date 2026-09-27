/** An inclusive range of calendar days, as ISO `YYYY-MM-DD` strings. */
export interface DateRange {
  from: string
  to: string
}

const DAY_MS = 86_400_000

const toTime = (isoDay: string) => Date.parse(`${isoDay}T00:00:00Z`)
const toIso = (time: number) => new Date(time).toISOString().slice(0, 10)

export const isIsoDay = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(toTime(value)) &&
  toIso(toTime(value)) === value

export function addDays(isoDay: string, days: number): string {
  return toIso(toTime(isoDay) + days * DAY_MS)
}

/** First day of the month an ISO day falls in. */
export function startOfMonth(isoDay: string): string {
  return `${isoDay.slice(0, 8)}01`
}

/** Number of calendar days the range covers, both ends included. */
export function rangeLength(range: DateRange): number {
  return Math.round((toTime(range.to) - toTime(range.from)) / DAY_MS) + 1
}

export function isRangeWithin(range: DateRange, bounds: DateRange): boolean {
  return range.from <= range.to && range.from >= bounds.from && range.to <= bounds.to
}

export type ShiftDirection = -1 | 1

/**
 * Moves a range by its own length, the previous or next period of the same size. Stops at the
 * bounds, keeping the length, and returns null when the range already touches that bound.
 */
export function shiftRange(
  range: DateRange,
  direction: ShiftDirection,
  bounds: DateRange,
): DateRange | null {
  const length = rangeLength(range)
  if (direction === 1 && range.to >= bounds.to) return null
  if (direction === -1 && range.from <= bounds.from) return null

  if (direction === 1) {
    const to = addDays(range.to, length) > bounds.to ? bounds.to : addDays(range.to, length)
    return { from: addDays(to, -(length - 1)), to }
  }
  const from =
    addDays(range.from, -length) < bounds.from ? bounds.from : addDays(range.from, -length)
  return { from, to: addDays(from, length - 1) }
}
