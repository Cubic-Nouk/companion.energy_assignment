import { Suspense } from 'react'
import { Outlet } from 'react-router'

import { Sidebar } from '../components/Sidebar/Sidebar'
import { CURRENT_USER } from '../api/currentUser'
import styles from './AppLayout.module.css'
import { NAVIGATION } from './navigation'

export function AppLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar organisationName="Org-Energy" categories={NAVIGATION} user={CURRENT_USER} />
      <main className={styles.main}>
        {/* A lazily loaded page renders nothing for the moment it loads; the shell stays put. */}
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
