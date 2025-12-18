import { useEffect, useState } from "react";
import { useTranslator } from "../hooks/useTranslator";
import { usePopupPosition } from "../hooks/usePopupPosition";
import type { SelectionInfo } from "../hooks/useTextSelection";
import {
  saveSettings,
  getSettings,
  generatePatternId,
} from "@/shared/storage/settings";
import { PopupHeader } from "./PopupHeader";
import { TranslationContent } from "./TranslationContent";

interface TranslationPopupProps {
  selection: SelectionInfo;
  sourceLanguage: string;
  targetLanguage: string;
  onClose: () => void;
}

export function TranslationPopup({
  selection,
  sourceLanguage: initialSource,
  targetLanguage: initialTarget,
  onClose,
}: TranslationPopupProps) {
  const [sourceLanguage, setSourceLanguage] = useState(initialSource);
  const [targetLanguage, setTargetLanguage] = useState(initialTarget);

  const { result, isLoading, error, translate, availability } = useTranslator({
    sourceLanguage,
    targetLanguage,
    streaming: true,
  });

  const [copied, setCopied] = useState(false);
  const [excludeConfirm, setExcludeConfirm] = useState(false);

  const handleExcludeSite = async () => {
    if (!excludeConfirm) {
      setExcludeConfirm(true);
      // Auto-reset after 3 seconds
      setTimeout(() => setExcludeConfirm(false), 3000);
      return;
    }

    // Second click - actually exclude the site
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
    onClose();
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleOpenSettings = () => {
    const settingsUrl = chrome.runtime.getURL("src/popup/index.html");
    window.open(settingsUrl, "_blank");
  };

  const handleSourceChange = async (lang: string) => {
    setSourceLanguage(lang);
    await saveSettings({ sourceLanguage: lang });
  };

  const handleTargetChange = async (lang: string) => {
    setTargetLanguage(lang);
    await saveSettings({ targetLanguage: lang });
  };

  const handleSwap = async () => {
    const newSource = targetLanguage;
    const newTarget = sourceLanguage;
    setSourceLanguage(newSource);
    setTargetLanguage(newTarget);
    await saveSettings({
      sourceLanguage: newSource,
      targetLanguage: newTarget,
    });
  };

  const position = usePopupPosition({
    selectionRect: selection.rect,
    popupWidth: 320,
    popupHeight: 180,
  });

  // Translate when selection or language changes
  // Note: translate is intentionally excluded from deps to avoid infinite loops
  // (React Compiler handles memoization, but useEffect deps need explicit values)
  useEffect(() => {
    if (selection.text) {
      translate(selection.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection.text, sourceLanguage, targetLanguage]);

  // Sync with props when they change (from settings)
  useEffect(() => {
    setSourceLanguage(initialSource);
  }, [initialSource]);

  useEffect(() => {
    setTargetLanguage(initialTarget);
  }, [initialTarget]);

  if (!position) return null;

  const headerHeight = 40;
  const contentPadding = 24;
  const maxContentHeight = Math.max(
    position.maxHeight - headerHeight - contentPadding,
    64
  );

  const style: React.CSSProperties = {
    position: "fixed",
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 2147483647,
  };

  return (
    <div
      style={style}
      className="font-sans text-sm leading-normal text-gray-800"
    >
      <div className="bg-white rounded-xl border border-solid border-gray-200 shadow-2xl min-w-80 max-w-md">
        <PopupHeader
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          onSourceChange={handleSourceChange}
          onTargetChange={handleTargetChange}
          onSwap={handleSwap}
          copied={copied}
          hasResult={!!result}
          onCopy={handleCopy}
          excludeConfirm={excludeConfirm}
          onExcludeSite={handleExcludeSite}
          onCancelExclude={() => setExcludeConfirm(false)}
          onOpenSettings={handleOpenSettings}
          onClose={onClose}
        />

        <div
          className="px-4 py-3 min-h-16"
          style={{
            maxHeight: `${maxContentHeight}px`,
            overflowY: "auto",
          }}
        >
          <TranslationContent
            availability={availability}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            isLoading={isLoading}
            result={result}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
