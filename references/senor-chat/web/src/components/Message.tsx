import React, { useState } from 'react'
import messageStore, { MessageType, Tag as TagType } from '../store/messageStore'
import Tag from './Tag'
import playerStore from '../store/PlayerStore'
import useSettingsStore from '../store/settingsStore'
import * as ContextMenu from '@radix-ui/react-context-menu'
import './Context.css'
import { setClipboard } from '../utils/setClipboard'
import { fetchNui } from '../utils/fetchNui'
import { useNuiEvent } from '../hooks/useNuiEvent'
import useMuteModalStore from '../store/muteModalStore'

const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const Message = (props: MessageType) => {
  const { playerId, Admin, permissions } = playerStore()
  const { settings } = useSettingsStore()
  const { openModal } = useMuteModalStore()
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const { removeMessageById } = messageStore()
  const myMesssage = props.senderId === playerId
  const canDeleteMessage = permissions?.deleteMessage || false
  const canMutePlayer = permissions?.mutePlayer || false
  const canUnmutePlayer = permissions?.unmutePlayer || false

  const getBorderColor = () => {
    if (myMesssage) {
      if (settings.chatColors && props.color?.color) {
        return props.color.color
      }
      if (settings.mainColor?.color) {
        return settings.mainColor.color
      }
      return '#0D77D9'
    }
    return 'rgba(255, 255, 255, 0.15)'
  }

  const handleDeleteMessage = () => {
    fetchNui('deleteMessageById', { id: props.id, channel: props.channel })
  }

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  // Only reset loading state when picture URL actually changes
  React.useEffect(() => {
    // Check if image is already loaded in cache
    const img = new Image()
    img.onload = () => {
      setImageLoading(false)
      setImageError(false)
    }
    img.onerror = () => {
      setImageError(true)
      setImageLoading(false)
    }
    img.src = props.picture

    // Cleanup function
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [props.picture]) // Only depend on picture URL

  useNuiEvent('DeleteMessageById', (id: number) => {
    removeMessageById(id)
  })

  const renderName = () => {
    const mainColor = settings.mainColor?.color || '#0D77D9'
    return (
      <Tag
        bgColor={settings.chatColors && props.color?.bgColor ? props.color.bgColor : hexToRgba(mainColor, 0.1)}
        color={settings.chatColors && props.color?.color ? props.color.color : mainColor}
        text={`${props.sender}`}
        fontWeight={500}
      />
    )
  }

  const parseFiveMColors = (text: string): React.ReactNode[] => {
    const colorMap: { [key: string]: string } = {
      '0': '#ffffff',
      '1': '#ff0000',
      '2': '#00ff00',
      '3': '#ffff00',
      '4': '#0000ff',
      '5': '#00ffff',
      '6': '#ff00ff',
      '7': '#ffffff',
      '8': '#800000',
      '9': '#808080'
    }

    const parts: React.ReactNode[] = []
    let currentColor = '#ffffff'
    let currentText = ''
    let i = 0

    while (i < text.length) {
      if (text[i] === '^' && i + 1 < text.length) {
        const colorCode = text[i + 1]
        if (colorMap[colorCode] !== undefined) {
          if (currentText) {
            parts.push(
              <span key={parts.length} style={{ color: currentColor }}>
                {currentText}
              </span>
            )
            currentText = ''
          }
          currentColor = colorMap[colorCode]
          i += 2
          continue
        }
      }
      currentText += text[i]
      i++
    }

    if (currentText) {
      parts.push(
        <span key={parts.length} style={{ color: currentColor }}>
          {currentText}
        </span>
      )
    }

    return parts.length > 0 ? parts : [text]
  }

  const renderMessage = () => {
    const isConsoleMessage = props.sender === 'CONSOLE' || props.senderId === 0 || props.senderId === -1
    
    return (
      <span className="chat__message--content__bottom--text">
        {isConsoleMessage ? parseFiveMColors(props.message) : props.message}
      </span>
    )
  }

  const renderAvatar = () => {
    return (
      <div
        className={`chat__message--image`}
        style={{
          borderColor: myMesssage ? getBorderColor() : 'rgba(255, 255, 255, 0.15)',
        }}
      >
        {imageLoading && !imageError && (
          <div className="chat__message--image__loading">
            <div className="chat__message--image__loading-spinner"></div>
          </div>
        )}
        {!imageError ? (
          <img 
            src={props.picture} 
            alt={`${props.sender}'s avatar`} 
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: imageLoading ? 'none' : 'block' }}
          />
        ) : (
          <div className="chat__message--image__fallback">
            <span>{props.sender.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger className="ContextMenuTrigger">
          <div className={`chat__message ${!settings.profilePictures ? 'chat__message--no-avatar' : ''}`}>
            {settings.profilePictures && renderAvatar()}
            <div
              className={`chat__message--content ${myMesssage ? 'chat__message--myborder' : 'chat_message--border'}`}
              style={{
                background: settings.chatColors && props.color?.bgColor ? props.color.bgColor : 'rgba(5, 7, 12, 0.9)',
                borderColor: myMesssage ? getBorderColor() : 'rgba(255, 255, 255, 0.15)',
                marginLeft: !settings.profilePictures ? '0' : undefined,
              }}
            >
              <div className="chat__message--content__upper">
                {(props.senderId != null && props.senderId > 0) && (
                  <div className="chat__message--content__upper--id">
                    <Tag bgColor="rgba(255,255,255,0.10)" color="#fff" text={`#${props.senderId}`} fontWeight={500} />
                  </div>
                )}
                <div className="chat__message--content__upper--name">
                  {renderName()}
                </div>

                {settings.chatTags && props.tags && props.tags.length > 0 &&
                  props.tags
                    .slice(0, settings.chatSize === 'small' ? 1 : 2)
                    .map((tag: TagType, index: number) => (
                    <Tag bgColor={tag.bgColor} color={tag.color} text={tag.text} key={index} fontWeight={500} />
                  ))}
              </div>
              <div className="chat__message--content__bottom">
                {renderMessage()}
              </div>
            </div>
          </div>
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className="ContextMenuContent">
            <ContextMenu.Item className="ContextMenuItem" onClick={async () => setClipboard(props.sender)}>
              Copy User Name
            </ContextMenu.Item>

            <ContextMenu.Item className="ContextMenuItem" onClick={async () => setClipboard(props.message)}>
              Copy Message
            </ContextMenu.Item>

            {(canMutePlayer || canUnmutePlayer || canDeleteMessage) && (
              <React.Fragment>
                {canMutePlayer && (
                  <ContextMenu.Item 
                    className="ContextMenuItem" 
                    onClick={() => openModal('mute', props.senderId)}
                  >
                    Mute User
                  </ContextMenu.Item>
                )}
                {canUnmutePlayer && (
                  <ContextMenu.Item 
                    className="ContextMenuItem" 
                    onClick={() => openModal('unmute', props.senderId)}
                  >
                    Unmute User
                  </ContextMenu.Item>
                )}
                {canDeleteMessage && (
                  <ContextMenu.Item className="ContextMenuItem" onClick={handleDeleteMessage}>
                    Delete Message
                  </ContextMenu.Item>
                )}
              </React.Fragment>
            )}
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
    </>
  )
}

export default Message
