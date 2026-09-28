import {
  contractCoverage,
  SITE_CATEGORIES,
  SITE_CATEGORY_LABELS,
  type ContractCoverage,
  type Site,
} from '../domain/site'
import styles from './SiteLegend.module.css'
import { CONTRACT_ICONS, SITE_CATEGORY_ICONS } from '../siteIcons'

const COVERAGE_LABELS: Record<ContractCoverage, string> = {
  single: 'One contract',
  multiple: 'Several contracts',
  none: 'No contract',
}

const COVERAGE_ORDER: readonly ContractCoverage[] = ['single', 'multiple', 'none']

interface SiteLegendProps {
  sites: readonly Site[]
}

/** Map key: the contract badges with their counts, then the site types the icons stand for. */
export function SiteLegend({ sites }: SiteLegendProps) {
  const countOf = (coverage: ContractCoverage) =>
    sites.filter((site) => contractCoverage(site) === coverage).length
  const categoriesShown = SITE_CATEGORIES.filter((category) =>
    sites.some((site) => site.category === category),
  )

  return (
    <div className={styles.legend}>
      <ul className={styles.list} aria-label="Contracts">
        {COVERAGE_ORDER.map((coverage) => {
          const Icon = CONTRACT_ICONS[coverage]
          return (
            <li key={coverage}>
              <span className={styles.badge} data-empty={Icon === null} aria-hidden="true">
                {Icon && <Icon size={10} strokeWidth={2} />}
              </span>
              {COVERAGE_LABELS[coverage]}
              <span className={styles.count}>{countOf(coverage)}</span>
            </li>
          )
        })}
        <li>
          <span className={styles.cluster} aria-hidden="true" />
          Group of nearby sites
        </li>
      </ul>
      <ul className={styles.categories} aria-label="Site types">
        {categoriesShown.map((category) => {
          const Icon = SITE_CATEGORY_ICONS[category]
          return (
            <li key={category}>
              <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
              {SITE_CATEGORY_LABELS[category]}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
