export const setClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }
  