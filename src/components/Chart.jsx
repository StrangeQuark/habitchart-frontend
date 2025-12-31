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


const calculateIntensity = (entry, activeHabits, selectedHabit) => {
    if (selectedHabit !== 'all') {
        return entry[selectedHabit] ? 1 : 0
    }

    if (activeHabits.length === 0) return 0

    let completed = 0
    for (const habit of activeHabits) {
        if (entry[habit.id]) completed++
    }

    return completed / activeHabits.length
}

const Chart = ({ habits, entries, selectedHabit, viewMode, year }) => {
    const activeHabits = Object.values(habits).filter(h => h.active)
    const dates = getDatesForView(viewMode, year)

    return (
        <div className="chart">
            {dates.map(date => {
                const entry = entries[date] || {}
                const intensity = calculateIntensity(
                    entry,
                    activeHabits,
                    selectedHabit
                )

                return (
                    <Tile
                        key={date}
                        date={date}
                        intensity={intensity}
                    />
                )
            })}
        </div>
    )
}

export default Chart
