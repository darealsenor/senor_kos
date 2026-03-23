import { create } from 'zustand'

export interface Dictionary<T> {
  [key: string]: T;
}

export type Channel = {
  id: number;
  name?: string;
  unread?: number;
};

interface ChannelInterface {
  currentChannel: Channel | null;
  availableChannels: Dictionary<Channel>;
  addChannel: (channel: Channel) => void;
  removeChannel: (channelId: number) => void;
  setChannel: (channelId: number) => void;
  setNextChannel: () => void;
  incrementUnread: (channelId: number) => void;
  getChannelName: (channelId: number) => string;
}

const ChannelStore = create<ChannelInterface>((set, get) => ({
  currentChannel: null,
  availableChannels: {},

  addChannel: (channel) =>
    set((state) => {
      const updatedChannels = { ...state.availableChannels, [channel.id]: channel }
      const newCurrentChannel = state.currentChannel || channel
      return {
        availableChannels: updatedChannels,
        currentChannel: newCurrentChannel
      }
    }),

  removeChannel: (channelId) =>
    set((state) => {
      const updatedChannels = { ...state.availableChannels };
      if (updatedChannels[channelId]) delete updatedChannels[channelId];
      const firstChannel = Object.values(updatedChannels)[0] || null;
      return { availableChannels: updatedChannels, currentChannel: firstChannel };
    }),

    setChannel: (channelId) => {
      set((state) => {
        const updatedChannels = { ...state.availableChannels };
        const channel = updatedChannels[channelId];
    
        if (channel) {
          const updatedChannel = { ...channel, unread: 0 };
          updatedChannels[channelId] = updatedChannel;
          return {
            currentChannel: updatedChannel,
            availableChannels: updatedChannels,
          };
        }
    
        return state;
      });
    },
    

  setNextChannel: () => {
    const { currentChannel, availableChannels } = get();
    if (!currentChannel) return;
    const channelIds = Object.keys(availableChannels).map(Number);
    const currentIndex = channelIds.indexOf(currentChannel.id);
    const nextIndex = (currentIndex + 1) % channelIds.length;
    set({ currentChannel: availableChannels[channelIds[nextIndex]] });
  },

  incrementUnread: (channelId: number) =>
    set((state) => {
      const updatedChannels = { ...state.availableChannels };
      const channel = updatedChannels[channelId];
  
      if (channel) {
        updatedChannels[channelId] = { ...channel, unread: (channel.unread || 0) + 1 };
      }
  
      return { availableChannels: updatedChannels };
    }),

  getChannelName: (channelId: number) => {
    const channel = get().availableChannels[channelId];
    return channel?.name || '';
  },
  
}));

export default ChannelStore;
