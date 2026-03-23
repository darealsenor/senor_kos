import { isEnvBrowser } from "./misc";

/**
 * Simple wrapper around fetch API tailored for CEF/NUI use. This abstraction
 * can be extended to include AbortController if needed or if the response isn't
 * JSON. Tailor it to your needs.
 *
 * @param eventName - The endpoint eventname to target
 * @param data - Data you wish to send in the NUI Callback
 * @param mockData - Mock data to be returned if in the browser
 *
 * @return returnData - A promise for the data sent back by the NuiCallbacks CB argument
 */

export async function fetchNui<T = unknown>(
  eventName: string,
  data?: unknown,
  mockData?: T,
): Promise<T> {
  const options = {
    method: "post",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(data),
  };

  if (isEnvBrowser() && mockData) return mockData;

  try {
    const resourceName = (window as unknown as { GetParentResourceName?: () => string }).GetParentResourceName
      ? (window as unknown as { GetParentResourceName: () => string }).GetParentResourceName()
      : "nui-frame-app";

    const resp = await fetch(`https://${resourceName}/${eventName}`, options);
    
    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }

    const respFormatted = await resp.json();
    return respFormatted;
  } catch (error) {
    console.error(`fetchNui error for ${eventName}:`, error);
    
    // Return safe defaults based on common event types
    if (eventName === 'nuiLoaded') {
      return {
        id: 1,
        tags: [],
        colors: [],
        selectedTag: null,
        selectedColor: null
      } as T;
    }
    
    // For other events, throw the error to be handled by the caller
    throw error;
  }
}
