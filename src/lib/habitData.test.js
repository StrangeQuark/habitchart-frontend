import {
  addHabitToData,
  archiveHabit,
  calculateDashboardStats,
  calculateStreak,
  createInitialData,
  deleteHabit,
  formatPercent,
  getActiveHabits,
  getArchivedHabits,
  restoreHabit,
  STATUS_DONE,
  STATUS_MISSED,
  STATUS_SKIPPED,
  summarizeDate,
  updateHabitStatus
} from './habitData'

const buildData = () => {
  let data = createInitialData()

  data = addHabitToData(data, 'Read', {
    id: 'read',
    createdAt: '2026-01-01',
    color: '#2f855a'
  })

  data = addHabitToData(data, 'Run', {
    id: 'run',
    createdAt: '2026-01-01',
    color: '#2563eb'
  })

  return data
}

describe('habit data model', () => {
  it('adds habits with stable ids and trimmed names', () => {
    const data = addHabitToData(createInitialData(), '  Morning pages  ', {
      id: 'morning-pages',
      createdAt: '2026-01-01'
    })

    expect(data.habits).toHaveLength(1)
    expect(data.habits[0]).toMatchObject({
      id: 'morning-pages',
      name: 'Morning pages',
      active: true
    })
  })

  it('summarizes done, missed, pending, and skipped habits', () => {
    let data = buildData()
    data = updateHabitStatus(data, '2026-01-02', 'read', STATUS_DONE)
    data = updateHabitStatus(data, '2026-01-02', 'run', STATUS_SKIPPED)

    expect(summarizeDate(data, '2026-01-02')).toMatchObject({
      done: 1,
      skipped: 1,
      missed: 0,
      total: 1,
      pending: 0,
      rate: 1
    })

    data = updateHabitStatus(data, '2026-01-02', 'run', STATUS_MISSED)

    expect(summarizeDate(data, '2026-01-02')).toMatchObject({
      done: 1,
      skipped: 0,
      missed: 1,
      total: 2,
      pending: 0,
      rate: 0.5
    })
  })

  it('removes an entry when status is cleared', () => {
    let data = buildData()
    data = updateHabitStatus(data, '2026-01-02', 'read', STATUS_DONE)
    data = updateHabitStatus(data, '2026-01-02', 'read', null)

    expect(data.entries['2026-01-02']).toBeUndefined()
  })

  it('archives habits without erasing historical chart data', () => {
    let data = buildData()
    data = updateHabitStatus(data, '2026-01-02', 'read', STATUS_DONE)
    data = archiveHabit(data, 'read', '2026-01-03')

    expect(getActiveHabits(data).map((habit) => habit.id)).toEqual(['run'])
    expect(getArchivedHabits(data).map((habit) => habit.id)).toEqual(['read'])
    expect(summarizeDate(data, '2026-01-02', 'read').total).toBe(1)
    expect(summarizeDate(data, '2026-01-03', 'read').total).toBe(0)
  })

  it('restores and permanently deletes archived habits', () => {
    let data = buildData()
    data = updateHabitStatus(data, '2026-01-02', 'read', STATUS_DONE)
    data = archiveHabit(data, 'read', '2026-01-03')
    data = restoreHabit(data, 'read')

    expect(getActiveHabits(data).map((habit) => habit.id)).toContain('read')

    data = archiveHabit(data, 'read', '2026-01-03')
    data = deleteHabit(data, 'read')

    expect(data.habits.map((habit) => habit.id)).not.toContain('read')
    expect(data.entries['2026-01-02']?.read).toBeUndefined()
  })

  it('calculates dashboard stats and streaks', () => {
    let data = buildData()

    data = updateHabitStatus(data, '2026-01-01', 'read', STATUS_DONE)
    data = updateHabitStatus(data, '2026-01-01', 'run', STATUS_DONE)
    data = updateHabitStatus(data, '2026-01-02', 'read', STATUS_DONE)
    data = updateHabitStatus(data, '2026-01-02', 'run', STATUS_MISSED)
    data = updateHabitStatus(data, '2026-01-03', 'read', STATUS_DONE)
    data = updateHabitStatus(data, '2026-01-03', 'run', STATUS_DONE)
    data = updateHabitStatus(data, '2026-01-04', 'read', STATUS_DONE)
    data = updateHabitStatus(data, '2026-01-04', 'run', STATUS_DONE)
    data = updateHabitStatus(data, '2026-01-05', 'read', STATUS_DONE)

    const stats = calculateDashboardStats(data, '2026-01-05')

    expect(stats.today).toMatchObject({ done: 1, total: 2, rate: 0.5 })
    expect(stats.currentStreak).toBe(0)
    expect(stats.longestStreak).toBe(2)
    expect(calculateStreak(data, '2026-01-05', 'read')).toBe(5)
    expect(stats.completionsTotal).toBe(8)
  })

  it('formats missing and present percentages', () => {
    expect(formatPercent(null)).toBe('No data')
    expect(formatPercent(0.625)).toBe('63%')
  })
})
