import {
  Building2,
  Factory,
  File,
  Files,
  Landmark,
  Server,
  SolarPanel,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'

import type { ContractCoverage, SiteCategory } from './domain/site'

export const SITE_CATEGORY_ICONS: Record<SiteCategory, LucideIcon> = {
  industrial: Factory,
  logistics: Warehouse,
  commercial: Building2,
  public: Landmark,
  dataCentre: Server,
  solarFarm: SolarPanel,
}

/**
 * The icon that marks a site's contracts, wherever they show (map badge, key, diagram card):
 * one page for one contract, a stack for several, and none without contract, so the icon only
 * ever stands for contracts that exist. A lookup table rather than a function, so React sees a
 * fixed component, not one made during render.
 */
export const CONTRACT_ICONS: Record<ContractCoverage, LucideIcon | null> = {
  none: null,
  single: File,
  multiple: Files,
}
