import { useEffect, useState } from 'react'
import Toolbar from './Toolbar'
import Chart from './Chart'
import './css/Main.css'

const STORAGE_KEY = 'habit-tracker:data'

const emptyData = {
    habits: {},
    entries: {}
}

const localDateKey = (date = new Date()) => {
    const local = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    )

    return [
        local.getFullYear(),
        String(local.getMonth() + 1).padStart(2, '0'),
        String(local.getDate()).padStart(2, '0')
    ].join('-')
}

const todayKey = () => localDateKey()

const Main = () => {
    const [data, setData] = useState(emptyData)
    const [selectedHabit, setSelectedHabit] = useState('active')
    const [viewMode, setViewMode] = useState('year')
    const [showProgressPopup, setShowProgressPopup] = useState(false)
    const [progressDraft, setProgressDraft] = useState({})

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) setData(JSON.parse(stored))
    }, [])

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }, [data])

    const addHabit = () => {
        const name = prompt('Habit name')
        if (!name) return

        const id = name.toLowerCase().replace(/\s+/g, '-')

        setData(prev => ({
            ...prev,
            habits: {
                ...prev.habits,
                [id]: {
                    id,
                    name,
                    active: true,
                    createdAt: new Date().toISOString()
                }
            }
        }))
    }

    const removeHabit = () => {
        if (selectedHabit === 'all') return

        setData(prev => ({
            ...prev,
            habits: {
                ...prev.habits,
                [selectedHabit]: {
                    ...prev.habits[selectedHabit],
                    active: false,
                    removedAt: new Date().toISOString()
                }
            }
        }))

        setSelectedHabit('all')
    }

    const openProgressPopup = () => {
        const today = todayKey()
        const existing = data.entries[today] || {}

        const draft = {}
        Object.values(data.habits)
            .filter(h => h.active)
            .forEach(h => {
                draft[h.id] = !!existing[h.id]
            })

        setProgressDraft(draft)
        setShowProgressPopup(true)
    }

    const saveProgress = () => {
        const today = todayKey()

        setData(prev => ({
            ...prev,
            entries: {
                ...prev.entries,
                [today]: {
                    ...(prev.entries[today] || {}),
                    ...progressDraft
                }
            }
        }))

        setShowProgressPopup(false)
    }

    const deleteAllData = () => {
        if(confirm("Delete all data? This action cannot be undone!"))
            setData(emptyData)
    }

    return (
        <div className="main">
            <Toolbar
                habits={data.habits}
                selectedHabit={selectedHabit}
                onSelectHabit={setSelectedHabit}
                onAddHabit={addHabit}
                onRemoveHabit={removeHabit}
                onAddProgress={openProgressPopup}
                viewMode={viewMode}
                onChangeView={setViewMode}
                onDeleteAllData={deleteAllData}
            />

            <Chart
                habits={data.habits}
                entries={data.entries}
                selectedHabit={selectedHabit}
                viewMode={viewMode}
                year={new Date().getFullYear()}
            />

            {showProgressPopup && (
                <div className="popup-backdrop">
                    <div className="popup">
                        <h3>Today's Progress</h3>

                        {Object.values(data.habits)
                            .filter(h => h.active)
                            .map(habit => (
                                <label key={habit.id}>
                                    <input
                                        type="checkbox"
                                        checked={progressDraft[habit.id] || false}
                                        onChange={e =>
                                            setProgressDraft(prev => ({
                                                ...prev,
                                                [habit.id]: e.target.checked
                                            }))
                                        }
                                    />
                                    {habit.name}
                                </label>
                            ))}

                        <div className="popup-actions">
                            <button onClick={saveProgress}>Save</button>
                            <button onClick={() => setShowProgressPopup(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Main
