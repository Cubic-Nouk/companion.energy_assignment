import { Navigate, type RouteObject } from 'react-router'

import { ContractsPage } from '../pages/ContractsPage'
import { MarketDataPage } from '../pages/market-data/MarketDataPage'
import { FUTURES_PATH, MARKET_DATA_PATH } from '../pages/market-data/sections'
import { AppLayout } from './AppLayout'

const CONTRACTS_PATH = '/contracts'

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to={CONTRACTS_PATH} replace /> },
      { path: CONTRACTS_PATH, element: <ContractsPage /> },
      {
        path: MARKET_DATA_PATH,
        element: <MarketDataPage />,
        children: [
          { index: true, element: <Navigate to={FUTURES_PATH} replace /> },
          {
            path: FUTURES_PATH,
            // Split out: the futures data, chart and filter controls load only when opened.
            lazy: async () => {
              const { FuturesSection } = await import('../pages/market-data/FuturesSection')
              return { Component: FuturesSection }
            },
          },
        ],
      },
      { path: '*', element: <Navigate to={CONTRACTS_PATH} replace /> },
    ],
  },
]
