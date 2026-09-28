import { lazy } from 'react'

// Split out of the main bundle: the map library only matters to the Control Room, and the futures
// data, chart and filters only to Market Data. React.lazy (rather than a route-level `lazy`) keeps
// the app shell on screen while a page loads.
export const ControlRoomPage = lazy(async () => ({
  default: (await import('../pages/control-room/ControlRoomPage')).ControlRoomPage,
}))
export const FuturesSection = lazy(async () => ({
  default: (await import('../pages/market-data/FuturesSection')).FuturesSection,
}))
