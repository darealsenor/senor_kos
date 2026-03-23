import { useLocale } from '../providers/LocaleProvider'
import ChannelStore from '../store/channelsStore'

export const useChannelName = (channelId: number): string => {
  const { t } = useLocale()
  const { availableChannels } = ChannelStore()
  
  const channel = availableChannels[channelId]
  if (channel?.name) {
    return t(channel.name)
  }
  
  if (channelId === 0) {
    return t('channel_global')
  } else if (channelId === 1) {
    return t('channel_staff')
  }
  
  return `Channel ${channelId}`
}

