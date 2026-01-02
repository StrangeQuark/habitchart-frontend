import Tile from './Tile'
import './css/Chart.css'

const getDatesForView = (viewMode, year) => {
    const dates = []
    const now = new Date()

    // Anchor to local midnight
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
        // Week view — Sunday start (0 = Sunday)
        const dayOfWeek = today.getDay()
        start = new Date(today)
        start.setDate(today.getDate() - dayOfWeek)

        end = new Date(start)
        end.setDate(start.getDate() + 6)
    }

    const current = new Date(start)
    while (current <= end) {
        dates.push(
            [
                current.getFullYear(),
                String(current.getMonth() + 1).padStart(2, '0'),
                String(current.getDate()).padStart(2, '0')
            ].join('-')
        )
        current.setDate(current.getDate() + 1)
    }

    return dates
}


const calculateIntensity = (entry, habits, selectedHabit) => {
    if (habits.length === 0) return 0

    if (selectedHabit !== 'all' && selectedHabit !== 'active') {
        return entry[selectedHabit] ? 1 : 0
    }

    let completed = 0
    for (const habit of habits) {
        if (entry[habit.id]) {
            if(selectedHabit === 'active') {
                if(habit.active)
                    completed++
            } else {
                completed++
            }
        }
    }

    return completed / habits.length
}

const Chart = ({ habits, entries, selectedHabit, viewMode, year }) => {
    const dates = getDatesForView(viewMode, year)

    return (
        <div className="chart">
            {dates.map(date => {
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
    )
}

export default Chart
