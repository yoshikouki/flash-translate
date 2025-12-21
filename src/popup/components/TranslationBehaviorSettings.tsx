import { useState, useEffect } from "react";
import { getSettings, saveSettings } from "@/shared/storage/settings";

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
    <div className="px-3 py-2.5 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-3">
          <span className="text-sm text-gray-700">
            Skip same language
          </span>
          <p className="text-xs text-gray-400 mt-0.5">
            Don't show popup when page language matches target
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={skipSameLanguage}
          onClick={handleToggle}
          className={`
            relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full
            border-2 border-transparent transition-colors duration-200 ease-in-out
            focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
            ${skipSameLanguage ? "bg-blue-500" : "bg-gray-200"}
          `}
        >
          <span
            className={`
              pointer-events-none inline-block h-4 w-4 transform rounded-full
              bg-white shadow ring-0 transition duration-200 ease-in-out
              ${skipSameLanguage ? "translate-x-4" : "translate-x-0"}
            `}
          />
        </button>
      </div>
    </div>
  );
}
