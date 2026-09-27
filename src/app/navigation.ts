export interface NavItem {
  label: string
  path: string
  /** False for pages this prototype does not build: they show in the sidebar, disabled. */
  isEnabled: boolean
}

export interface NavCategory {
  label: string
  items: readonly NavItem[]
}

export const NAVIGATION: readonly NavCategory[] = [
  {
    label: 'System',
    items: [
      { label: 'Control Room', path: '/control-room', isEnabled: false },
      { label: 'Contracts', path: '/contracts', isEnabled: true },
      { label: 'Budgets', path: '/budgets', isEnabled: false },
      { label: 'Market Data', path: '/market-data', isEnabled: true },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Energy', path: '/insights/energy', isEnabled: false },
      { label: 'Financial', path: '/insights/financial', isEnabled: false },
      { label: 'Sustainability', path: '/insights/sustainability', isEnabled: false },
    ],
  },
  {
    label: 'Flexibility',
    items: [
      { label: 'Savings', path: '/flexibility/savings', isEnabled: false },
      { label: 'Nomination', path: '/flexibility/nomination', isEnabled: false },
      { label: 'Forecasts', path: '/flexibility/forecasts', isEnabled: false },
    ],
  },
]
