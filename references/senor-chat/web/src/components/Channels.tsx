import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ChannelStore, { Channel } from '../store/channelsStore'
import { useChannelName } from '../utils/channelUtils'

import './Channels.css'
import { useNuiEvent } from '../hooks/useNuiEvent'
import { debugData } from '../utils/debugData'
import { isEnvBrowser } from '../utils/misc'
import useSettingsStore from '../store/settingsStore'
import { useVisibility } from '../providers/VisibilityProvider'
import { fetchNui } from '../utils/fetchNui'

declare global {
  interface Window {
    addChannel?: (channel: Channel) => void
    removeChannel?: (channelId: number) => void
  }
}

debugData([
  {
    action: 'addChannel',
    data: { id: 1, name: 'Idk', unread: 0 },
  },
])

const ChannelItem = ({ channel, isSelected, onClick }: { channel: Channel, isSelected: boolean, onClick: () => void }) => {
  const name = useChannelName(channel.id)
  return (
    <div
      className={`channel ${isSelected ? 'channel__selected' : 'channel__notselected'}`}
      onClick={onClick}
    >
      {name} {(channel.unread ?? 0) > 0 ? `(${channel.unread! < 99 ? channel.unread : '99+'})` : ''}
    </div>
  )
}

const Channels = () => {
  const { currentChannel, availableChannels, addChannel, removeChannel, setChannel } = ChannelStore()
  const { settings } = useSettingsStore()
  const { visible } = useVisibility()

  const handleSetChannel = (channelId: number) => {
    if (currentChannel?.id === channelId) return
    setChannel(channelId)
  }

  useNuiEvent('removeChannel', (channelId: number) => removeChannel(channelId))

  useNuiEvent('addChannel', (channel: Channel) => {
    addChannel(channel)
  })
  useNuiEvent('setChannel', (channelId: number) => {
    setChannel(channelId)
    if (!isEnvBrowser()) {
      fetchNui('setChannel', channelId).catch(() => {})
    }
  })

  useEffect(() => {
    if (currentChannel?.id !== undefined && currentChannel?.id !== null && !isEnvBrowser()) {
      fetchNui('setChannel', currentChannel.id).catch(() => {})
    }
  }, [currentChannel?.id])

  if (isEnvBrowser()) {
    window.addChannel = addChannel
    window.removeChannel = removeChannel
  }

  if (!settings.channels) return null
  if (!currentChannel || !availableChannels) return null
  if (settings.channelsMode === 'inline') return null

  const isVisible = visible.input || visible.box

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="channels"
        >
      {Object.values(availableChannels).map((channel) => (
        <ChannelItem
          key={channel.id}
          channel={channel}
          isSelected={currentChannel.id === channel.id}
          onClick={() => handleSetChannel(channel.id)}
        />
      ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Channels
