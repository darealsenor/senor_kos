import * as React from 'react'
import './ChatTags.css'
import usePlayerStore from '../store/PlayerStore'
import { Tag } from '../store/messageStore'
import { fetchNui } from '../utils/fetchNui'
import { useNuiEvent } from '../hooks/useNuiEvent'

const ChatTags: React.FC = () => {
  const { tags, setTags, maxCustomTags } = usePlayerStore()

  useNuiEvent('setTags', (Tags: Tag[]) => {
    setTags({ playerTags: Tags })
  })

  const handleTagToggle = (tag: Tag, event?: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => {
    event?.stopPropagation()
    const isSelected = tags.selectedTags.some(selectedTag => selectedTag.text === tag.text)
    
    let newSelectedTags: Tag[]
    
    if (isSelected) {
      newSelectedTags = tags.selectedTags.filter(selectedTag => selectedTag.text !== tag.text)
    } else {
      if (tags.selectedTags.length >= maxCustomTags) {
        return
      }
      newSelectedTags = [...tags.selectedTags, tag]
    }

    setTags({
      selectedTags: newSelectedTags,
    })

    fetchNui('setSelectedTag', newSelectedTags.length > 0 ? newSelectedTags : null)
  }

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation()
  }

  return (
    <div className="chat-tags-multiselect" onClick={handleClick}>
      {tags.playerTags.map((tag, index) => {
        const isSelected = tags.selectedTags.some(selectedTag => selectedTag.text === tag.text)
        const isDisabled = !isSelected && tags.selectedTags.length >= maxCustomTags
        
        return (
          <label
            key={index}
            className={`chat-tags-checkbox ${isSelected ? 'chat-tags-checkbox--selected' : ''} ${isDisabled ? 'chat-tags-checkbox--disabled' : ''}`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                handleTagToggle(tag, e)
              }}
              disabled={isDisabled}
            />
            <span>{tag.text}</span>
          </label>
        )
      })}
    </div>
  )
}

export default ChatTags
