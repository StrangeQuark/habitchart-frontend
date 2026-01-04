import Tile from './Tile'
import './css/Chart.css'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const toDateKey = (date) => [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('-')

const getDatesForView = (viewMode, year) => {
    const dates = []
    const now = new Date()

    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    )

    let start
    let end

    if (viewMode === 'year') {
        start = new Date(year, 0, 1)
        end = new Date(year, 11, 31)
    } else if (viewMode === 'month') {
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    } else {
        // week
        const dayOfWeek = today.getDay()
        start = new Date(today)
        start.setDate(today.getDate() - dayOfWeek)

        end = new Date(start)
        end.setDate(start.getDate() + 6)
    }

    const current = new Date(start)
    while (current <= end) {
        dates.push(toDateKey(current))
        current.setDate(current.getDate() + 1)
    }

    return dates
}

/* ---------- padding ---------- */

const padDatesForWeeks = (dates) => {
    if (!dates.length) return []

    const firstDate = new Date(dates[0] + 'T00:00:00')
    const leadingDays = firstDate.getDay()

    return [
        ...Array(leadingDays).fill(null),
        ...dates
    ]
}

const padDatesForMonth = (dates) => {
    if (!dates.length) return []

    const first = new Date(dates[0] + 'T00:00:00')
    const last = new Date(dates[dates.length - 1] + 'T00:00:00')

    const leading = first.getDay()
    const trailing = 6 - last.getDay()

    return [
        ...Array(leading).fill(null),
        ...dates,
        ...Array(trailing).fill(null)
    ]
}

/* ---------- intensity ---------- */

const calculateIntensity = (entry, habits, selectedHabit) => {
    if (!habits.length) return 0

    if (selectedHabit !== 'all' && selectedHabit !== 'active') {
        return entry[selectedHabit]?.completed ? 1 : 0
    }

    let completed = 0

    for (const habit of habits) {
        if (!entry[habit.id]?.completed) continue
        if (selectedHabit === 'active' && !habit.active) continue
        completed++
    }

    return completed / habits.length
}

/* ---------- shared renderer ---------- */

const renderTiles = (dates, entries, habits, selectedHabit) =>
    dates.map((date, index) => {
        if (!date) {
            return (
                <div
                    key={`empty-${index}`}
                    className="tile tile--empty"
                />
            )
        }

        const entry = entries[date] || {}

        return (
            <Tile
                key={date}
                date={date}
                entry={entry}
                intensity={calculateIntensity(
                    entry,
                    habits,
                    selectedHabit
                )}
            />
        )
    })

/* ---------- component ---------- */

const Chart = ({ habits, entries, selectedHabit, viewMode, year }) => {
    const habitList = Object.values(habits)

    /* ===== YEAR ===== */
    if (viewMode === 'year') {
        const dates = getDatesForView('year', year)
        const paddedDates = padDatesForWeeks(dates)

        return (
            <div className="chart-wrapper">
                <div className="chart-labels">
                    {WEEKDAYS.map(day => (
                        <div key={day} className="chart-label">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="chart">
                    {renderTiles(
                        paddedDates,
                        entries,
                        habitList,
                        selectedHabit
                    )}
                </div>
            </div>
        )
    }

    /* ===== YEAR CALENDAR ===== */
    if (viewMode === 'year-calendar') {
        return (
            <div className="year-calendar">
                {Array.from({ length: 12 }).map((_, month) => {
                    const start = new Date(year, month, 1)
                    const end = new Date(year, month + 1, 0)

                    const dates = []
                    const current = new Date(start)
                    while (current <= end) {
                        dates.push(toDateKey(current))
                        current.setDate(current.getDate() + 1)
                    }

                    const padded = padDatesForMonth(dates)

                    return (
                        <div key={month} className="calendar-month">
                            <div className="calendar-month-title">
                                {start.toLocaleString('default', {
                                    month: 'long'
                                })}
                            </div>

                            <div className="calendar-weekdays">
                                {WEEKDAYS.map(d => (
                                    <div key={d}>{d}</div>
                                ))}
                            </div>

                            <div className="calendar-grid">
                                {renderTiles(
                                    padded,
                                    entries,
                                    habitList,
                                    selectedHabit
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    /* ===== MONTH / WEEK ===== */

    const dates = getDatesForView(viewMode, year)
    const padded =
        viewMode === 'month'
            ? padDatesForMonth(dates)
            : padDatesForWeeks(dates)

    return (
        <div className={`chart chart--${viewMode}`}>
            {viewMode === 'month' && (
                <div className="calendar-weekdays">
                    {WEEKDAYS.map(d => (
                        <div key={d}>{d}</div>
                    ))}
                </div>
            )}

            <div
                className={
                    viewMode === 'month'
                        ? 'calendar-grid'
                        : 'heatmap-grid'
                }
            >
                {renderTiles(
                    padded,
                    entries,
                    habitList,
                    selectedHabit
                )}
            </div>
        </div>
    )
}

export default Chart
