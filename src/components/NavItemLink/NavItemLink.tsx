import { NavLink } from 'react-router'

import type { NavItem } from '../../app/navigation'

interface NavItemLinkProps {
  item: NavItem
  className: string | undefined
}

/**
 * A navigation entry: a router link when the page exists, otherwise a disabled item with no
 * destination. Style the disabled state with `[aria-disabled='true']`, the current page with
 * `[aria-current='page']`.
 */
export function NavItemLink({ item, className }: NavItemLinkProps) {
  if (!item.isEnabled) {
    return (
      <span role="link" aria-disabled="true" className={className}>
        {item.label}
      </span>
    )
  }

  return (
    // Function form: NavLink's static className rejects the `string | undefined` of a CSS module key.
    <NavLink to={item.path} className={() => className}>
      {item.label}
    </NavLink>
  )
}
