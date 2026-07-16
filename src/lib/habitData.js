import { getDateKeysBetween, getTodayKey, getTrailingDateKeys, parseDateKey, toDateKey, WEEKDAY_LABELS } from './dates'

export const DATA_VERSION = 1

export const STATUS_DONE = 'done'
export const STATUS_SKIPPED = 'skipped'
export const STATUS_MISSED = 'missed'

export const HABIT_COLORS = ['#2f855a', '#2563eb', '#b45309', '#7c3aed', '#be123c', '#0f766e']

export const DEFAULT_SETTINGS = {
  reminderEnabled: false,
  reminderTime: '20:30',
  weekStartsOn: 0,
  theme: 'system'
}

export const createInitialData = () => ({
  version: DATA_VERSION,
  habits: [],
  entries: {},
  settings: { ...DEFAULT_SETTINGS }
})

const normalizeName = (name) => name.trim().replace(/\s+/g, ' ')

const createId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `habit-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export const createHabit = (name, options = {}) => {
  const normalized = normalizeName(name)
  if (!normalized) throw new Error('Habit name is required')

  return {
    id: options.id ?? createId(),
    name: normalized,
    color: options.color ?? HABIT_COLORS[0],
    active: options.active ?? true,
    createdAt: options.createdAt ?? new Date().toISOString(),
    archivedAt: options.archivedAt ?? null,
    reminderEnabled: options.reminderEnabled ?? false,
    reminderTime: options.reminderTime ?? '',
    sortOrder: options.sortOrder ?? 0
  }
}

export const normalizeData = (data) => {
  const fallback = createInitialData()
  if (!data || typeof data !== 'object') return fallback

  const habits = Array.isArray(data.habits)
    ? data.habits.map((habit, index) => ({
      id: String(habit.id),
      name: habit.name || 'Untitled habit',
      color: habit.color || HABIT_COLORS[index % HABIT_COLORS.length],
      active: habit.active !== false,
      createdAt: habit.createdAt || new Date().toISOString(),
      archivedAt: habit.archivedAt || null,
      reminderEnabled: habit.reminderEnabled === true,
      reminderTime: habit.reminderTime || '',
      sortOrder: Number.isFinite(habit.sortOrder) ? habit.sortOrder : index
    }))
    : Object.values(data.habits || {}).map((habit, index) => ({
      id: String(habit.id),
      name: habit.name || 'Untitled habit',
      color: habit.color || HABIT_COLORS[index % HABIT_COLORS.length],
      active: habit.active !== false,
      createdAt: habit.createdAt || new Date().toISOString(),
      archivedAt: habit.removedAt || habit.archivedAt || null,
      reminderEnabled: false,
      reminderTime: '',
      sortOrder: index
    }))

  return {
    version: DATA_VERSION,
    habits,
    entries: data.entries && typeof data.entries === 'object' ? data.entries : {},
    settings: {
      ...DEFAULT_SETTINGS,
      ...(data.settings || {})
    }
  }
}

export const sortHabits = (habits) =>
  [...habits].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))

export const getActiveHabits = (data) => sortHabits(data.habits.filter((habit) => habit.active))

export const getArchivedHabits = (data) => sortHabits(data.habits.filter((habit) => !habit.active))

export const getHabitById = (data, habitId) => data.habits.find((habit) => habit.id === habitId)

export const getHabitDateKey = (value) => {
  if (!value) return null
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : toDateKey(new Date(value))
}

export const isHabitDueOnDate = (habit, dateKey) => {
  const createdKey = getHabitDateKey(habit.createdAt)
  const archivedKey = getHabitDateKey(habit.archivedAt)

  if (createdKey && dateKey < createdKey) return false
  if (archivedKey && dateKey >= archivedKey) return false
  return habit.active || !archivedKey || dateKey < archivedKey
}

export const getEntryStatus = (data, dateKey, habitId) => data.entries[dateKey]?.[habitId]?.status ?? null

export const getHabitsForDate = (data, dateKey, habitId = 'all') => {
  const habits = habitId === 'all'
    ? data.habits
    : data.habits.filter((habit) => habit.id === habitId)

  return sortHabits(habits.filter((habit) => isHabitDueOnDate(habit, dateKey)))
}

export const summarizeDate = (data, dateKey, habitId = 'all') => {
  const habits = getHabitsForDate(data, dateKey, habitId)
  const dayEntries = data.entries[dateKey] || {}
  let done = 0
  let skipped = 0
  let missed = 0
  let total = 0

  habits.forEach((habit) => {
    const status = dayEntries[habit.id]?.status

    if (status === STATUS_SKIPPED) {
      skipped += 1
      return
    }

    total += 1

    if (status === STATUS_DONE) done += 1
    if (status === STATUS_MISSED) missed += 1
  })

  return {
    dateKey,
    done,
    skipped,
    missed,
    total,
    pending: Math.max(total - done - missed, 0),
    rate: total ? done / total : null
  }
}

export const getIntensityLevel = (rate) => {
  if (rate === null) return 0
  if (rate <= 0) return 1
  if (rate < 0.34) return 2
  if (rate < 0.67) return 3
  if (rate < 1) return 4
  return 5
}

export const updateHabitStatus = (data, dateKey, habitId, status) => {
  const nextEntries = { ...data.entries }
  const dayEntries = { ...(nextEntries[dateKey] || {}) }

  if (!status) {
    delete dayEntries[habitId]
  } else {
    dayEntries[habitId] = {
      status,
      completedAt: status === STATUS_DONE ? new Date().toISOString() : null
    }
  }

  if (Object.keys(dayEntries).length) {
    nextEntries[dateKey] = dayEntries
  } else {
    delete nextEntries[dateKey]
  }

  return {
    ...data,
    entries: nextEntries
  }
}

export const addHabitToData = (data, name, options = {}) => {
  const habit = createHabit(name, {
    color: HABIT_COLORS[data.habits.length % HABIT_COLORS.length],
    sortOrder: data.habits.length,
    ...options
  })

  return {
    ...data,
    habits: [...data.habits, habit]
  }
}

export const archiveHabit = (data, habitId, archivedAt = getTodayKey()) => ({
  ...data,
  habits: data.habits.map((habit) =>
    habit.id === habitId
      ? { ...habit, active: false, archivedAt }
      : habit
  )
})

export const restoreHabit = (data, habitId) => ({
  ...data,
  habits: data.habits.map((habit) =>
    habit.id === habitId
      ? { ...habit, active: true, archivedAt: null }
      : habit
  )
})

export const deleteHabit = (data, habitId) => {
  const entries = Object.fromEntries(
    Object.entries(data.entries).map(([dateKey, dayEntries]) => {
      const nextDay = { ...dayEntries }
      delete nextDay[habitId]
      return [dateKey, nextDay]
    }).filter(([, dayEntries]) => Object.keys(dayEntries).length)
  )

  return {
    ...data,
    habits: data.habits.filter((habit) => habit.id !== habitId),
    entries
  }
}

export const updateHabit = (data, habitId, patch) => ({
  ...data,
  habits: data.habits.map((habit) =>
    habit.id === habitId
      ? { ...habit, ...patch, name: patch.name ? normalizeName(patch.name) : habit.name }
      : habit
  )
})

const getFirstHabitDateKey = (data) => {
  const first = data.habits
    .map((habit) => getHabitDateKey(habit.createdAt))
    .filter(Boolean)
    .sort()[0]

  return first ?? getTodayKey()
}

export const calculateStreak = (data, todayKey = getTodayKey(), habitId = 'all') => {
  let streak = 0
  let cursor = parseDateKey(todayKey)

  while (true) {
    const dateKey = toDateKey(cursor)
    const summary = summarizeDate(data, dateKey, habitId)

    if (summary.total > 0 && summary.done === summary.total) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
      continue
    }

    if (summary.total === 0 && dateKey >= getFirstHabitDateKey(data)) {
      cursor.setDate(cursor.getDate() - 1)
      continue
    }

    break
  }

  return streak
}

export const calculateLongestStreak = (data, todayKey = getTodayKey(), habitId = 'all') => {
  const startKey = getFirstHabitDateKey(data)
  const dates = getDateKeysBetween(startKey, todayKey)
  let longest = 0
  let current = 0

  dates.forEach((dateKey) => {
    const summary = summarizeDate(data, dateKey, habitId)

    if (summary.total === 0) return

    if (summary.done === summary.total) {
      current += 1
      longest = Math.max(longest, current)
    } else {
      current = 0
    }
  })

  return longest
}

export const calculateCompletionRate = (data, dateKeys, habitId = 'all') => {
  const totals = dateKeys.reduce((acc, dateKey) => {
    const summary = summarizeDate(data, dateKey, habitId)
    return {
      done: acc.done + summary.done,
      total: acc.total + summary.total
    }
  }, { done: 0, total: 0 })

  return totals.total ? totals.done / totals.total : null
}

export const calculateHabitSummaries = (data, todayKey = getTodayKey()) =>
  sortHabits(data.habits).map((habit) => {
    const today = summarizeDate(data, todayKey, habit.id)
    return {
      habit,
      today,
      currentStreak: calculateStreak(data, todayKey, habit.id),
      longestStreak: calculateLongestStreak(data, todayKey, habit.id),
      rate30: calculateCompletionRate(data, getTrailingDateKeys(todayKey, 30), habit.id)
    }
  })

export const calculateDashboardStats = (data, todayKey = getTodayKey()) => {
  const today = summarizeDate(data, todayKey)
  const trailing7 = getTrailingDateKeys(todayKey, 7)
  const trailing30 = getTrailingDateKeys(todayKey, 30)
  const completionsTotal = Object.values(data.entries).reduce((count, dayEntries) =>
    count + Object.values(dayEntries).filter((entry) => entry.status === STATUS_DONE).length, 0)

  const weekdayTotals = WEEKDAY_LABELS.map((label, weekday) => {
    const relevantDates = getDateKeysBetween(getFirstHabitDateKey(data), todayKey)
      .filter((dateKey) => parseDateKey(dateKey).getDay() === weekday)
    return {
      label,
      rate: calculateCompletionRate(data, relevantDates)
    }
  }).filter((item) => item.rate !== null)

  const bestWeekday = weekdayTotals.sort((a, b) => b.rate - a.rate)[0] ?? null

  return {
    activeHabits: getActiveHabits(data).length,
    archivedHabits: getArchivedHabits(data).length,
    today,
    currentStreak: calculateStreak(data, todayKey),
    longestStreak: calculateLongestStreak(data, todayKey),
    rate7: calculateCompletionRate(data, trailing7),
    rate30: calculateCompletionRate(data, trailing30),
    completionsTotal,
    bestWeekday
  }
}

export const formatPercent = (rate) => rate === null ? 'No data' : `${Math.round(rate * 100)}%`
