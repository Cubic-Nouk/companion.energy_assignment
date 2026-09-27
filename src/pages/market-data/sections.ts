import type { NavItem } from '../../app/navigation'

export const MARKET_DATA_PATH = '/market-data'
export const FUTURES_PATH = `${MARKET_DATA_PATH}/futures`

export const MARKET_DATA_SECTIONS: readonly NavItem[] = [
  { label: 'Day-Ahead', path: `${MARKET_DATA_PATH}/day-ahead`, isEnabled: false },
  { label: 'Futures', path: FUTURES_PATH, isEnabled: true },
  { label: 'Imbalance', path: `${MARKET_DATA_PATH}/imbalance`, isEnabled: false },
]
