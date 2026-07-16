import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import Chart from './Chart'
import { addHabitToData, createInitialData, STATUS_DONE, updateHabitStatus } from '../lib/habitData'

describe('Chart', () => {
  it('renders accessible contribution tiles for the selected year', () => {
    let data = createInitialData()
    data = addHabitToData(data, 'Read', {
      id: 'read',
      createdAt: '2026-01-01'
    })
    data = updateHabitStatus(data, '2026-01-01', 'read', STATUS_DONE)

    render(
      <Chart
        data={data}
        year={2026}
        selectedHabitId="all"
        selectedDate="2026-01-01"
        onSelectDate={() => {}}
      />
    )

    expect(screen.getByRole('button', { name: '2026-01-01: 1/1 completed' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '2026 habit completion chart' })).toBeInTheDocument()
  })
})
