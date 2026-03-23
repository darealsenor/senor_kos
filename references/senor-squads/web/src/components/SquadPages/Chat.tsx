import React, { useEffect, useRef, useState } from 'react'
import usePlayerStore, { MessageInterface } from '../../stores/playerSlice'
import { fetchNui } from '../../utils/fetchNui'
import { isEnvBrowser } from '../../utils/misc'
import { useLocales } from '../../providers/LocaleProvider'
import { LeftArrowIcon, SendIcon } from '../icons'
import { motion } from 'framer-motion'
import useStateSlice from '../../stores/stateSlice'

const Header = ({ name, playersLength }: { name: string; playersLength: number }) => {
  const { locale } = useLocales()
  const {toggleChat, chat} = useStateSlice()
  return (
    <div className="bg-white bg-opacity-[2%] basis-[10%] flex items-center justify-between px-2">
      <div className="flex gap-1 items-center justify-center">
        <motion.div className="bg-white bg-opacity-5 rounded h-5 w-5 flex items-center justify-center hover:cursor-pointer p-1" whileHover={{scale: 1.1}}>
            <LeftArrowIcon onClick={() => toggleChat(!chat)} />
        </motion.div>

        <p className="gilroy text-sm">
          <span className="text-white font-semibold">{name}</span>
          <span className="text-white text-opacity-50"> {locale.ui_chat}</span>
        </p>
      </div>

      <div className="flex items-center justify-center p-1 bg-white bg-opacity-5 rounded-md gap-2 w-20 h-6">
        <img src="./icons/people.png" alt="" className="w-3 h-3 object-contain" />
        <span className="text-primary text-xs font-gilroy font-semibold">
          {playersLength} {locale.ui_chat_players}
        </span>
      </div>
    </div>
  )
}

const Message = ({ message, myId }: { message: MessageInterface; myId: number }) => {
  const isMine = message.player.serverId === myId

  return (
    <motion.div
      initial={{ x: isMine ? 50 : -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 50 }}
      className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'} text-white`}
    >
      <div className="flex flex-col gap-1">
        <div className={`flex gap-1 ${isMine && 'flex-row-reverse'}`}>
          <img src={message.player.image} alt="" className="w-8 object-contain border rounded-md border-primary" />
          <div className={`flex flex-col font-gilroy ${isMine ? 'items-end' : 'items-start'}`}>
            <span className={`${isMine ? 'text-primary' : 'text-white'} text-xs font-semibold`}>
              {message.player.name}
            </span>
            <span className="text-white text-opacity-50 text-xs">
              {new Date(message.time * 1000).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <div
          className={`bg-white bg-opacity-5 px-2 py-1 flex items-start w-fit rounded-lg break-all ${
            isMine ? 'rounded-tr-none self-end text-right' : 'rounded-tl-none self-start text-left'
          }`}
        >
          <span className={`${isMine ? 'text-primary' : 'text-white'}`}>{message.message}</span>
        </div>
      </div>
    </motion.div>
  )
}

const Body = ({ messages, myId }: { messages: MessageInterface[]; myId: number }) => {
  const messagesEndRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      ref={containerRef}
      className="flex flex-col gap-2 p-4 rounded-lg basis-[80%] overflow-y-auto overflow-x-hidden"
    >
      {messages.map((message, index) => (
        <Message key={index} message={message} myId={myId} />
      ))}
      <div ref={messagesEndRef} />
    </motion.div>
  )
}

const Input = ({
  sendMessage,
}: {
  sendMessage: (message: string, time: number, player: MessageInterface['player']) => void
}) => {
  const [input, setInput] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleMessage = async () => {
    if (!input.trim() || input.length < 3) return

    try {
      setLoading(true)

      const retval: { success: boolean; message: string } = await fetchNui(
        'sendMessage',
        {
          message: input,
        },
        { success: true, message: 'Sent' },
      )

      if (retval.success) {
        if (isEnvBrowser()) {
          sendMessage(input, Date.now(), {
            image: '',
            name: 'SENOR',
            serverId: (Math.random() > 0.5 && 1) || 2,
          })
        }
        setInput('')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleMessage()
    }
  }

  return (
    <div className="relative w-full p-4">
      <div className="w-full bg-white bg-opacity-5 flex">
        <input
          type="text"
          minLength={3}
          maxLength={70}
          className="w-[85%] p-3 rounded text-primary text-xs font-medium bg-transparent "
          placeholder="Enter a text..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <div className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-white bg-opacity-5 p-1 rounded" onClick={handleMessage}>
          {/* <img src="./icons/send.svg" alt="" className="w-full h-full object-cover" /> */}
          <SendIcon />
        </div>
      </div>
    </div>
  )
}

const Chat = () => {
  const { messages, mySquad, playerId, addMessage } = usePlayerStore()
  if (!mySquad) return null

  const sendMessage = (message, time, player) => {
    addMessage({ message, time: Date.now(), player })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-[18.5vw] h-[43vh] flex flex-col rounded-lg"
      style={{ background: 'var(--container-bg)' }}
    >
      <Header name={mySquad.name} playersLength={Object.keys(mySquad.players).length} />
      <Body messages={messages} myId={playerId} />
      <Input sendMessage={sendMessage} />
    </motion.div>
  )
}

export default Chat
