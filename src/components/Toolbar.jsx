import './css/Toolbar.css'

const Toolbar = ({
    habits,
    selectedHabit,
    onSelectHabit,
    onAddHabit,
    onRemoveHabit,
    onAddProgress,
    viewMode,
    onChangeView,
    onDeleteAllData
}) => {
    const activeHabits = Object.values(habits).filter(h => h.active)

    return (
        <div className="toolbar">
            <div className='left-toolbar-div'>
                <select
                    value={selectedHabit}
                    onChange={e => onSelectHabit(e.target.value)}
                >
                    <option value="all">All habits</option>
                    <option value="active">Active habits</option>
                    {activeHabits.map(h => (
                        <option key={h.id} value={h.id}>
                            {h.name}
                        </option>
                    ))}
                </select>
                <button onClick={onAddHabit}>Add habit</button>
                <button onClick={onRemoveHabit} disabled={selectedHabit === 'all' || selectedHabit === "active"}>Remove habit</button>
                <button onClick={onAddProgress}>Add Progress</button>
            </div>

            <select
                value={viewMode}
                onChange={e => onChangeView(e.target.value)}
                className='view-mode-select'
            >
                <option value="year">Year</option>
                <option value="year-calendar">Year (Calendar)</option>
                <option value="month">Month</option>
                <option value="week">Week</option>
            </select>

            <button onClick={onDeleteAllData}>Delete all data</button>
        </div>
    )
}

export default Toolbar
