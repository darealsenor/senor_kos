import React, { useEffect, useRef, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import './ChatContainer.css'
import messageStore, { MessageType } from '../store/messageStore'
import Message from './Message'
import { useNuiEvent } from '../hooks/useNuiEvent'
import ChannelStore from '../store/channelsStore'
import { isEnvBrowser } from '../utils/misc'
import { debugData } from '../utils/debugData'
import { useVisibility } from '../providers/VisibilityProvider'
import useSettingsStore from '../store/settingsStore'

const ChatContainer = () => {
  const { messages, addMessage, clearChat } = messageStore()
  const chatRef = useRef<HTMLDivElement | null>(null)
  const { currentChannel, incrementUnread } = ChannelStore()
  const { visible, setVisible } = useVisibility()
  const { settings } = useSettingsStore()
  const [isAtBottom, setIsAtBottom] = useState(true)
  const isUserScrollingRef = useRef(false)

  const filteredMessages = useMemo(
    () => {
      if (!messages || !Array.isArray(messages)) return []
      if (!currentChannel) return []
      if (!('id' in currentChannel) || currentChannel.id === undefined || currentChannel.id === null) return []
      return messages.filter((message) => message.channel.id === currentChannel.id)
    },
    [messages, currentChannel],
  )

  const checkIfAtBottom = () => {
    if (!chatRef.current) return false
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current
    const threshold = 100
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    return distanceFromBottom <= threshold
  }

  useEffect(() => {
    if (chatRef.current && currentChannel) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'instant' })
      setIsAtBottom(true)
    }
  }, [currentChannel])

  useEffect(() => {
    if (!chatRef.current || filteredMessages.length === 0) return
    
    const scrollToBottom = () => {
      if (!chatRef.current) return
      
      const atBottom = checkIfAtBottom()
      
      if (isUserScrollingRef.current) {
        if (atBottom) {
          isUserScrollingRef.current = false
          setIsAtBottom(true)
        }
        return
      }
      
      if (atBottom || isAtBottom) {
        chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
        setIsAtBottom(true)
        isUserScrollingRef.current = false
      }
    }
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToBottom()
      })
    })
  }, [filteredMessages, isAtBottom])

  useEffect(() => {
    if (!visible.box) return
    
    const chatElement = chatRef.current
    if (!chatElement) return

    let scrollTimeout: NodeJS.Timeout | null = null

    const handleScroll = () => {
      if (!chatElement) return
      const atBottom = checkIfAtBottom()
      setIsAtBottom(atBottom)
      
      if (!atBottom) {
        isUserScrollingRef.current = true
        if (scrollTimeout) clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          isUserScrollingRef.current = false
          const stillAtBottom = checkIfAtBottom()
          if (stillAtBottom) {
            setIsAtBottom(true)
          }
        }, 200)
      } else {
        isUserScrollingRef.current = false
        setIsAtBottom(true)
        if (scrollTimeout) {
          clearTimeout(scrollTimeout)
          scrollTimeout = null
        }
      }
    }

    chatElement.addEventListener('scroll', handleScroll, { passive: true })
    chatElement.addEventListener('wheel', handleScroll, { passive: true })
    chatElement.addEventListener('touchmove', handleScroll, { passive: true })
    
    return () => {
      chatElement.removeEventListener('scroll', handleScroll)
      chatElement.removeEventListener('wheel', handleScroll)
      chatElement.removeEventListener('touchmove', handleScroll)
      if (scrollTimeout) clearTimeout(scrollTimeout)
    }
  }, [visible.box])

  useEffect(() => {
    if (visible.input) return
    if (!visible.box) return
    
    const Interval = setTimeout(() => {
      if (!visible.input && visible.box) {
        setVisible({ box: false, input: false })
      }
    }, 5000)

    return () => clearTimeout(Interval)
  }, [visible, setVisible])

  useNuiEvent('newMessage', (data: MessageType) => {
    if (!data?.id || !data.sender || !data.message || !data.channel) return
    
    addMessage(data)

    if (data.channel.id !== currentChannel?.id) {
      incrementUnread(data.channel.id)
    }

    if (settings.showChatOnNewMessage && !visible.input) {
      setVisible({ box: true, input: false })
    }
  })

  if (isEnvBrowser()) {
    // @ts-expect-error
    window.addMessage = (data) => {
      debugData([{ action: 'newMessage', data }])
      addMessage(data)
    }
  }

  useNuiEvent('clearChat', () => {
    clearChat()
  })

  useNuiEvent('clearChannel', (channelName: string) => {
    if (!channelName) return
    const { removeMessagesByChannel } = messageStore.getState()
    removeMessagesByChannel(channelName)
  })

  return (
    <AnimatePresence>
      {visible.box && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="chat"
          ref={chatRef}
        >
          <AnimatePresence initial={false}>
            {filteredMessages.map((message: MessageType, index: number) => {
              if (!message?.id) return null
              
              return (
                <motion.div
                  key={message.id || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{ width: '100%' }}
                >
                  <Message {...message} />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ChatContainer
