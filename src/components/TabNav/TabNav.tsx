import type { NavItem } from '../../app/navigation'
import { NavItemLink } from '../NavItemLink/NavItemLink'
import styles from './TabNav.module.css'

interface TabNavProps {
  label: string
  items: readonly NavItem[]
}

/** Sub-navigation between the sections of a page. Each tab is a route, so it is a nav of links. */
export function TabNav({ label, items }: TabNavProps) {
  return (
    <nav className={styles.tabNav} aria-label={label}>
      <ul className={styles.tabs}>
        {items.map((item) => (
          <li key={item.path}>
            <NavItemLink item={item} className={styles.tab} />
          </li>
        ))}
      </ul>
    </nav>
  )
}
