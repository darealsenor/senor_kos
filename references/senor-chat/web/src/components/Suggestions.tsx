import { useEffect } from 'react'
import useSuggestionStore, { Suggestion } from '../store/suggestionStore'
import inputStore from '../store/inputStore'

import './Suggestions.css'
import { isEnvBrowser } from '../utils/misc'
import { filterSuggestions } from '../utils/suggestions'

// Debug data for testing suggestions
const debugSuggestions: Suggestion[] = [
  {
    name: '/mute',
    help: 'Mute a player for specified duration',
    params: ['playerId', 'duration', 'reason']
  },
  {
    name: '/unmute',
    help: 'Unmute a player',
    params: ['playerId']
  },
  {
    name: '/me',
    help: 'Perform an action as your character',
    params: ['action']
  },
  {
    name: '/do',
    help: 'Describe what is happening around you',
    params: ['description']
  },
  {
    name: '/ooc',
    help: 'Send out-of-character message',
    params: ['message']
  },
  {
    name: '/pm',
    help: 'Send private message to player',
    params: ['playerId', 'message']
  },
  {
    name: '/clear',
    help: 'Clear your chat',
    params: []
  },
  {
    name: '/report',
    help: 'Report an issue to staff',
    params: ['message']
  },
  {
    name: '/car',
    help: 'Spawn a vehicle',
    params: ['model']
  },
  {
    name: '/tp',
    help: 'Teleport to a player or location',
    params: ['target']
  },
  {
    name: '/give',
    help: 'Give an item to a player',
    params: ['playerId', 'item', 'amount']
  },
  {
    name: '/kick',
    help: 'Kick a player from the server',
    params: ['playerId', 'reason']
  },
  {
    name: '/ban',
    help: 'Ban a player from the server',
    params: ['playerId', 'duration', 'reason']
  },
  {
    name: '/weather',
    help: 'Change the weather',
    params: ['weatherType']
  },
  {
    name: '/time',
    help: 'Set the time of day',
    params: ['hour']
  },
  {
    name: '/noclip',
    help: 'Toggle noclip mode',
    params: []
  },
  {
    name: '/godmode',
    help: 'Toggle god mode',
    params: []
  },
  {
    name: '/revive',
    help: 'Revive a player',
    params: ['playerId']
  },
  {
    name: '/heal',
    help: 'Heal a player',
    params: ['playerId']
  },
  {
    name: '/armor',
    help: 'Give armor to a player',
    params: ['playerId', 'amount']
  },
  {
    name: '/money',
    help: 'Give money to a player',
    params: ['playerId', 'type', 'amount']
  },
  {
    name: '/job',
    help: 'Set a player\'s job',
    params: ['playerId', 'job', 'grade']
  },
  {
    name: '/gang',
    help: 'Set a player\'s gang',
    params: ['playerId', 'gang', 'grade']
  },
  {
    name: '/house',
    help: 'Manage player houses',
    params: ['action', 'playerId']
  },
  {
    name: '/business',
    help: 'Manage player businesses',
    params: ['action', 'playerId']
  },
  {
    name: '/phone',
    help: 'Send a phone message',
    params: ['number', 'message']
  },
  {
    name: '/call',
    help: 'Make a phone call',
    params: ['number']
  },
  {
    name: '/sms',
    help: 'Send an SMS',
    params: ['number', 'message']
  },
  {
    name: '/ad',
    help: 'Post an advertisement',
    params: ['message']
  },
  {
    name: '/news',
    help: 'Post a news article',
    params: ['headline', 'content']
  },
  {
    name: '/police',
    help: 'Send a police radio message',
    params: ['message']
  },
  {
    name: '/ems',
    help: 'Send an EMS radio message',
    params: ['message']
  },
  {
    name: '/mechanic',
    help: 'Send a mechanic radio message',
    params: ['message']
  },
  {
    name: '/taxi',
    help: 'Send a taxi radio message',
    params: ['message']
  },
  {
    name: '/tow',
    help: 'Send a tow truck radio message',
    params: ['message']
  },
  {
    name: '/bank',
    help: 'Access bank functions',
    params: ['action', 'amount']
  },
  {
    name: '/atm',
    help: 'Access ATM functions',
    params: ['action', 'amount']
  },
  {
    name: '/inventory',
    help: 'Open inventory',
    params: []
  },
  {
    name: '/settings',
    help: 'Open settings menu',
    params: []
  },
  {
    name: '/help',
    help: 'Show help information',
    params: ['topic']
  },
  {
    name: '/rules',
    help: 'Show server rules',
    params: []
  },
  {
    name: '/discord',
    help: 'Get Discord invite link',
    params: []
  },
  {
    name: '/website',
    help: 'Get server website link',
    params: []
  },
  {
    name: '/donate',
    help: 'Get donation information',
    params: []
  }
]



const Suggestions = () => {
  const { suggestionsVisible, suggestions, suggestionIndex, addSuggestion, clearSuggestions } = useSuggestionStore()
  const { input, setInput } = inputStore()

  // Add debug suggestions in browser environment
  useEffect(() => {
    if (isEnvBrowser() && (!suggestions || suggestions.length === 0)) {
      addSuggestion(debugSuggestions)
      
      // Add test function to window for manual testing
      if (typeof window !== 'undefined') {
        (window as unknown as Record<string, unknown>).testSuggestions = () => {
          addSuggestion(debugSuggestions)
        }
        
        (window as unknown as Record<string, unknown>).clearSuggestions = () => {
          clearSuggestions()
        }
      }
    }
  }, [suggestions, addSuggestion, clearSuggestions])

  const filtered = filterSuggestions(suggestions || [], input)

  // Tab key handling moved to VisibilityProvider.tsx for centralized key management

  const handleSuggestionInput = (name: string) => {
    setInput(name)
  }

  const renderSuggestionLine = (suggestion: Suggestion) => {
    const getParamName = (param: string | { name: string; disabled?: boolean }) => {
      if (typeof param === 'object' && param !== null && 'name' in param) {
        return param.name
      }
      return param
    }

    const getParamDisabled = (param: string | { name: string; disabled?: boolean }, index: number) => {
      if (typeof param === 'object' && param !== null && 'disabled' in param) {
        return param.disabled === true
      }
      // For string params, check using regex (FiveM's logic)
      const wType = (index === (suggestion.params?.length || 0) - 1) ? '.' : '\\S'
      const regex = new RegExp(`${suggestion.name} (?:\\w+ ){${index}}(?:${wType}*)$`, 'g')
      return input.match(regex) == null
    }

    if (suggestion.params && suggestion.params.length > 0) {
      // If params exist, show: /command [param1] [param2]
      return (
        <>
          <span className={`suggestion__command ${suggestion.disabled ? 'disabled' : ''}`}>
            {suggestion.name}
          </span>
          {' '}
          {suggestion.params.map((param, paramIndex) => {
            const paramName = getParamName(param)
            const paramDisabled = getParamDisabled(param, paramIndex)
            // Active parameter is the one that's NOT disabled (current parameter being typed)
            const isActive = !paramDisabled && !suggestion.disabled
            
            return (
              <span
                key={paramIndex}
                className={`suggestion__param ${paramDisabled ? 'disabled' : ''} ${isActive ? 'suggestion__param--active' : ''}`}
              >
                [{paramName}]
              </span>
            )
          })}
        </>
      )
    } else if (suggestion.help) {
      // If no params but has description, show: /command - description
      return (
        <>
          <span className={`suggestion__command ${suggestion.disabled ? 'disabled' : ''}`}>
            {suggestion.name}
          </span>
          {' - '}
          <span className="suggestion__help">{suggestion.help}</span>
        </>
      )
    } else {
      // Just the command name
      return (
        <span className={`suggestion__command ${suggestion.disabled ? 'disabled' : ''}`}>
          {suggestion.name}
        </span>
      )
    }
  }

  if (!suggestionsVisible) return null

  return (
    <div className="suggestions-container">
      {filtered.length > 0 ? (
        <div className="suggestions">
          {filtered.map((suggestion, index) => {
            return (
              <div 
                key={index} 
                className={`suggestion ${index === suggestionIndex ? 'active' : ''}`} 
                onClick={() => handleSuggestionInput(suggestion.name)}
              >
                <span className="suggestion__line">{renderSuggestionLine(suggestion)}</span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="suggestions-empty">
          <span>No commands found</span>
        </div>
      )}
    </div>
  )
}

export default Suggestions
  