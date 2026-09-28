import {
  contractCoverage,
  formatContractCount,
  SITE_CATEGORY_LABELS,
  type Site,
} from '../domain/site'
import { CONTRACT_ICONS, SITE_CATEGORY_ICONS } from '../siteIcons'
import styles from './SiteMarker.module.css'

interface SiteMarkerProps {
  site: Site
  isSelected: boolean
  onSelect: () => void
}

/** A site on the map: what it is as the icon, how many contracts cover it as the corner badge. */
export function SiteMarker({ site, isSelected, onSelect }: SiteMarkerProps) {
  const CategoryIcon = SITE_CATEGORY_ICONS[site.category]
  const coverage = contractCoverage(site)
  const BadgeIcon = CONTRACT_ICONS[coverage]
  const contracts = formatContractCount(site.contractIds.length).toLowerCase()

  return (
    <button
      type="button"
      className={styles.marker}
      aria-label={`${site.name}, ${SITE_CATEGORY_LABELS[site.category]}, ${contracts}`}
      aria-pressed={isSelected}
      title={site.name}
      onClick={onSelect}
    >
      <CategoryIcon size={16} strokeWidth={1.75} aria-hidden="true" />
      {BadgeIcon && (
        <span className={styles.badge} data-coverage={coverage} aria-hidden="true">
          <BadgeIcon size={10} strokeWidth={2} />
        </span>
      )}
    </button>
  )
}
