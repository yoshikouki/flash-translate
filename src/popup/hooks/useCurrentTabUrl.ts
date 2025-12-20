import { useState, useEffect } from "react";

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

      const tabUrl = tabs[0]?.url;
      if (tabUrl) {
        try {
          const origin = new URL(tabUrl).origin;
          // Exclude browser internal URLs like chrome:// or edge://
          if (!origin.startsWith("chrome") && !origin.startsWith("edge")) {
            setUrl(origin);
          }
        } catch {
          setUrl(null);
        }
      }
    });
  }, []);

  return url;
}
