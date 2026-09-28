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

import type { ContractCoverage, SiteCategory } from '../domain/site'

export const SITE_CATEGORY_ICONS: Record<SiteCategory, LucideIcon> = {
  industrial: Factory,
  logistics: Warehouse,
  commercial: Building2,
  public: Landmark,
  dataCentre: Server,
  solarFarm: SolarPanel,
}

/** One page for one contract, a stack for several; a site without contract carries no badge. */
export const CONTRACT_BADGE_ICONS: Record<Exclude<ContractCoverage, 'none'>, LucideIcon> = {
  single: File,
  multiple: Files,
}
