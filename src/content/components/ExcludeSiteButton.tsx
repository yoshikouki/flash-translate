import { useState } from "react";
import {
  saveSettings,
  getSettings,
  generatePatternId,
} from "@/shared/storage/settings";

interface ExcludeSiteButtonProps {
  onExcluded: () => void;
}

export function ExcludeSiteButton({ onExcluded }: ExcludeSiteButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleClick = () => {
    setIsConfirming(true);
    // Auto-reset after 3 seconds
    setTimeout(() => setIsConfirming(false), 3000);
  };

  const handleConfirm = async () => {
    const currentOrigin = window.location.origin;
    const settings = await getSettings();
    const newPattern = {
      id: generatePatternId(),
      pattern: currentOrigin,
      enabled: true,
    };
    await saveSettings({
      exclusionPatterns: [newPattern, ...settings.exclusionPatterns],
    });
    onExcluded();
  };

  const handleCancel = () => {
    setIsConfirming(false);
  };

  return (
    <>
      <button
        className="flex items-center text-sm leading-none cursor-pointer border-none transition-colors px-1 bg-transparent text-gray-400 hover:text-red-500 hover:bg-red-200 rounded"
        onClick={handleClick}
        aria-label="Exclude this site"
        title="Exclude this site"
        type="button"
      >
        ⊘
      </button>
      {isConfirming && (
        <div className="absolute inset-0 flex items-stretch justify-between px-3 py-2 bg-white border border-solid border-red-200 rounded-xl">
          <span className="flex items-center text-xs text-gray-600">
            Disable on this site?
          </span>
          <div className="flex items-stretch gap-2 py-0">
            <button
              className="flex items-center text-xs px-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors cursor-pointer border-none"
              onClick={handleConfirm}
              type="button"
            >
              Disable
            </button>
            <button
              className="flex items-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-lg leading-none cursor-pointer bg-transparent border-none transition-colors px-1 rounded"
              onClick={handleCancel}
              aria-label="Cancel"
              type="button"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
