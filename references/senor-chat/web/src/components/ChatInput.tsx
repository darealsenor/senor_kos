import React, { useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './chatInput.css'
import inputStore from '../store/inputStore'
import messageStore, { generateMessages } from '../store/messageStore'
import { _Audio } from '../hooks/useAudio'
import useSuggestionStore from '../store/suggestionStore'
import Suggestions from './Suggestions'
import { fetchNui } from '../utils/fetchNui'
import { useNuiEvent } from '../hooks/useNuiEvent'
import ChannelStore from '../store/channelsStore'
import { handleHistoryMessage, isEnvBrowser } from '../utils/misc'
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'
import playerStore from '../store/PlayerStore'
import { debugData } from '../utils/debugData'
import { useVisibility } from '../providers/VisibilityProvider'
import useSettingsStore from '../store/settingsStore'
import { useChannelName } from '../utils/channelUtils'
import { Channel } from '../store/channelsStore'

const ChannelDropdownItem = ({ channel, isSelected, onClick }: { channel: Channel, isSelected: boolean, onClick: () => void }) => {
  const name = useChannelName(channel.id)
  return (
    <div
      className={`InputContainer__channel-dropdown-item ${isSelected ? 'InputContainer__channel-dropdown-item--selected' : ''}`}
      onClick={onClick}
    >
      {name} {(channel.unread ?? 0) > 0 ? `(${channel.unread! < 99 ? channel.unread : '99+'})` : ''}
    </div>
  )
}

const ChannelDropdownInline = () => {
  const { currentChannel, availableChannels, setChannel } = ChannelStore()
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLDivElement | null>(null)
  const channelName = useChannelName(currentChannel?.id || 0)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  const handleChannelClick = (channelId: number) => {
    setChannel(channelId)
    setIsOpen(false)
    if (!isEnvBrowser()) {
      fetchNui('setChannel', channelId).catch(() => {})
    }
  }

  if (!currentChannel) return null

  return (
    <div className="InputContainer__channels-inline-wrapper">
      <div
        ref={buttonRef}
        className="InputContainer__channel-inline InputContainer__channel-inline--selected"
        onClick={() => setIsOpen(!isOpen)}
      >
        {channelName} {(currentChannel.unread ?? 0) > 0 ? `(${currentChannel.unread! < 99 ? currentChannel.unread : '99+'})` : ''}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="InputContainer__channels-dropdown"
          >
            {Object.values(availableChannels).map((channel: Channel) => (
              <ChannelDropdownItem
                key={channel.id}
                channel={channel}
                isSelected={channel.id === currentChannel.id}
                onClick={() => handleChannelClick(channel.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

debugData([
  {
    action: 'setVisible',
    data: {
      box: true,
      input: true,
    },
  },
])

// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return `rgba(13, 119, 217, ${alpha})` // Default fallback
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const ChatInput = () => {
  const { input, setInput, setInputRef, emojis, setEmojis } = inputStore()
  const { addMessage, sentMessages, sentMessagesIndex, addSentMessage, setMessageIndex } = messageStore()
  const { setSuggestions, suggestions, setSuggestionIndex } = useSuggestionStore()
  const { currentChannel } = ChannelStore()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const inputContainerRef = useRef<HTMLDivElement | null>(null)
  const emojiButtonRef = useRef<HTMLAnchorElement | null>(null)
  const { setEditMode } = playerStore()
  const { settings } = useSettingsStore()
  const { visible, setVisible } = useVisibility()
  const channelName = useChannelName(currentChannel?.id ?? 0)

  const colors = useMemo(() => {
    const main = settings.mainColor?.color || '#0D77D9'
    return {
      mainColor: main,
      emojiBgColor: hexToRgba(main, 0.1),
      emojiBgColorHover: hexToRgba(main, 0.2),
      settingsBgColor: hexToRgba(main, 0.1),
      settingsBgColorHover: hexToRgba(main, 0.2),
    }
  }, [settings.mainColor?.color])

  // Reset indices when input becomes visible
  useEffect(() => {
    if (visible.input) {
      setMessageIndex(-1)
      setSuggestionIndex(-1)
    }
  }, [visible.input, setMessageIndex, setSuggestionIndex])

  // Set cursor to end when input changes (for history navigation only)
  useEffect(() => {
    if (inputRef.current && sentMessagesIndex >= 0) {
      // Only reposition cursor when navigating history, not during regular typing
      setTimeout(() => {
        if (inputRef.current) {
          const length = input.length
          inputRef.current.setSelectionRange(length, length)
          inputRef.current.focus()
        }
      }, 0)
    }
  }, [input, sentMessagesIndex])

  useEffect(() => {
    if (input.length === 0) {
      setSuggestions(false)
    }
  }, [input, setSuggestions])

  // Auto-show suggestions when they become available and user is typing a command
  useEffect(() => {
    if (input.startsWith('/') && !suggestions) {
      const currentState = useSuggestionStore.getState()
      if (currentState && currentState.suggestions && currentState.suggestions.length > 0) {
        setSuggestions(true)
      }
    }
  }, [input, suggestions, setSuggestions])

  // Key handlers moved to VisibilityProvider.tsx for centralized key management
  // Only keeping T key handler for browser testing
  useEffect(() => {
    if (!isEnvBrowser()) return

    const keyHandler = (e: KeyboardEvent) => {
      if (['KeyT'].includes(e.code) && !visible.input) {
        setVisible({ input: true, box: true })
      }
    }

    window.addEventListener('keydown', keyHandler)
    return () => window.removeEventListener('keydown', keyHandler)
  }, [visible, setVisible])

  useEffect(() => {
    setInputRef(inputRef)
  }, [setInputRef])

  useEffect(() => {
    if (visible.input && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [visible.input, currentChannel])

  // useEffect(() => {
  //   if (isEnvBrowser()) {
  //     setInterval(() => {
  //       // if (!visible) setVisible(!visible)
  //       const msg = generateMessages(1)
  //       msg[0].message = 'message'
  //       addMessage(msg[0])
  //     }, 2000)
  //   }
  // }, [])


  const handleMessage = async () => {
    if (input.length <= 0) return
    if (!currentChannel) return
    fetchNui('sendMessage', {
      message: input,
      channel: currentChannel,
    })

    if (isEnvBrowser()) {
      const msg = generateMessages(1, currentChannel)
      msg[0].message = input
      addMessage(msg[0])
    }

    addSentMessage(input)
    setInput('')
    
    setVisible({ input: false, box: true })
    fetchNui('hideInput')
  }

  const handleSend = () => {
    handleMessage()
  }

  const soundTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInput(val)
    setSuggestionIndex(-1)

    if (settings.soundOnType && val.length > 0) {
      if (soundTimeoutRef.current) clearTimeout(soundTimeoutRef.current)
      soundTimeoutRef.current = setTimeout(() => _Audio('./writing.mp3'), 50)
    }

    if (val.startsWith('/')) {
      const state = useSuggestionStore.getState()
      if (state?.suggestions?.length > 0) {
        setSuggestions(true)
      }
    } else if (suggestions) {
      setSuggestions(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleMessage()
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = sentMessagesIndex === -1 ? sentMessages.length - 1 : sentMessagesIndex - 1
      const msg = handleHistoryMessage(sentMessages, true, idx)

      if (msg) {
        setMessageIndex(idx)
        setInput(msg)
        setTimeout(() => {
          if (inputRef.current) {
            const len = msg.length
            inputRef.current.setSelectionRange(len, len)
            inputRef.current.focus()
          }
        }, 0)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = sentMessagesIndex + 1
      const msg = handleHistoryMessage(sentMessages, false, idx)

      if (msg) {
        setMessageIndex(idx)
        setInput(msg)
        setTimeout(() => {
          if (inputRef.current) {
            const len = msg.length
            inputRef.current.setSelectionRange(len, len)
            inputRef.current.focus()
          }
        }, 0)
      } else {
        setMessageIndex(-1)
        setInput('')
      }
    }
  }

  useNuiEvent('setVisible', (data: { input?: boolean; box?: boolean }) => {
    setVisible({ ...data })
    if (data && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  })

  if (isEnvBrowser()) {
    // @ts-expect-error: window funcs
    window.setVisible = setVisible
  }

  const handleEmojis = () => {
    setEmojis(!emojis)
  }

  useEffect(() => {
    if (!emojis && visible.input && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [emojis, visible.input])

  const addEmojiToInput = (emoji: EmojiClickData) => {
    setInput(input + emoji.emoji)
  }

  // Simplified emoji picker positioning - relative to emoji button
  const [emojiPickerStyle, setEmojiPickerStyle] = React.useState<React.CSSProperties>({
    position: 'fixed',
    zIndex: 1000,
  })

  // Update emoji picker position when emoji opens
  useEffect(() => {
    if (!emojis || !emojiButtonRef.current) return

    const updatePosition = () => {
      const button = emojiButtonRef.current
      if (!button) return

      const buttonRect = button.getBoundingClientRect()
      const chatLocation = settings.chatLocation || 'left-bottom'
      const isLeft = chatLocation.startsWith('left')
      const isRight = chatLocation.startsWith('right')
      
      // Emoji picker dimensions
      const emojiPickerHeight = 435
      const emojiPickerWidth = 352
      const gap = 12
      
      // Determine horizontal position
      let left: number | undefined
      let right: number | undefined
      
      if (isLeft) {
        // Chat on left, picker to the right of button
        left = buttonRect.right + gap
        // Ensure it doesn't go off-screen
        if (left + emojiPickerWidth > window.innerWidth - 10) {
          left = window.innerWidth - emojiPickerWidth - 10
        }
      } else if (isRight) {
        // Chat on right, picker to the left of button
        right = window.innerWidth - buttonRect.left + gap
        // Ensure it doesn't go off-screen
        if (right + emojiPickerWidth > window.innerWidth - 10) {
          right = window.innerWidth - emojiPickerWidth - 10
        }
      } else {
        // Center positions - try right first, fallback to left
        const rightSpace = window.innerWidth - buttonRect.right
        if (rightSpace >= emojiPickerWidth + gap + 10) {
          left = buttonRect.right + gap
        } else {
          left = buttonRect.left - emojiPickerWidth - gap
          if (left < 10) {
            left = 10
          }
        }
      }
      
      // Determine vertical position - align with button
      let top = buttonRect.top
      // Ensure it doesn't go off-screen vertically
      if (top + emojiPickerHeight > window.innerHeight - 10) {
        top = window.innerHeight - emojiPickerHeight - 10
      }
      if (top < 10) {
        top = 10
      }
      
      setEmojiPickerStyle({
        position: 'fixed',
        ...(left !== undefined && { left: `${left}px` }),
        ...(right !== undefined && { right: `${right}px` }),
        top: `${top}px`,
        zIndex: 1000,
      })
    }

    const timeoutId = setTimeout(updatePosition, 50)
    window.addEventListener('resize', updatePosition)
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updatePosition)
    }
  }, [emojis, settings.chatLocation, visible.input])

  const handleEditMode = () => {
    setEditMode(true)
  }

  return (
    <AnimatePresence>
      {visible.input && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{ position: 'relative' }}
        >
          <div className="InputContainer" ref={inputContainerRef}>
              <a 
                className="InputContainer__input--buttons__send" 
                onClick={handleSend}
                style={{ backgroundColor: colors.mainColor }}
              >
                <img
                  src="./message.svg"
                  alt=""
                  className="InputContainer__input--buttons__svg InputContainer__input--buttons__svg--inverse"
                />
              </a>
              {settings.channels && settings.channelsMode === 'inline' && currentChannel && (
                <ChannelDropdownInline />
              )}
              <input
                className="InputContainer__input"
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={currentChannel ? "Type here..." : "No channels available"}
                maxLength={100}
                ref={inputRef}
                disabled={!currentChannel}
                style={{
                  marginLeft: settings.channels && settings.channelsMode === 'inline' ? '8px' : '44px',
                  marginRight: '66px'
                }}
              />
              {settings.emojis && (
                <a 
                  ref={emojiButtonRef}
                  className="InputContainer__input--buttons__emojis" 
                  onClick={handleEmojis}
                  style={{ backgroundColor: colors.emojiBgColor }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.emojiBgColorHover
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.emojiBgColor
                  }}
                >
                  <img src="./emojis.png" alt="" className="InputContainer__input--buttons__svg" />
                </a>
              )}
              <a 
                className="InputContainer__input--buttons__settings" 
                onClick={handleEditMode}
                style={{ backgroundColor: colors.settingsBgColor }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.settingsBgColorHover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.settingsBgColor
                }}
              >
                <img
                  src="./settings.svg"
                  alt=""
                  className="InputContainer__input--buttons__svg InputContainer__input--buttons__svg--inverse"
                />
              </a>
            </div>
          <EmojiPicker 
            open={emojis} 
            onEmojiClick={addEmojiToInput} 
            theme={Theme.DARK} 
            className="emojiPicker"
            style={emojiPickerStyle}
          />
          <Suggestions />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ChatInput
