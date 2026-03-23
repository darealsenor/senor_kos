import React, { useState } from 'react'
import { GithubPicker } from 'react-color'

const fivemBlipColors = [
  { hex: '#FFFFFF', fivemId: 0 },   // White
  { hex: '#FF0000', fivemId: 1 },   // Red
  { hex: '#00FF00', fivemId: 2 },   // Green
  { hex: '#0000FF', fivemId: 42 },   // Blue
  { hex: '#FFFF00', fivemId: 33 },   // Yellow
  { hex: '#FF00FF', fivemId: 27 },   // Magenta (Sometimes used by specific groups)
  { hex: '#00FFFF', fivemId: 3 },   // Cyan
  { hex: '#808080', fivemId: 39 },   // Gray
  { hex: '#FFA500', fivemId: 17 },  // Orange (Used by some gangs, or for highlighting)
  { hex: '#A52A2A', fivemId: 56 },  // Brown (Used by some gangs, or for specific roles)
  { hex: '#9932CC', fivemId: 58 },  // Dark Orchid (Purple)
];

function ColorPicker({ defaultColor, onColorChange }) {
  const [displayColorPicker, setDisplayColorPicker] = useState(false)
  const [color, setColor] = useState(defaultColor)

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker)
  }

  const handleClose = () => {
    setDisplayColorPicker(false)
  }

  const handleChange = (newColor) => {
    const hex = newColor.hex.toLowerCase()
    setColor(hex)

    const selectedColor = fivemBlipColors.find((c) => c.hex.toLowerCase() === hex)

    if (selectedColor) {
      onColorChange({ hex: hex, fivemId: selectedColor.fivemId })
    }
  }

  return (
    <div className="relative flex justify-center items-center">
      <div
        className="rounded cursor-pointer shadow-md inline-block"
        style={{
          width: '4.5rem',
          height: '1.3rem',
          border: '1px solid rgba(255, 255, 255, 1)',
          backgroundColor: color,
        }}
        onClick={handleClick}
      ></div>
      {displayColorPicker && (
        <div style={{ position: 'absolute', zIndex: '2', top: '2rem' }}>
          <div
            style={{ position: 'fixed', top: '0px', right: '0px', bottom: '0px', left: '0px' }}
            onClick={handleClose}
          />
          <GithubPicker
            color={color}
            onChange={handleChange}
            triangle="hide"
            colors={fivemBlipColors.map((c) => c.hex)}
          />
        </div>
      )}
    </div>
  )
}

export default ColorPicker
