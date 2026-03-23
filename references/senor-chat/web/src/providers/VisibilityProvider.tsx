import React, {
  Context,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { useNuiEvent } from "../hooks/useNuiEvent";
import playerStore from "../store/PlayerStore";
import inputStore from "../store/inputStore";
import useSuggestionStore from "../store/suggestionStore";
import ChannelStore from "../store/channelsStore";
import useSettingsStore from "../store/settingsStore";
import { fetchNui } from "../utils/fetchNui";
import { filterSuggestions } from "../utils/suggestions";

const VisibilityCtx = createContext<VisibilityProviderValue | null>(null);

interface VisibilityProviderValue {
  setVisible: (visible: { box?: boolean; input?: boolean }) => void;
  visible: {
    box: boolean;
    input: boolean;
  };
}

// This should be mounted at the top level of your application
export const VisibilityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState<{ box: boolean; input: boolean }>({
    box: false,
    input: false,
  });

  // Update the visibility state based on the event
  useNuiEvent<{ box: boolean; input: boolean }>("setVisible", (newVisible) => {
    setVisible((prev) => ({
      ...prev,
      ...newVisible,
    }));
  });

  // Centralized key handler
  const { editMode, setEditMode } = playerStore()
  const { input, setInput, emojis, setEmojis } = inputStore()
  const { suggestions, suggestionIndex, setSuggestionIndex, suggestionsVisible } = useSuggestionStore()
  const { currentChannel, setChannel, availableChannels } = ChannelStore()
  const { settings } = useSettingsStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key handling
      if (e.code === 'Escape') {
        // Priority 0: Close context menu if open - check before preventing default
        const contextMenu = document.querySelector('[data-radix-context-menu-content]')
        if (contextMenu) {
          const style = window.getComputedStyle(contextMenu)
          const rect = contextMenu.getBoundingClientRect()
          const isVisible = style.display !== 'none' && 
                           style.visibility !== 'hidden' && 
                           style.opacity !== '0' &&
                           rect.width > 0 && 
                           rect.height > 0
          
          if (isVisible) {
            e.preventDefault()
            e.stopPropagation()
            // Close context menu by dispatching escape event to it or clicking outside
            const escapeEvent = new KeyboardEvent('keydown', {
              key: 'Escape',
              code: 'Escape',
              bubbles: true,
              cancelable: true
            })
            contextMenu.dispatchEvent(escapeEvent)
            // Also click outside as fallback
            setTimeout(() => {
              document.body.click()
            }, 10)
            return
          }
        }

        e.preventDefault()
        e.stopPropagation()

        // Priority 1: If settings are open, close settings
        if (editMode) {
          setEditMode(false)
          return
        }

        // Priority 2: If input is active, close input but keep UI open
        if (visible.input) {
          if (emojis) {
            setEmojis(false)
            return
          }
          setVisible({ input: false, box: true })
          setInput('')
          fetchNui('hideInput')
          return
        }

        // Priority 3: If UI is open, close everything with fade-out
        if (visible.box || visible.input) {
          setVisible({ input: false, box: false })
          // Wait for fade-out animation (300ms) before calling hideFrame
          // hideFrame will then wait another 350ms before SetNuiFocus to ensure animation completes
          setTimeout(() => {
            fetchNui('hideFrame')
          }, 300)
          setInput('')
        }
      }

      // Tab key handling (only when input is active)
      if (e.code === 'Tab' && visible.input) {
        e.preventDefault()

        // Priority 1: If input starts with "/" and suggestions are visible, cycle commands
        if (input.startsWith('/') && suggestionsVisible && suggestions && suggestions.length > 0) {
          // Use the same filtering logic as Suggestions component
          const filtered = filterSuggestions(suggestions, input)
          
          if (filtered.length > 0) {
            // Find current suggestion in filtered list based on input
            const inputTrimmed = input.trim().toLowerCase()
            let currentIndex = -1
            
            // Try to find exact match first
            const exactMatchIndex = filtered.findIndex(s => 
              s.name.toLowerCase() === inputTrimmed || 
              inputTrimmed.startsWith(s.name.toLowerCase() + ' ')
            )
            
            if (exactMatchIndex >= 0) {
              currentIndex = exactMatchIndex
            } else if (suggestionIndex >= 0 && suggestionIndex < filtered.length) {
              // Fallback to stored index if valid
              currentIndex = suggestionIndex
            }
            
            // Check if current input exactly matches a command (for auto-complete with space)
            const exactMatch = filtered.find(s => s.name.toLowerCase() === inputTrimmed)
            if (exactMatch && exactMatch.params && exactMatch.params.length > 0) {
              // If exact match and has params, auto-complete with space
              setInput(exactMatch.name + ' ')
              setSuggestionIndex(filtered.findIndex(s => s.name === exactMatch.name))
              return
            }
            
            // Cycle to next suggestion
            const nextIndex = (currentIndex + 1) % filtered.length
            const nextSuggestionName = filtered[nextIndex]?.name || ''
            // Don't add extra / if suggestion name already starts with /
            setInput(nextSuggestionName.startsWith('/') ? nextSuggestionName : `/${nextSuggestionName}`)
            setSuggestionIndex(nextIndex)
          }
          return
        }

        // Priority 2: If no "/" and channels are enabled, cycle channels
        if (!input.startsWith('/') && settings.channels && availableChannels && Object.keys(availableChannels).length > 0) {
          const channelIds = Object.values(availableChannels).map(channel => channel.id)
          const currentIndex = channelIds.indexOf(currentChannel?.id || 0)
          const nextIndex = (currentIndex + 1) % channelIds.length
          setChannel(channelIds[nextIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [visible, editMode, setEditMode, input, setInput, emojis, setEmojis, suggestionsVisible, suggestions, suggestionIndex, setSuggestionIndex, currentChannel, setChannel, availableChannels, settings.channels, setVisible])

  const [isFadingOut, setIsFadingOut] = React.useState(false)
  const prevVisible = React.useRef({ box: visible.box, input: visible.input })

  React.useEffect(() => {
    // Detect transition from visible to hidden synchronously
    const wasVisible = prevVisible.current.box || prevVisible.current.input
    const isVisible = visible.box || visible.input
    
    if (wasVisible && !isVisible) {
      setIsFadingOut(true)
    }
    if (isVisible) {
      setIsFadingOut(false)
    }
    prevVisible.current = { box: visible.box, input: visible.input }
  }, [visible.box, visible.input])

  React.useEffect(() => {
    if (!visible.box && !visible.input && isFadingOut) {
      const timer = setTimeout(() => {
        setIsFadingOut(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [visible.box, visible.input, isFadingOut])

  return (
    <VisibilityCtx.Provider
      value={{
        visible,
        setVisible: (newVisible) => {
          setVisible((prev) => {
            // If we're transitioning from visible to hidden, set isFadingOut immediately
            const wasVisible = prev.box || prev.input
            const newBox = newVisible.box !== undefined ? newVisible.box : prev.box
            const newInput = newVisible.input !== undefined ? newVisible.input : prev.input
            const willBeVisible = newBox || newInput
            const isHiding = wasVisible && !willBeVisible
            
            if (isHiding) {
              setIsFadingOut(true)
            }
            
            return {
              ...prev,
              ...newVisible,
            }
          });
        },
      }}
    >
      <div
        style={{
          opacity: (visible.box || visible.input || isFadingOut) ? 1 : 0,
          pointerEvents: (visible.box || visible.input || isFadingOut) ? "auto" : "none",
          height: "100%",
          transition: "opacity 0.3s ease",
        }}
        data-debug={`box:${visible.box},input:${visible.input},fading:${isFadingOut}`}
      >
        {children}
      </div>
    </VisibilityCtx.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useVisibility = () =>
  useContext<VisibilityProviderValue>(
    VisibilityCtx as Context<VisibilityProviderValue>,
  );
