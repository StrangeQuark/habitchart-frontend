import { FiBell, FiDownload, FiPlus } from 'react-icons/fi'
import { getActiveHabits } from '../lib/habitData'
import './css/Toolbar.css'

const Toolbar = ({
  data,
  stats,
  selectedHabitId,
  onSelectHabit,
  onExportData,
  onFocusAddHabit,
  onFocusReminders
}) => {
  const activeHabits = getActiveHabits(data)

  return (
    <header className="toolbar">
      <div className="brand-block">
        <div className="brand-mark" aria-hidden="true">HC</div>
        <div>
          <h1>HabitChart</h1>
          <p>{stats.today.done} of {stats.today.total} habits completed today</p>
        </div>
      </div>

      <div className="toolbar-controls">
        <label className="select-label">
          <span>Chart</span>
          <select value={selectedHabitId} onChange={(event) => onSelectHabit(event.target.value)}>
            <option value="all">All habits</option>
            {activeHabits.map((habit) => (
              <option key={habit.id} value={habit.id}>{habit.name}</option>
            ))}
          </select>
        </label>

        <button type="button" className="icon-button" onClick={onFocusReminders} title="Reminder settings">
          <FiBell aria-hidden="true" />
        </button>
        <button type="button" className="icon-button" onClick={onExportData} title="Export backup">
          <FiDownload aria-hidden="true" />
        </button>
        <button type="button" className="primary-button" onClick={onFocusAddHabit}>
          <FiPlus aria-hidden="true" />
          Add Habit
        </button>
      </div>
    </header>
  )
}

export default Toolbar
