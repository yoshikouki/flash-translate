import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ToggleSwitch } from "@/shared/components/toggle-switch";
import { useLanguageDetectorAvailability } from "@/shared/hooks/use-language-detector-availability";
import { getSettings, saveSettings } from "@/shared/storage/settings";
import { getMessage } from "@/shared/utils/i18n";

export function TranslationBehaviorSettings() {
  const [skipSameLanguage, setSkipSameLanguage] = useState(true);
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);
  const {
    availability: detectorAvailability,
    isChecking: isCheckingAvailability,
  } = useLanguageDetectorAvailability();

  useEffect(() => {
    const initialize = async () => {
      const settings = await getSettings();
      setSkipSameLanguage(settings.skipSameLanguage);
      setAutoDetectLanguage(settings.autoDetectLanguage);
    };
    initialize();
  }, []);

  const handleSkipSameLanguageToggle = async () => {
    const newValue = !skipSameLanguage;
    setSkipSameLanguage(newValue);
    await saveSettings({ skipSameLanguage: newValue });
  };

  const handleAutoDetectToggle = async () => {
    const newValue = !autoDetectLanguage;
    setAutoDetectLanguage(newValue);
    await saveSettings({ autoDetectLanguage: newValue });
  };

  const isDetectorUnavailable =
    detectorAvailability === "unavailable" ||
    detectorAvailability === "unsupported";
  const autoDetectEnabled = autoDetectLanguage && !isDetectorUnavailable;
  const effectiveSkipSameLanguage = autoDetectEnabled ? true : skipSameLanguage;

  return (
    <div className="border-t border-gray-100 px-3 py-2.5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex-1 pr-3">
          <span
            className={cn(
              "text-sm",
              isDetectorUnavailable ? "text-gray-400" : "text-gray-700"
            )}
          >
            {getMessage("popup_behavior_autoDetectLanguage")}
          </span>
          <AutoDetectDescription
            isDetectorUnavailable={isDetectorUnavailable}
            isLoading={isCheckingAvailability}
          />
        </div>
        <ToggleSwitch
          checked={autoDetectEnabled}
          disabled={isDetectorUnavailable}
          onChange={handleAutoDetectToggle}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-3">
          <span
            className={cn(
              "text-sm",
              autoDetectEnabled ? "text-gray-400" : "text-gray-700"
            )}
          >
            {getMessage("popup_behavior_skipSameLanguage")}
          </span>
          <p className="mt-0.5 text-xs text-gray-400">
            {autoDetectEnabled
              ? getMessage("popup_behavior_skipSameLanguageAutoDetectNote")
              : getMessage("popup_behavior_skipSameLanguageDesc")}
          </p>
        </div>
        <ToggleSwitch
          checked={effectiveSkipSameLanguage}
          disabled={autoDetectEnabled}
          onChange={handleSkipSameLanguageToggle}
        />
      </div>
    </div>
  );
}

interface AutoDetectDescriptionProps {
  isLoading: boolean;
  isDetectorUnavailable: boolean;
}

function AutoDetectDescription({
  isLoading,
  isDetectorUnavailable,
}: AutoDetectDescriptionProps) {
  if (isLoading) {
    return <p className="mt-0.5 text-xs text-gray-400">...</p>;
  }

  if (isDetectorUnavailable) {
    return (
      <p className="mt-0.5 text-xs text-amber-600">
        {getMessage("popup_behavior_autoDetectUnavailable")}
      </p>
    );
  }

  return (
    <p className="mt-0.5 text-xs text-gray-400">
      {getMessage("popup_behavior_autoDetectLanguageDesc")}
    </p>
  );
}
