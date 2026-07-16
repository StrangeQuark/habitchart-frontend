import { addDays, getDateKeysBetween, getTrailingDateKeys, getYearWeeks, parseDateKey, toDateKey } from './dates'

describe('date utilities', () => {
  it('creates local YYYY-MM-DD keys', () => {
    expect(toDateKey(new Date(2026, 0, 7))).toBe('2026-01-07')
  })

  it('parses date keys as local dates', () => {
    const parsed = parseDateKey('2026-07-08')

    expect(parsed.getFullYear()).toBe(2026)
    expect(parsed.getMonth()).toBe(6)
    expect(parsed.getDate()).toBe(8)
  })

  it('creates inclusive date ranges', () => {
    expect(getDateKeysBetween('2026-01-30', '2026-02-02')).toEqual([
      '2026-01-30',
      '2026-01-31',
      '2026-02-01',
      '2026-02-02'
    ])
  })

  it('creates trailing date windows', () => {
    expect(getTrailingDateKeys('2026-03-03', 3)).toEqual([
      '2026-03-01',
      '2026-03-02',
      '2026-03-03'
    ])
  })

  it('pads year weeks to complete seven-day columns', () => {
    const weeks = getYearWeeks(2026)

    expect(weeks.every((week) => week.length === 7)).toBe(true)
    expect(weeks[0][0].date.getDay()).toBe(0)
    expect(weeks.at(-1).at(-1).date.getDay()).toBe(6)
  })

  it('adds days without mutating the original date', () => {
    const original = new Date(2026, 0, 1)
    const next = addDays(original, 4)

    expect(toDateKey(original)).toBe('2026-01-01')
    expect(toDateKey(next)).toBe('2026-01-05')
  })
})
