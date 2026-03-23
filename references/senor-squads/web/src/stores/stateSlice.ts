import { create } from 'zustand'

type Pages = 'Settings' | 'Creation' | 'Squad' | 'Browse'

export interface stateInterface {
    currentPage: Pages,
    setCurrentPage: (Page: Pages) => void;

    chat: boolean;
    toggleChat: (bool: boolean) => void;

}

const useStateSlice = create<stateInterface>((set) => ({
    currentPage: 'Browse',
    setCurrentPage: (newPage: Pages) => set({currentPage: newPage, chat: false }),

    chat: false,
    toggleChat: (bool: boolean) => set({chat: bool}),
    
}))

export default useStateSlice
