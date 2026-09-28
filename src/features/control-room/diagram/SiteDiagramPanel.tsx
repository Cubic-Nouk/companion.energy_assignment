import { X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'

import { formatAddress, type Site } from '../domain/site'
import { SiteDiagram } from './SiteDiagram'
import styles from './SiteDiagramPanel.module.css'

interface SiteDiagramPanelProps {
  site: Site
  onClose: () => void
}

/** Opens next to the map when a site is selected; Escape or the close button hands the space back. */
export function SiteDiagramPanel({ site, onClose }: SiteDiagramPanelProps) {
  const titleId = useId()
  const titleRef = useRef<HTMLHeadingElement>(null)

  // The panel opens away from the marker that opened it: take keyboard and screen reader focus
  // along, so they land on what just appeared.
  useEffect(() => {
    titleRef.current?.focus()
  }, [site.id])
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose])

  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <header className={styles.header}>
        <div>
          <h2 id={titleId} ref={titleRef} className={styles.title} tabIndex={-1}>
            {site.name}
          </h2>
          <address className={styles.address}>{formatAddress(site.address)}</address>
        </div>
        <button
          type="button"
          className={styles.close}
          aria-label="Close site diagram"
          onClick={onClose}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>
      {/* Keyed on the site: the canvas reads its cards once, when it mounts. */}
      <SiteDiagram key={site.id} site={site} />
    </section>
  )
}
