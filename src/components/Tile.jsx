import './css/Tile.css'

const Tile = ({ intensity, date }) => {
    const green = Math.round(255 * intensity)

    return (
        <div
            className="tile"
            title={date}
            style={{
                backgroundColor: `rgb(0, ${green}, 0)`
            }}
        />
    )
}

export default Tile
