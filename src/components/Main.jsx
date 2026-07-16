import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FiArchive,
  FiBell,
  FiBellOff,
  FiCheck,
  FiRotateCcw,
  FiSlash,
  FiTrash2,
  FiUpload,
  FiX
} from 'react-icons/fi'
import Chart from './Chart'
import Toolbar from './Toolbar'
import {
  addHabitToData,
  archiveHabit,
  calculateDashboardStats,
  calculateHabitSummaries,
  createInitialData,
  deleteHabit,
  formatPercent,
  getActiveHabits,
  getEntryStatus,
  getHabitsForDate,
  HABIT_COLORS,
  normalizeData,
  restoreHabit,
  STATUS_DONE,
  STATUS_MISSED,
  STATUS_SKIPPED,
  summarizeDate,
  updateHabit,
  updateHabitStatus
} from '../lib/habitData'
import { formatDisplayDate, getTodayKey } from '../lib/dates'
import { exportHabitData, loadHabitData, saveHabitData } from '../lib/storage'
import './css/Main.css'

const getNotificationPermission = () => {
  if (!('Notification' in globalThis)) return 'unsupported'
  return Notification.permission
}

const getNextReminderDelay = (time) => {
  const [hours, minutes] = time.split(':').map(Number)
  const now = new Date()
  const reminder = new Date()
  reminder.setHours(hours, minutes, 0, 0)

  if (reminder <= now) reminder.setDate(reminder.getDate() + 1)
  return reminder.getTime() - now.getTime()
}

const getNotificationLabel = (permission) => {
  if (permission === 'granted') return 'Enabled'
  if (permission === 'denied') return 'Blocked'
  if (permission === 'unsupported') return 'Unavailable'
  return 'Off'
}

const Main = () => {
  const [data, setData] = useState(createInitialData)
  const [loaded, setLoaded] = useState(false)
  const [selectedDate, setSelectedDate] = useState(getTodayKey())
  const [selectedHabitId, setSelectedHabitId] = useState('all')
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitColor, setNewHabitColor] = useState(HABIT_COLORS[0])
  const [storageStatus, setStorageStatus] = useState('Loading')
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission)

  const addHabitRef = useRef(null)
  const remindersRef = useRef(null)
  const fileInputRef = useRef(null)
  const todayKey = getTodayKey()
  const year = new Date().getFullYear()

  const stats = useMemo(() => calculateDashboardStats(data, todayKey), [data, todayKey])
  const habitSummaries = useMemo(() => calculateHabitSummaries(data, todayKey), [data, todayKey])
  const activeHabits = useMemo(() => getActiveHabits(data), [data])
  const selectedDaySummary = useMemo(
    () => summarizeDate(data, selectedDate, selectedHabitId),
    [data, selectedDate, selectedHabitId]
  )
  const selectedDayHabits = useMemo(
    () => getHabitsForDate(data, selectedDate, selectedHabitId),
    [data, selectedDate, selectedHabitId]
  )

  useEffect(() => {
    let mounted = true

    loadHabitData().then((storedData) => {
      if (!mounted) return
      setData(storedData)
      setLoaded(true)
      setStorageStatus('Saved locally')
    })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!loaded) return

    saveHabitData(data)
      .then(() => setStorageStatus('Saved locally'))
      .catch(() => setStorageStatus('Storage unavailable'))
  }, [data, loaded])

  useEffect(() => {
    if (!data.settings.reminderEnabled || notificationPermission !== 'granted') return undefined

    const timer = window.setTimeout(() => {
      const latestStats = calculateDashboardStats(data, getTodayKey())

      if (latestStats.today.total > 0 && latestStats.today.done < latestStats.today.total) {
        new Notification('HabitChart check-in', {
          body: `${latestStats.today.done} of ${latestStats.today.total} habits are complete today.`,
          tag: 'habitchart-daily-check-in'
        })
      }
    }, getNextReminderDelay(data.settings.reminderTime))

    return () => window.clearTimeout(timer)
  }, [data, notificationPermission])

  const updateData = (updater) => {
    setData((current) => normalizeData(typeof updater === 'function' ? updater(current) : updater))
  }

  const handleAddHabit = (event) => {
    event.preventDefault()
    if (!newHabitName.trim()) return

    updateData((current) => addHabitToData(current, newHabitName, { color: newHabitColor }))
    setNewHabitName('')
    setNewHabitColor(HABIT_COLORS[(HABIT_COLORS.indexOf(newHabitColor) + 1) % HABIT_COLORS.length])
  }

  const setStatus = (habitId, status) => {
    updateData((current) => updateHabitStatus(current, todayKey, habitId, status))
  }

  const toggleDone = (habitId) => {
    const currentStatus = getEntryStatus(data, todayKey, habitId)
    setStatus(habitId, currentStatus === STATUS_DONE ? null : STATUS_DONE)
  }

  const handleReminderToggle = async () => {
    if (!data.settings.reminderEnabled && 'Notification' in globalThis) {
      const permission = Notification.permission === 'default'
        ? await Notification.requestPermission()
        : Notification.permission

      setNotificationPermission(permission)
      if (permission !== 'granted') return
    }

    updateData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        reminderEnabled: !current.settings.reminderEnabled
      }
    }))
  }

  const handleExportData = () => {
    const blob = new Blob([exportHabitData(data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `habitchart-backup-${todayKey}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        updateData(normalizeData(JSON.parse(reader.result)))
        setStorageStatus('Backup imported')
      } catch {
        setStorageStatus('Import failed')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <div className="app-shell">
      <Toolbar
        data={data}
        stats={stats}
        selectedHabitId={selectedHabitId}
        onSelectHabit={setSelectedHabitId}
        onExportData={handleExportData}
        onFocusAddHabit={() => addHabitRef.current?.focus()}
        onFocusReminders={() => remindersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
      />

      <main className="dashboard">
        <section className="today-panel" aria-labelledby="today-title">
          <div className="section-heading">
            <div>
              <h2 id="today-title">Today</h2>
              <p>{formatDisplayDate(todayKey)}</p>
            </div>
            <span className="status-pill">{formatPercent(stats.today.rate)}</span>
          </div>

          <form className="add-habit-form" onSubmit={handleAddHabit}>
            <input
              ref={addHabitRef}
              value={newHabitName}
              onChange={(event) => setNewHabitName(event.target.value)}
              placeholder="Add a habit"
              aria-label="Habit name"
            />
            <div className="color-picker" aria-label="Habit color">
              {HABIT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={color === newHabitColor ? 'color-swatch color-swatch--selected' : 'color-swatch'}
                  style={{ '--habit-color': color }}
                  aria-label={`Use ${color}`}
                  onClick={() => setNewHabitColor(color)}
                />
              ))}
            </div>
            <button type="submit" className="primary-button">Add</button>
          </form>

          <div className="habit-checklist">
            {activeHabits.length === 0 && (
              <div className="empty-state">No active habits yet.</div>
            )}

            {activeHabits.map((habit) => {
              const status = getEntryStatus(data, todayKey, habit.id)
              const summary = habitSummaries.find((item) => item.habit.id === habit.id)

              return (
                <article key={habit.id} className={`habit-row habit-row--${status || 'pending'}`}>
                  <button
                    type="button"
                    className="habit-toggle"
                    onClick={() => toggleDone(habit.id)}
                    aria-label={`Toggle ${habit.name}`}
                    style={{ '--habit-color': habit.color }}
                  >
                    {status === STATUS_DONE && <FiCheck aria-hidden="true" />}
                  </button>

                  <div className="habit-main">
                    <strong>{habit.name}</strong>
                    <span>{summary?.currentStreak ?? 0} day streak</span>
                  </div>

                  <div className="habit-actions">
                    <button type="button" onClick={() => setStatus(habit.id, STATUS_SKIPPED)} title="Skip today">
                      <FiSlash aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => setStatus(habit.id, STATUS_MISSED)} title="Mark missed">
                      <FiX aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => updateData((current) => archiveHabit(current, habit.id))} title="Archive habit">
                      <FiArchive aria-hidden="true" />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <Chart
          data={data}
          year={year}
          selectedHabitId={selectedHabitId}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <aside className="insight-column">
          <section className="metric-panel" aria-labelledby="metrics-title">
            <div className="section-heading">
              <div>
                <h2 id="metrics-title">Metrics</h2>
                <p>{stats.completionsTotal} total completions</p>
              </div>
            </div>

            <div className="metric-grid">
              <div><span>{stats.currentStreak}</span><small>Current streak</small></div>
              <div><span>{stats.longestStreak}</span><small>Longest streak</small></div>
              <div><span>{formatPercent(stats.rate7)}</span><small>7 days</small></div>
              <div><span>{formatPercent(stats.rate30)}</span><small>30 days</small></div>
            </div>

            <div className="best-day">
              <span>Best day</span>
              <strong>{stats.bestWeekday ? `${stats.bestWeekday.label} ${formatPercent(stats.bestWeekday.rate)}` : 'No data'}</strong>
            </div>
          </section>

          <section ref={remindersRef} className="reminder-panel" aria-labelledby="reminders-title">
            <div className="section-heading">
              <div>
                <h2 id="reminders-title">Reminder</h2>
                <p>{getNotificationLabel(notificationPermission)}</p>
              </div>
              <button type="button" className="icon-button" onClick={handleReminderToggle}>
                {data.settings.reminderEnabled ? <FiBell aria-hidden="true" /> : <FiBellOff aria-hidden="true" />}
              </button>
            </div>

            <label className="field-label">
              <span>Daily time</span>
              <input
                type="time"
                value={data.settings.reminderTime}
                onChange={(event) => updateData((current) => ({
                  ...current,
                  settings: { ...current.settings, reminderTime: event.target.value }
                }))}
              />
            </label>
          </section>
        </aside>
      </main>

      <section className="lower-grid">
        <section className="day-detail-panel" aria-labelledby="selected-day-title">
          <div className="section-heading">
            <div>
              <h2 id="selected-day-title">{formatDisplayDate(selectedDate)}</h2>
              <p>{selectedDaySummary.done} of {selectedDaySummary.total} completed</p>
            </div>
            <span className="status-pill">{formatPercent(selectedDaySummary.rate)}</span>
          </div>

          <div className="day-detail-list">
            {selectedDayHabits.length === 0 && <div className="empty-state">No habits counted for this date.</div>}
            {selectedDayHabits.map((habit) => {
              const status = getEntryStatus(data, selectedDate, habit.id) || 'pending'

              return (
                <div key={habit.id} className="day-detail-row">
                  <span className="habit-dot" style={{ '--habit-color': habit.color }} />
                  <span>{habit.name}</span>
                  <strong>{status}</strong>
                </div>
              )
            })}
          </div>
        </section>

        <section className="manage-panel" aria-labelledby="manage-title">
          <div className="section-heading">
            <div>
              <h2 id="manage-title">Habits</h2>
              <p>{stats.activeHabits} active, {stats.archivedHabits} archived</p>
            </div>
          </div>

          <div className="habit-management-list">
            {habitSummaries.map(({ habit, currentStreak, longestStreak, rate30 }) => (
              <article key={habit.id} className={habit.active ? 'manage-row' : 'manage-row manage-row--archived'}>
                <span className="habit-dot" style={{ '--habit-color': habit.color }} />
                <input
                  value={habit.name}
                  aria-label={`Rename ${habit.name}`}
                  onChange={(event) => updateData((current) => updateHabit(current, habit.id, { name: event.target.value }))}
                />
                <span>{currentStreak}/{longestStreak} streak</span>
                <span>{formatPercent(rate30)}</span>
                {habit.active ? (
                  <button type="button" onClick={() => updateData((current) => archiveHabit(current, habit.id))} title="Archive habit">
                    <FiArchive aria-hidden="true" />
                  </button>
                ) : (
                  <button type="button" onClick={() => updateData((current) => restoreHabit(current, habit.id))} title="Restore habit">
                    <FiRotateCcw aria-hidden="true" />
                  </button>
                )}
                {!habit.active && (
                  <button type="button" onClick={() => updateData((current) => deleteHabit(current, habit.id))} title="Delete habit">
                    <FiTrash2 aria-hidden="true" />
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="backup-panel" aria-labelledby="backup-title">
          <div className="section-heading">
            <div>
              <h2 id="backup-title">Backup</h2>
              <p>{storageStatus}</p>
            </div>
          </div>

          <div className="backup-actions">
            <button type="button" onClick={handleExportData}>Export JSON</button>
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              <FiUpload aria-hidden="true" />
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportData}
            />
          </div>
        </section>
      </section>
    </div>
  )
}

export default Main
