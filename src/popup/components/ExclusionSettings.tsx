import { useState, useRef } from "react";
import {
  type ExclusionPattern,
  generatePatternId,
} from "@/shared/storage/settings";

interface ExclusionSettingsProps {
  patterns: ExclusionPattern[];
  onPatternsChange: (patterns: ExclusionPattern[]) => void;
}

export function ExclusionSettings({
  patterns,
  onPatternsChange,
}: ExclusionSettingsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const pattern = inputRef.current?.value.trim();
    if (!pattern) return;

    const newPattern: ExclusionPattern = {
      id: generatePatternId(),
      pattern,
      enabled: true,
    };

    onPatternsChange([...patterns, newPattern]);
    setIsAdding(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
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

  return (
    <div className="bg-white">
      <div className="px-3 py-2 border-b border-gray-100">
        <span className="text-xs text-gray-500 font-medium">除外サイト:</span>
        <p className="text-xs text-gray-400 mt-1">
          URLの前方一致で翻訳を無効化
        </p>
      </div>

      {patterns.length === 0 ? (
        <div className="px-3 py-3 text-xs text-gray-400 text-center">
          除外設定がありません
        </div>
      ) : (
        <ul>
          {patterns.map((pattern) => (
            <li
              key={pattern.id}
              className="px-3 py-2 border-b border-gray-50 last:border-b-0"
            >
              {editingId === pattern.id ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={editInputRef}
                    type="text"
                    defaultValue={pattern.pattern}
                    className="flex-1 text-sm bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="https://example.com/path"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(pattern.id);
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                  />
                  <button
                    onClick={() => handleSaveEdit(pattern.id)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                    type="button"
                  >
                    保存
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-xs text-gray-500 hover:text-gray-700"
                    type="button"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pattern.enabled}
                    onChange={() => handleToggle(pattern.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span
                    className={`flex-1 text-sm truncate ${
                      pattern.enabled ? "text-gray-700" : "text-gray-400"
                    }`}
                    title={pattern.pattern}
                  >
                    {pattern.pattern}
                  </span>
                  <button
                    onClick={() => handleEdit(pattern.id)}
                    className="text-xs text-gray-400 hover:text-blue-600"
                    type="button"
                    title="編集"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(pattern.id)}
                    className="text-xs text-gray-400 hover:text-red-600"
                    type="button"
                    title="削除"
                  >
                    ✕
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Add pattern section */}
      <div className="border-t border-gray-200 bg-gray-50">
        {isAdding ? (
          <div className="px-3 py-2 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 text-sm bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="https://example.com/path"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") setIsAdding(false);
              }}
            />
            <button
              onClick={handleAdd}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              type="button"
            >
              追加
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
              type="button"
            >
              キャンセル
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-gray-100 text-left flex items-center gap-1"
            type="button"
          >
            <span className="text-lg leading-none">+</span>
            <span>除外パターンを追加</span>
          </button>
        )}
      </div>
    </div>
  );
}
