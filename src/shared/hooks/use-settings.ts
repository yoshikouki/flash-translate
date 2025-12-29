import { useEffect, useState } from "react";
import { getSettings, subscribeToSettings } from "../storage/settings";
import type { SettingsSelector } from "../storage/settings-selectors";

interface UseSettingsOptions {
  /** Whether to subscribe to real-time updates. Default: true */
  subscribe?: boolean;
}

/**
 * Hook to load and optionally subscribe to settings.
 * Uses a selector function to extract only the needed data.
 *
 * @param selector - Pure function to extract data from settings
 * @param options - Configuration options
 * @returns [data, isLoading] tuple
 *
 * @example
 * const [settings, isLoading] = useSettings(selectContentAppSettings);
 * if (!isLoading && settings) {
 *   const { targetLanguage, skipSameLanguage, exclusionPatterns } = settings;
 * }
 */
export function useSettings<T>(
  selector: SettingsSelector<T>,
  options: UseSettingsOptions = {}
): [T | null, boolean] {
  const { subscribe = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      const settings = await getSettings();
      if (isMounted) {
        setData(selector(settings));
        setIsLoading(false);
      }
    };

    loadSettings();

    let unsubscribe: (() => void) | undefined;

    if (subscribe) {
      unsubscribe = subscribeToSettings((settings) => {
        if (isMounted) {
          setData(selector(settings));
        }
      });
    }

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [selector, subscribe]);

  return [data, isLoading];
}
