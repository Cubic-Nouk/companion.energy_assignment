import { NavLink } from 'react-router'

import type { NavCategory } from '../../app/navigation'
import type { User } from '../../data/currentUser'
import { getInitials } from '../../lib/initials'
import styles from './Sidebar.module.css'

interface SidebarProps {
  organisationName: string
  categories: readonly NavCategory[]
  user: User
}

export function Sidebar({ organisationName, categories, user }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>{organisationName}</div>

      <nav className={styles.nav} aria-label="Main navigation">
        {categories.map((category) => {
          const headingId = `nav-category-${category.label.toLowerCase()}`
          return (
            <div key={category.label} className={styles.category}>
              <h2 id={headingId} className={styles.categoryLabel}>
                {category.label}
              </h2>
              <ul className={styles.pages} aria-labelledby={headingId}>
                {category.items.map((item) => (
                  <li key={item.path}>
                    {item.isEnabled ? (
                      // Function form: NavLink's static className rejects the `string | undefined` of a CSS module key.
                      <NavLink to={item.path} className={() => styles.link}>
                        {item.label}
                      </NavLink>
                    ) : (
                      <span role="link" aria-disabled="true" className={styles.link}>
                        {item.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </nav>

      <div className={styles.user}>
        <span className={styles.avatar} aria-hidden="true">
          {getInitials(user.firstName, user.lastName)}
        </span>
        <div className={styles.userText}>
          <p className={styles.userName}>
            {user.firstName} {user.lastName}
          </p>
          <p className={styles.userEmail}>{user.email}</p>
        </div>
      </div>
    </aside>
  )
}
