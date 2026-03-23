import { create } from 'zustand'

export interface Suggestion {
  name: string
  help: string
  params: (string | { name: string; type?: string; help?: string })[]
  disabled?: boolean
}

interface SuggestionStore {
  suggestionsVisible: boolean
  setSuggestions: (bool: boolean) => void
  suggestions: Suggestion[]
  addSuggestion: (newSuggestion: Suggestion[]) => void
  removeSuggestion: (name: string) => void
  clearSuggestions: () => void
  suggestionIndex: number
  setSuggestionIndex: (newIndex: number) => void
}

const useSuggestionStore = create<SuggestionStore>((set) => ({
  suggestionsVisible: false,
  setSuggestions: (bool: boolean) => set({ suggestionsVisible: bool }),
  suggestions: [],

  addSuggestion: (newSuggestions: Suggestion[]) =>
    set((state) => {
      try {
        const suggestions = state.suggestions || []
        const validNewSuggestions = Array.isArray(newSuggestions) ? newSuggestions : []
        const existingNames = new Set(suggestions.map((s) => s?.name).filter(Boolean))
        const filteredSuggestions = validNewSuggestions.filter((s) => s && s.name && !existingNames.has(s.name))
        return { suggestions: [...suggestions, ...filteredSuggestions] }
      } catch (error) {
        console.error('Error adding suggestions:', error)
        return state
      }
    }),

  removeSuggestion: (name) =>
    set((state) => ({
      suggestions: (state.suggestions || []).filter((s) => s.name !== name),
    })),

  clearSuggestions: () => set({ suggestions: [] }),

  suggestionIndex: 0,
  setSuggestionIndex: (newIndex: number) => set({ suggestionIndex: newIndex })
}))

export default useSuggestionStore
