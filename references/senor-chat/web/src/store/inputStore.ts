import { RefObject } from 'react'
import { create } from 'zustand'

interface StoreInterface {
  input: string
  setInput: (newInput: string) => void
  inputRef: RefObject<HTMLInputElement> | null
  setInputRef: (ref: RefObject<HTMLInputElement>) => void
  emojis: boolean
  setEmojis: (emojis: boolean) => void
}

const inputStore = create<StoreInterface>((set) => ({
  input: '',
  setInput: (newInput: string) => set({ input: newInput }),
  inputRef: null,
  setInputRef: (ref) => set({ inputRef: ref }),
  emojis: false,
  setEmojis: (emojis: boolean) => set({ emojis }),
}))

export default inputStore
