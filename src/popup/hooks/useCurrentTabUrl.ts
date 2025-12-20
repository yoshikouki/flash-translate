import { useState, useEffect } from "react";

export function useCurrentTabUrl(): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
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
