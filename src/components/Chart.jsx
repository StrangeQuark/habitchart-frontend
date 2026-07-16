import { getMonthLabelForWeek, getYearWeeks, WEEKDAY_LABELS } from '../lib/dates'
import { getIntensityLevel, summarizeDate } from '../lib/habitData'
import Tile from './Tile'
import './css/Chart.css'

const Chart = ({
  data,
  year,
  selectedHabitId,
  selectedDate,
  onSelectDate
}) => {
  const weeks = getYearWeeks(year, data.settings.weekStartsOn)

  return (
    <section className="chart-panel" aria-labelledby="chart-title">
      <div className="section-heading">
        <div>
          <h2 id="chart-title">Contribution Chart</h2>
          <p>{year}</p>
        </div>
        <div className="chart-legend" aria-label="Completion intensity legend">
          <span>Less</span>
          {[0, 1, 2, 3, 4, 5].map((level) => (
            <span key={level} className={`legend-swatch tile--level-${level}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="chart-scroll" role="region" aria-label={`${year} habit completion chart`}>
        <div className="month-row" style={{ gridTemplateColumns: `repeat(${weeks.length}, var(--tile-size))` }}>
          {weeks.map((week) => (
            <span key={week[0].key}>{getMonthLabelForWeek(week)}</span>
          ))}
        </div>

        <div className="chart-body">
          <div className="weekday-column">
            {WEEKDAY_LABELS.map((weekday, index) => (
              <span key={weekday}>{index % 2 === 1 ? weekday : ''}</span>
            ))}
          </div>

          <div className="year-grid" style={{ gridTemplateColumns: `repeat(${weeks.length}, var(--tile-size))` }}>
            {weeks.flatMap((week) =>
              week.map(({ key, inYear }) => {
                const summary = summarizeDate(data, key, selectedHabitId)
                const level = inYear ? getIntensityLevel(summary.rate) : 0

                return (
                  <Tile
                    key={key}
                    dateKey={key}
                    summary={summary}
                    level={level}
                    selected={key === selectedDate}
                    disabled={!inYear}
                    onSelect={onSelectDate}
                  />
                )
              })
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Chart
