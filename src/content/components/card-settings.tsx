import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/button";
import { ToggleSwitch } from "@/shared/components/toggle-switch";
import { OPEN_SETTINGS_MESSAGE } from "@/shared/constants/runtime-messages";
import { getMessage } from "@/shared/utils/i18n";
import { createPrefixedLogger } from "@/shared/utils/logger";

const log = createPrefixedLogger("CardSettings");

interface CardSettingsProps {
  onExcludeSite: () => Promise<void>;
}

export function CardSettings({ onExcludeSite }: CardSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleExcludeSite = async () => {
    setIsSaving(true);
    try {
      await onExcludeSite();
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDetailedSettings = () => {
    chrome.runtime
      .sendMessage(OPEN_SETTINGS_MESSAGE)
      .catch((error) => log.error("Failed to request options page:", error));
  };

  return (
    <section aria-labelledby="card-settings-title" className="px-4 py-2">
      <div className="flex items-center justify-between">
        <h2
          className="m-0 text-sm font-medium text-gray-700"
          id="card-settings-title"
        >
          {getMessage("content_settings")}
        </h2>
        <Button
          aria-label={getMessage("content_openDetailedSettings")}
          onClick={handleOpenDetailedSettings}
          title={getMessage("content_openDetailedSettings")}
          variant="ghost"
        >
          <ExternalLink size={14} />
        </Button>
      </div>
      <div className="mt-1 flex items-center justify-between gap-3 border-t border-gray-200 pt-3">
        <div className="min-w-0">
          <label
            className="block text-sm text-gray-700"
            htmlFor="exclude-current-site"
          >
            {getMessage("content_excludeCurrentSite")}
          </label>
          <p className="m-0 mt-0.5 text-xs leading-4 text-gray-400">
            {getMessage("content_excludeCurrentSiteDescription")}
          </p>
        </div>
        <ToggleSwitch
          ariaLabel={getMessage("content_excludeCurrentSite")}
          checked={isSaving}
          disabled={isSaving}
          id="exclude-current-site"
          onChange={handleExcludeSite}
        />
      </div>
    </section>
  );
}
