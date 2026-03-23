import * as React from 'react'
import './ChatTags.css'
import usePlayerStore from '../store/PlayerStore'
import { Color } from '../store/messageStore'
import { useNuiEvent } from '../hooks/useNuiEvent'
import { fetchNui } from '../utils/fetchNui'
import { useLocale } from '../providers/LocaleProvider'

const ChatColors: React.FC = () => {
  const { colors, setColors } = usePlayerStore()
  const { t } = useLocale()

  useNuiEvent('setColors', (Colors: Color[]) => {
    setColors({ playerColors: Colors })
  })

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value
    event.stopPropagation()
    
    if (selectedValue === '') {
      setColors({
        selectedColors: null,
      })
      fetchNui('setSelectedColor', null)
      return
    }
    
    const selectedColor = colors.playerColors.find((color) => color.name === selectedValue)
    if (!selectedColor) return

    setColors({
      selectedColors: selectedColor,
    })

    fetchNui('setSelectedColor', selectedColor)
  }

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation()
  }

  return (
    <div className="chat-colors-dropdown" onClick={handleClick}>
      <select 
        className="chat-colors-select"
        value={colors.selectedColors?.name || ''}
        onChange={handleSelect}
        onClick={handleClick}
      >
        <option value="">{t('ui_none')}</option>
        {colors.playerColors.map((color, index) => (
          <option key={index} value={color.name} style={{ color: color.color }}>
            {color.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ChatColors
