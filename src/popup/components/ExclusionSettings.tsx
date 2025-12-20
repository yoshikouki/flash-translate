import { useState, useEffect } from "react";
import {
  type ExclusionPattern,
  generatePatternId,
  getSettings,
  saveSettings,
} from "@/shared/storage/settings";
import { ExclusionPatternItem } from "./ExclusionPatternItem";
import { useCurrentTabUrl } from "../hooks/useCurrentTabUrl";
import { cn } from "@/lib/utils";

export function ExclusionSettings() {
  const currentTabUrl = useCurrentTabUrl();
  const [patterns, setPatterns] = useState<ExclusionPattern[]>([]);

  // Load patterns from storage on mount
  useEffect(() => {
    const loadPatterns = async () => {
      const settings = await getSettings();
      setPatterns(settings.exclusionPatterns || []);
    };
    loadPatterns();
  }, []);

  const savePatterns = async (newPatterns: ExclusionPattern[]) => {
    setPatterns(newPatterns);
    await saveSettings({ exclusionPatterns: newPatterns });
  };

  const isCurrentSiteExcluded = currentTabUrl
    ? patterns.some((p) => p.pattern === currentTabUrl && p.enabled)
    : false;

  const handleAddCurrentSite = () => {
    if (!currentTabUrl || isCurrentSiteExcluded) return;

    const newPattern: ExclusionPattern = {
      id: generatePatternId(),
      pattern: currentTabUrl,
      enabled: true,
    };
    savePatterns([newPattern, ...patterns]);
  };

  const handlePatternChange = (updated: ExclusionPattern) => {
    savePatterns(
      patterns.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleDelete = (id: string) => {
    savePatterns(patterns.filter((p) => p.id !== id));
  };

  const formatUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname + (parsed.pathname !== "/" ? parsed.pathname : "");
    } catch {
      return url;
    }
  };

  return (
    <div className="px-3 py-2.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">除外サイト</span>
      </div>

      {/* Add current site button */}
      {currentTabUrl && (
        <button
          type="button"
          onClick={handleAddCurrentSite}
          disabled={isCurrentSiteExcluded}
          className={cn(
            "w-full mb-2 px-3 py-2 rounded border border-dashed text-sm text-left flex items-center gap-2",
            isCurrentSiteExcluded
              ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
              : "border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
          )}
        >
          <span className="text-lg leading-none">+</span>
          <span className="truncate flex-1">{formatUrl(currentTabUrl)}</span>
          {isCurrentSiteExcluded && (
            <span className="text-xs text-gray-400 shrink-0">除外中</span>
          )}
        </button>
      )}

      {/* Existing patterns */}
      {patterns.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-2">
          除外サイトなし
        </p>
      ) : (
        <div className="space-y-1.5">
          {patterns.map((pattern) => (
            <ExclusionPatternItem
              key={pattern.id}
              pattern={pattern}
              onPatternChange={handlePatternChange}
              onDelete={() => handleDelete(pattern.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
