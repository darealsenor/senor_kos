import { create } from 'zustand'
import { Channel } from './channelsStore'

type user = {
  id: number
  picture: string
  name: string
  tags: Tag[]
}

const randomUser: user[] = [
  {
    id: 1,
    picture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4-yN8BK6_6LkUggJmahIvZ38qYWSOosV1Pw&s',
    name: 'senor',
    tags: [
      { bgColor: 'rgba(34, 139, 230, 0.1)', color: '#228be6', text: 'Senor Cult' },
      { bgColor: 'rgba(253, 126, 20, 0.1)', color: '#fd7e14', text: 'ADMIN' },
    ],
  },
  {
    id: 2,
    picture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWj3iKDUHoBMK_zwnVyLaRezlAxDQr3sBo4w&s',
    name: 'BigOfer',
    tags: [
      { bgColor: 'rgba(34, 139, 230, 0.1)', color: '#228be6', text: 'GPT' },
      { bgColor: 'rgba(253, 126, 20, 0.1)', color: '#fd7e14', text: 'Ginola' },
    ],
  },
  {
    id: 3,
    picture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNdYwaSdVSmwq5jpLMlc1Nl_YdcdUqjsGWKQ&s',
    name: 'Meet Tur',
    tags: [
      { bgColor: 'rgba(34, 139, 230, 0.1)', color: '#228be6', text: 'Devid', id: 1 },
      { bgColor: 'rgba(253, 126, 20, 0.1)', color: '#fd7e14', text: 'TX', id: 1 },
    ],
  },
  {
    id: 4,
    picture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF6iniIvivJsBk3dNKEfl92Vvl4YNauYh9HA&s',
    name: 'inonvee',
    tags: [
      { bgColor: 'rgba(34, 139, 230, 0.1)', color: '#228be6', text: 'slim', id: 1 },
      { bgColor: 'rgba(253, 126, 20, 0.1)', color: '#fd7e14', text: 'shady', id: 1 },
    ],
  },
]
const randomMessages: string[] = [
  'Shalomdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
  'BPC noder',
  'ani gamer',
  'woohoooo',
]

export const generateMessages = (amount: number = 5, channel: Channel): MessageType[] => {
  const messages: MessageType[] = []

  for (let i = 0; i < amount; i++) {
    const randomId = Math.floor(Math.random() * randomUser.length)
    const ruser = randomUser[randomId]
    const randomMessageId = Math.floor(Math.random() * randomMessages.length)

    const message: MessageType = {
      id: i + 1,
      senderId: ruser.id,
      sender: ruser.name,
      message: randomMessages[randomMessageId],
      timestamp: new Date(),
      picture: ruser.picture,
      tags: ruser.tags,
      channel: channel,
    }

    messages.push(message)
  }

  return messages
}

export type Tag = {
  bgColor: string
  color: string
  text: string
  fontWeight?: number
  id?: number
}

export type Color = {
  bgColor: string;
  color: string;
  name: string;
  id: number
}

export type MessageType = {
  id: number
  senderId: number
  sender: string
  message: string
  picture: string
  channel: { id: number; name?: string }
  tags?: Tag[]
  timestamp?: Date
  color?: Color
}

interface messageInterface {
  messages: MessageType[]
  addMessage: (message: MessageType) => void
  removeMessage: (messageId: number) => void
  clearChat: () => void

  sentMessages: string[]
  sentMessagesIndex: number
  addSentMessage: (message: string) => void
  setMessageIndex: (number: number) => void
  removeMessageBySender: (senderId: number) => void

  removeMessageById: (messageId: number) => void
  removeMessagesByChannel: (channelName: string) => void
}

const messageStore = create<messageInterface>((set) => ({
  messages: [],

  addMessage: (message: Omit<MessageType, 'timestamp'>) =>
    set((state) => ({
      messages: [...(state.messages || []), { ...message, timestamp: new Date() }],
    })),

  removeMessage: (messageId: number) =>
    set((state) => ({
      messages: (state.messages || []).filter((msg) => msg.id !== messageId),
    })),

  clearChat: () =>
    set(() => ({
      messages: [],
      sentMessages: [],
      sentMessagesIndex: -1,
    })),

    removeMessageById: (messageId: number) =>
    set((state) => ({
      messages: (state.messages || []).filter((msg) => msg.id !== messageId),
    })),

  removeMessageBySender: (senderId: number) =>
    set((state) => ({
      messages: (state.messages || []).filter((msg) => msg.senderId !== senderId),
    })),

  removeMessagesByChannel: (channelName: string) =>
    set((state) => ({
      messages: (state.messages || []).filter((msg) => {
        return msg.channel.name !== channelName && msg.channel.id?.toString() !== channelName
      }),
    })),

  sentMessages: [],
  sentMessagesIndex: -1,
  addSentMessage: (message: string) =>
    set((state) => ({
      sentMessages: [...state.sentMessages, message],
    })),
  setMessageIndex: (number: number) =>
    set(() => ({
      sentMessagesIndex: number,
    })),
}))

export default messageStore
