import { File, Files } from 'lucide-react'
import { describe, expect, it } from 'vitest'

import { CONTRACT_ICONS } from './siteIcons'

describe('CONTRACT_ICONS', () => {
  it('marks one contract with a page and several with a stack', () => {
    expect(CONTRACT_ICONS.single).toBe(File)
    expect(CONTRACT_ICONS.multiple).toBe(Files)
  })

  it('has no icon for a site without contract', () => {
    expect(CONTRACT_ICONS.none).toBeNull()
  })
})
