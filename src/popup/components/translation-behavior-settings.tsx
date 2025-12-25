import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "@/shared/storage/settings";
import { getMessage } from "@/shared/utils/i18n";

export function TranslationBehaviorSettings() {
  const [skipSameLanguage, setSkipSameLanguage] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings();
      setSkipSameLanguage(settings.skipSameLanguage);
    };
    loadSettings();
  }, []);

  const handleToggle = async () => {
    const newValue = !skipSameLanguage;
    setSkipSameLanguage(newValue);
    await saveSettings({ skipSameLanguage: newValue });
  };

  return (
    <div className="border-gray-100 border-t px-3 py-2.5">
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-3">
          <span className="text-gray-700 text-sm">
            {getMessage("popup_behavior_skipSameLanguage")}
          </span>
          <p className="mt-0.5 text-gray-400 text-xs">
            {getMessage("popup_behavior_skipSameLanguageDesc")}
          </p>
        </div>
        <button
          aria-checked={skipSameLanguage}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${skipSameLanguage ? "bg-blue-500" : "bg-gray-200"}
          `}
          onClick={handleToggle}
          role="switch"
          type="button"
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${skipSameLanguage ? "translate-x-4" : "translate-x-0"}
            `}
          />
        </button>
      </div>
    </div>
  );
}
