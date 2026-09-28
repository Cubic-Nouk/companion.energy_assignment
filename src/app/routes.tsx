import { Navigate, type RouteObject } from 'react-router'

import { MarketDataPage } from '../pages/market-data/MarketDataPage'
import { FUTURES_PATH, MARKET_DATA_PATH } from '../pages/market-data/sections'
import { AppLayout } from './AppLayout'
import { ControlRoomPage, FuturesSection } from './lazyPages'

const CONTROL_ROOM_PATH = '/control-room'

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to={CONTROL_ROOM_PATH} replace /> },
      { path: CONTROL_ROOM_PATH, element: <ControlRoomPage /> },
      {
        path: MARKET_DATA_PATH,
        element: <MarketDataPage />,
        children: [
          { index: true, element: <Navigate to={FUTURES_PATH} replace /> },
          { path: FUTURES_PATH, element: <FuturesSection /> },
        ],
      },
      { path: '*', element: <Navigate to={CONTROL_ROOM_PATH} replace /> },
    ],
  },
]
