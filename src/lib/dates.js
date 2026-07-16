export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const toDateKey = (date = new Date()) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0')
].join('-')

export const parseDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const addDays = (date, days) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export const getTodayKey = () => toDateKey(new Date())

export const getDateKeysBetween = (startKey, endKey) => {
  const keys = []
  const current = parseDateKey(startKey)
  const end = parseDateKey(endKey)

  while (current <= end) {
    keys.push(toDateKey(current))
    current.setDate(current.getDate() + 1)
  }

  return keys
}

export const startOfWeek = (date, weekStartsOn = 0) => {
  const start = new Date(date)
  const offset = (start.getDay() - weekStartsOn + 7) % 7
  start.setDate(start.getDate() - offset)
  return start
}

export const endOfWeek = (date, weekStartsOn = 0) => addDays(startOfWeek(date, weekStartsOn), 6)

export const getTrailingDateKeys = (todayKey, dayCount) => {
  const end = parseDateKey(todayKey)
  const start = addDays(end, -(dayCount - 1))
  return getDateKeysBetween(toDateKey(start), todayKey)
}

export const getYearWeeks = (year, weekStartsOn = 0) => {
  const first = new Date(year, 0, 1)
  const last = new Date(year, 11, 31)
  const start = startOfWeek(first, weekStartsOn)
  const end = endOfWeek(last, weekStartsOn)
  const weeks = []
  let week = []
  const current = new Date(start)

  while (current <= end) {
    week.push({
      key: toDateKey(current),
      date: new Date(current),
      inYear: current.getFullYear() === year
    })

    if (week.length === 7) {
      weeks.push(week)
      week = []
    }

    current.setDate(current.getDate() + 1)
  }

  return weeks
}

export const formatDisplayDate = (dateKey) =>
  parseDateKey(dateKey).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

export const getMonthLabelForWeek = (week) => {
  const firstInMonth = week.find(({ date, inYear }) => inYear && date.getDate() <= 7)
  return firstInMonth ? MONTH_LABELS[firstInMonth.date.getMonth()] : ''
}
