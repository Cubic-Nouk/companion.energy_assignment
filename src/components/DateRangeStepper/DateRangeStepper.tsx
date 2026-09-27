import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

import { shiftRange, type DateRange, type ShiftDirection } from '../../lib/dateRange'
import styles from './DateRangeStepper.module.css'

const labelFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
})

const formatDay = (isoDay: string) => labelFormat.format(new Date(`${isoDay}T00:00:00Z`))

interface DateRangeStepperProps {
  label: string
  value: DateRange
  /** The days the range can move within, e.g. the history the data covers. */
  bounds: DateRange
  onChange: (range: DateRange) => void
}

/** Shows a date range and steps it to the previous or next period of the same length. */
export function DateRangeStepper({ label, value, bounds, onChange }: DateRangeStepperProps) {
  const previous = shiftRange(value, -1, bounds)
  const next = shiftRange(value, 1, bounds)

  const step = (direction: ShiftDirection) => {
    const target = direction === -1 ? previous : next
    if (target) onChange(target)
  }

  return (
    <div className={styles.control} role="group" aria-label={label}>
      <button
        type="button"
        className={styles.step}
        aria-label="Previous period"
        disabled={!previous}
        onClick={() => {
          step(-1)
        }}
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </button>
      <p className={styles.range} aria-live="polite">
        <CalendarDays size={16} aria-hidden="true" className={styles.icon} />
        {formatDay(value.from)} – {formatDay(value.to)}
      </p>
      <button
        type="button"
        className={styles.step}
        aria-label="Next period"
        disabled={!next}
        onClick={() => {
          step(1)
        }}
      >
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
