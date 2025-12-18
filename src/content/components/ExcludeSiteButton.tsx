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
        className="text-sm leading-none cursor-pointer border-none transition-colors p-1 bg-transparent text-gray-400 hover:text-red-500"
        onClick={handleClick}
        aria-label="Exclude this site"
        title="このサイトを除外"
        type="button"
      >
        ⊘
      </button>
      {isConfirming && (
        <div className="absolute inset-0 flex items-center justify-between px-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
          <span className="text-xs text-gray-600">
            このサイトで無効にする？
          </span>
          <div className="flex items-center gap-2">
            <button
              className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors cursor-pointer border-none"
              onClick={handleConfirm}
              type="button"
            >
              無効にする
            </button>
            <button
              className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer bg-transparent border-none transition-colors p-1"
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
