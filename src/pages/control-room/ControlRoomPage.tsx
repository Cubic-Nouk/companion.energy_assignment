import { useCallback, useState } from 'react'

import { listSites } from '../../api/sites'
import { SiteDiagramPanel } from '../../features/control-room/diagram/SiteDiagramPanel'
import { SiteLegend } from '../../features/control-room/map/SiteLegend'
import { SiteMap } from '../../features/control-room/map/SiteMap'
import { PageHeader } from '../PageHeader'
import styles from './ControlRoomPage.module.css'

const SITES = listSites()

export function ControlRoomPage() {
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)
  const selectedSite = SITES.find((site) => site.id === selectedSiteId)
  // Stable, so the panel's Escape listener is not rebound on every render.
  const closeSite = useCallback(() => {
    setSelectedSiteId(null)
  }, [])

  return (
    <>
      <PageHeader title="Control Room" />
      <div className={styles.workspace} data-site-open={selectedSite ? 'true' : 'false'}>
        <div className={styles.mapArea}>
          <SiteMap
            sites={SITES}
            selectedSiteId={selectedSiteId}
            onSelectSite={setSelectedSiteId}
            isCompact={selectedSite !== undefined}
          />
          <div className={styles.legend}>
            <SiteLegend sites={SITES} />
          </div>
        </div>
        {selectedSite && (
          <div className={styles.diagramArea}>
            <SiteDiagramPanel site={selectedSite} onClose={closeSite} />
          </div>
        )}
      </div>
    </>
  )
}
