import { describe, expect, it } from 'vitest'

import { getInitials } from './initials'

describe('getInitials', () => {
  it('takes the first letter of the first and last name', () => {
    expect(getInitials('Alex', 'Martin')).toBe('AM')
  })

  it('uppercases and ignores surrounding whitespace', () => {
    expect(getInitials('  alex', ' martin ')).toBe('AM')
  })

  it('falls back to a single letter when a name is missing', () => {
    expect(getInitials('Alex', '')).toBe('A')
  })
})
