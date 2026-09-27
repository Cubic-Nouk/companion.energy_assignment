import { DateRangeStepper } from '../../../components/DateRangeStepper/DateRangeStepper'
import { MultiSelect } from '../../../components/MultiSelect/MultiSelect'
import { Select } from '../../../components/Select/Select'
import { FUTURES_HISTORY } from '../../../api/futures'
import { GRANULARITIES, MARKETS } from '../domain/catalogue'
import { PROFILE_LABELS, PROFILES } from '../domain/profiles'
import type { FuturesFilters } from './filterParams'
import styles from './FuturesFilterBar.module.css'

const MARKET_OPTIONS = MARKETS.map((market) => ({ value: market.id, label: market.label }))
const GRANULARITY_OPTIONS = GRANULARITIES.map((g) => ({ value: g.id, label: g.label }))
const PROFILE_OPTIONS = PROFILES.map((profile) => ({
  value: profile,
  label: PROFILE_LABELS[profile],
}))

interface FuturesFilterBarProps {
  filters: FuturesFilters
  onChange: (filters: FuturesFilters) => void
}

export function FuturesFilterBar({ filters, onChange }: FuturesFilterBarProps) {
  return (
    <div className={styles.bar} role="group" aria-label="Futures filters">
      <div className={styles.group}>
        <Select
          label="Market"
          value={filters.market}
          options={MARKET_OPTIONS}
          onValueChange={(market) => {
            onChange({ ...filters, market })
          }}
        />
        <Select
          label="Product length"
          value={filters.granularity}
          options={GRANULARITY_OPTIONS}
          onValueChange={(granularity) => {
            onChange({ ...filters, granularity })
          }}
        />
        <MultiSelect
          label="Profiles"
          placeholder="No profile"
          options={PROFILE_OPTIONS}
          selected={filters.profiles}
          onChange={(profiles) => {
            onChange({ ...filters, profiles })
          }}
        />
      </div>
      <DateRangeStepper
        label="Trading days"
        value={filters.range}
        bounds={FUTURES_HISTORY}
        onChange={(range) => {
          onChange({ ...filters, range })
        }}
      />
    </div>
  )
}
