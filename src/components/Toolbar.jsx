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

            <button onClick={onAddHabit}>+</button>
            <button onClick={onRemoveHabit} disabled={selectedHabit === 'all' || selectedHabit === "active"}>
                -
            </button>

            <button onClick={onAddProgress}>Add Progress</button>

            <select
                value={viewMode}
                onChange={e => onChangeView(e.target.value)}
            >
                <option value="year">Year</option>
                <option value="month">Month</option>
                <option value="week">Week</option>
            </select>

            <button onClick={onDeleteAllData}>Delete all data</button>
        </div>
    )
}

export default Toolbar
