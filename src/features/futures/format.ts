const priceFormat = new Intl.NumberFormat('en-GB', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const longDayFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const shortDayFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
})

const toDate = (isoDay: string) => new Date(`${isoDay}T00:00:00Z`)

export function formatPrice(value: number): string {
  return priceFormat.format(value)
}

/** `Mon 28 Sept 2026` */
export function formatTradingDay(isoDay: string): string {
  return longDayFormat.format(toDate(isoDay)).replace(',', '')
}

/** `28/09` */
export function formatShortDay(isoDay: string): string {
  return shortDayFormat.format(toDate(isoDay))
}
