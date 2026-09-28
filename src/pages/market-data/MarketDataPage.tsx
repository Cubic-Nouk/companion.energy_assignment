import { Suspense } from 'react'
import { Outlet } from 'react-router'

import { TabNav } from '../../components/TabNav/TabNav'
import { PageHeader } from '../PageHeader'
import styles from './MarketDataPage.module.css'
import { MARKET_DATA_SECTIONS } from './sections'

export function MarketDataPage() {
  return (
    <>
      <PageHeader title="Market Data" />
      <TabNav label="Market data sections" items={MARKET_DATA_SECTIONS} />
      <div className={styles.content}>
        {/* Keeps the header and tabs on screen while a lazily loaded section arrives. */}
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </div>
    </>
  )
}
