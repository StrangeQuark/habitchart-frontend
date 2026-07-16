import './css/Tile.css'

const Tile = ({ dateKey, summary, level, selected, disabled, onSelect }) => {
  const title = summary.total
    ? `${dateKey}: ${summary.done}/${summary.total} completed`
    : `${dateKey}: no active habits`

  return (
    <button
      type="button"
      className={`tile tile--level-${level}${selected ? ' tile--selected' : ''}`}
      title={title}
      aria-label={title}
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onSelect(dateKey)}
    />
  )
}

export default Tile
