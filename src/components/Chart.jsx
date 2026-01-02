import Tile from './Tile'
import './css/Chart.css'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const toDateKey = (date) => {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('-')
}

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

const padDatesForWeeks = (dates) => {
    if (dates.length === 0) return []

    const firstDate = new Date(dates[0] + 'T00:00:00')
    const leadingDays = firstDate.getDay()

    return [
        ...Array(leadingDays).fill(null),
        ...dates
    ]
}

const calculateIntensity = (entry, habits, selectedHabit) => {
    if (habits.length === 0) return 0

    if (selectedHabit !== 'all' && selectedHabit !== 'active') {
        return entry[selectedHabit] ? 1 : 0
    }

    let completed = 0

    for (const habit of habits) {
        if (!entry[habit.id]) continue

        if (selectedHabit === 'active') {
            if (habit.active) completed++
        } else {
            completed++
        }
    }

    return completed / habits.length
}

const Chart = ({ habits, entries, selectedHabit, viewMode, year }) => {
    const dates = getDatesForView(viewMode, year)
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
                {paddedDates.map((date, index) => {
                    if (!date) {
                        return (
                            <div
                                key={`empty-${index}`}
                                className="tile tile--empty"
                            />
                        )
                    }

                    const entry = entries[date] || {}
                    const intensity = calculateIntensity(
                        entry,
                        Object.values(habits),
                        selectedHabit
                    )

                    return (
                        <Tile
                            key={date}
                            date={date}
                            intensity={intensity}
                            entry={entry}
                        />
                    )
                })}
            </div>
        </div>
    )
}

export default Chart
