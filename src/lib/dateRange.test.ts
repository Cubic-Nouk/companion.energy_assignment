import { describe, expect, it } from 'vitest'

import {
  addDays,
  isIsoDay,
  isRangeWithin,
  rangeLength,
  shiftRange,
  startOfMonth,
} from './dateRange'

const bounds = { from: '2026-06-01', to: '2026-09-28' }

describe('date helpers', () => {
  it('adds days across month ends', () => {
    expect(addDays('2026-08-30', 3)).toBe('2026-09-02')
  })

  it('finds the first day of the month', () => {
    expect(startOfMonth('2026-09-28')).toBe('2026-09-01')
  })

  it('counts both ends of a range', () => {
    expect(rangeLength({ from: '2026-09-21', to: '2026-09-27' })).toBe(7)
  })

  it('accepts only real ISO days', () => {
    expect(isIsoDay('2026-09-28')).toBe(true)
    expect(isIsoDay('2026-02-30')).toBe(false)
    expect(isIsoDay('28/09/2026')).toBe(false)
  })

  it('checks a range is ordered and inside the bounds', () => {
    expect(isRangeWithin({ from: '2026-09-01', to: '2026-09-28' }, bounds)).toBe(true)
    expect(isRangeWithin({ from: '2026-09-10', to: '2026-09-01' }, bounds)).toBe(false)
    expect(isRangeWithin({ from: '2026-05-01', to: '2026-09-01' }, bounds)).toBe(false)
  })
})

describe('shiftRange', () => {
  it('moves back by the length of the range', () => {
    expect(shiftRange({ from: '2026-09-21', to: '2026-09-27' }, -1, bounds)).toEqual({
      from: '2026-09-14',
      to: '2026-09-20',
    })
  })

  it('stops at the latest day and keeps the length', () => {
    expect(shiftRange({ from: '2026-09-15', to: '2026-09-21' }, 1, bounds)).toEqual({
      from: '2026-09-22',
      to: '2026-09-28',
    })
  })

  it('returns null when the range already touches the bound', () => {
    expect(shiftRange({ from: '2026-09-22', to: '2026-09-28' }, 1, bounds)).toBeNull()
    expect(shiftRange({ from: '2026-06-01', to: '2026-06-07' }, -1, bounds)).toBeNull()
  })

  it('stops at the earliest day and keeps the length', () => {
    expect(shiftRange({ from: '2026-06-04', to: '2026-06-10' }, -1, bounds)).toEqual({
      from: '2026-06-01',
      to: '2026-06-07',
    })
  })
})
