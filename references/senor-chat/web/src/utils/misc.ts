// Will return whether the current environment is in a regular browser
// and not CEF
interface WindowWithInvokeNative extends Window {
  invokeNative?: unknown
}
export const isEnvBrowser = (): boolean => !(window as WindowWithInvokeNative).invokeNative;

// Basic no operation function
export const noop = () => {};

export const handleHistoryMessage = (messages: string[], up: boolean, currentIndex: number): string | undefined => {
    if (!messages || messages.length === 0) return
  
    // When going up (ArrowUp), we want to go to older messages (lower index)
    // When going down (ArrowDown), we want to go to newer messages (higher index)
    // currentIndex represents the currently selected message
    if (currentIndex >= 0 && currentIndex < messages.length) {
      return messages[currentIndex]
    }
  
    return undefined
  }