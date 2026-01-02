import './css/Tile.css'

const Tile = ({ intensity, date, entry }) => {
    const green = Math.round(255 * intensity)

    let title = date

    if (entry && typeof entry === 'object') {
        const lines = Object.values(entry).map(habit => {
            const name = habit?.name ?? 'Unknown'
            const completed = habit?.completed ? 'Completed' : 'Not completed'
            return `${name}: ${completed}`
        })

        title = `${date}\n${lines.join('\n')}`
    }

    return (
        <div
            className="tile"
            title={title}
            style={{
                backgroundColor: `rgb(0, ${green}, 0)`
            }}
        />
    )
}

export default Tile
