import { useState, useRef } from "react";
import {
  type ExclusionPattern,
  generatePatternId,
} from "@/shared/storage/settings";

interface ExclusionSettingsProps {
  patterns: ExclusionPattern[];
  currentTabUrl: string | null;
  onPatternsChange: (patterns: ExclusionPattern[]) => void;
}

export function ExclusionSettings({
  patterns,
  currentTabUrl,
  onPatternsChange,
}: ExclusionSettingsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

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
    onPatternsChange([newPattern, ...patterns]);
  };

  const handleToggle = (id: string) => {
    onPatternsChange(
      patterns.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleDelete = (id: string) => {
    onPatternsChange(patterns.filter((p) => p.id !== id));
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSaveEdit = (id: string) => {
    const newPattern = editInputRef.current?.value.trim();
    if (!newPattern) return;

    onPatternsChange(
      patterns.map((p) => (p.id === id ? { ...p, pattern: newPattern } : p))
    );
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
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
          className={`w-full mb-2 px-3 py-2 rounded border border-dashed text-sm text-left flex items-center gap-2 ${
            isCurrentSiteExcluded
              ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
              : "border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
          }`}
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
            <div key={pattern.id}>
              {editingId === pattern.id ? (
                <div className="flex items-center gap-1.5">
                  <input
                    ref={editInputRef}
                    type="text"
                    defaultValue={pattern.pattern}
                    className="flex-1 text-sm bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(pattern.id);
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                  />
                  <button
                    onClick={() => handleSaveEdit(pattern.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 px-1.5"
                    type="button"
                  >
                    OK
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-xs text-gray-500 hover:text-gray-700 px-1.5"
                    type="button"
                  >
                    x
                  </button>
                </div>
              ) : (
                <div
                  className={`flex items-center gap-2 px-2 py-1.5 rounded ${
                    pattern.enabled ? "bg-gray-100" : "bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={pattern.enabled}
                    onChange={() => handleToggle(pattern.id)}
                    className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span
                    className={`flex-1 text-xs truncate ${
                      pattern.enabled ? "text-gray-700" : "text-gray-400"
                    }`}
                    title={pattern.pattern}
                  >
                    {formatUrl(pattern.pattern)}
                  </span>
                  <button
                    onClick={() => handleEdit(pattern.id)}
                    className="text-xs text-gray-400 hover:text-blue-600 p-0.5"
                    type="button"
                    title="編集"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(pattern.id)}
                    className="text-xs text-gray-400 hover:text-red-600 p-0.5"
                    type="button"
                    title="削除"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
