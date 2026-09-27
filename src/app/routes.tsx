import { Navigate, type RouteObject } from 'react-router'

import { ContractsPage } from '../pages/ContractsPage'
import { AppLayout } from './AppLayout'

const CONTRACTS_PATH = '/contracts'

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to={CONTRACTS_PATH} replace /> },
      { path: CONTRACTS_PATH, element: <ContractsPage /> },
      { path: '*', element: <Navigate to={CONTRACTS_PATH} replace /> },
    ],
  },
]
