import { useEffect, useState } from "react";
import { getValidOrigin } from "./tab-url";

export function useCurrentTabUrl(): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // Check for Chrome API errors
      if (chrome.runtime.lastError) {
        if (import.meta.env.DEV) {
          console.error(
            "[Flash Translate] Tab query error:",
            chrome.runtime.lastError.message
          );
        }
        return;
      }

      // Ensure tabs array is not empty
      if (!tabs || tabs.length === 0) {
        return;
      }

      const tabId = tabs[0]?.id;
      if (tabId === undefined) {
        return;
      }

      // Request URL from content script (avoids needing "tabs" permission)
      chrome.tabs.sendMessage(
        tabId,
        { type: "GET_CURRENT_URL" },
        (response) => {
          // Content script may not be loaded (e.g., chrome:// pages)
          if (chrome.runtime.lastError) {
            if (import.meta.env.DEV) {
              console.log(
                "[Flash Translate] Content script not available:",
                chrome.runtime.lastError.message
              );
            }
            return;
          }

          if (response?.url) {
            setUrl(getValidOrigin(response.url));
          }
        }
      );
    });
  }, []);

  return url;
}
