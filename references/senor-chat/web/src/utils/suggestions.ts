import { Suggestion } from '../store/suggestionStore'

// Parse input to determine current parameter
export const parseInput = (input: string) => {
  try {
    if (!input || typeof input !== 'string') {
      return { command: '', args: [], currentParamIndex: 0, isComplete: false }
    }
    
    const trimmedInput = input.trim()
    const parts = trimmedInput.split(/\s+/).filter(part => part.length > 0)
    const command = parts[0] || ''
    
    // Get all parts after command (these are the filled arguments)
    const filledArgs = parts.slice(1)
    
    // Check if input ends with a space (user has moved to next parameter)
    // This means they've finished typing the current parameter and moved to the next one
    const endsWithSpace = input.endsWith(' ') && trimmedInput.length < input.length
    
    // Determine current parameter index:
    // - If no args: user is on first parameter (index 0)
    // - If ends with space: user has moved to next parameter (index = filledArgs.length)
    // - If doesn't end with space: user is typing current parameter (index = filledArgs.length - 1, minimum 0)
    let currentParamIndex = 0
    if (filledArgs.length === 0) {
      currentParamIndex = 0 // First parameter
    } else if (endsWithSpace) {
      currentParamIndex = filledArgs.length // Next parameter after filled args
    } else {
      // User is typing the current parameter (the last filled arg)
      currentParamIndex = filledArgs.length - 1
    }
    
    return {
      command,
      args: filledArgs,
      currentParamIndex,
      isComplete: filledArgs.length >= 1
    }
  } catch (error) {
    console.error('Error parsing input:', error, input)
    return { command: '', args: [], currentParamIndex: 0, isComplete: false }
  }
}

/**
 * Filter suggestions based on input - matches FiveM native chat logic
 * Simple prefix matching with parameter completion detection
 */
export const filterSuggestions = (suggestions: Suggestion[], input: string) => {
  try {
    if (!input || typeof input !== 'string' || input === '') {
      return []
    }
    if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
      return []
    }

    // Filter valid suggestions
    const validSuggestions = suggestions.filter(s => s && s.name && typeof s.name === 'string')
    if (validSuggestions.length === 0) {
      return []
    }

    // Filter suggestions - FiveM's logic
    const filtered = validSuggestions.filter((s) => {
      // If suggestion name starts with message, include it
      if (s.name.startsWith(input)) {
        return true
      }

      // Otherwise, check if message parts match suggestion parts
      const suggestionSplitted = s.name.split(' ')
      const messageSplitted = input.split(' ')

      for (let i = 0; i < messageSplitted.length; i += 1) {
        // If we've exceeded suggestion parts, check if we're within params range
        if (i >= suggestionSplitted.length) {
          const paramCount = s.params ? s.params.length : 0
          return i < suggestionSplitted.length + paramCount
        }

        // If parts don't match, exclude this suggestion
        if (suggestionSplitted[i] !== messageSplitted[i]) {
          return false
        }
      }

      return true
    })

    if (filtered.length === 0) {
      return []
    }

    // Mark suggestions and params as disabled based on input matching
    filtered.forEach((s) => {
      // Mark suggestion as disabled if name doesn't start with input
      s.disabled = !s.name.startsWith(input)

      // Mark params as disabled based on regex matching (FiveM's logic)
      if (s.params && s.params.length > 0) {
        s.params.forEach((p, index) => {
          const wType = (index === s.params.length - 1) ? '.' : '\\S'
          const regex = new RegExp(`${s.name} (?:\\w+ ){${index}}(?:${wType}*)$`, 'g')
          const paramDisabled = input.match(regex) == null

          // Update param disabled state (only for object params)
          if (typeof p === 'object' && p !== null && 'name' in p) {
            (p as { name: string; disabled?: boolean }).disabled = paramDisabled
          }
          // For string params, disabled state is checked in renderSuggestionLine
        })
      }
    })

    // Return top 8 results (FiveM native chat limit)
    return filtered.slice(0, 8)
  } catch (error) {
    console.error('Error filtering suggestions:', error)
    return []
  }
}

