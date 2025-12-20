import { useEffect, useState } from "react";
import { useTranslator } from "../hooks/useTranslator";
import { usePopupPosition } from "../hooks/usePopupPosition";
import { useResizable } from "../hooks/useResizable";
import type { SelectionInfo } from "../hooks/useTextSelection";
import {
  getSettings,
  saveSettings,
  subscribeToSettings,
} from "@/shared/storage/settings";
import {
  DEFAULT_SOURCE_LANGUAGE,
  DEFAULT_TARGET_LANGUAGE,
} from "@/shared/constants/languages";
import { CardHeader } from "./CardHeader";
import { CardFooter } from "./CardFooter";
import { TranslationContent } from "./TranslationContent";
import { ResizeHandle } from "./ResizeHandle";

interface TranslationCardProps {
  selection: SelectionInfo;
  onClose: () => void;
}

const DEFAULT_POPUP_WIDTH = 320;
const MIN_POPUP_WIDTH = 280;
const POPUP_EDGE_MARGIN = 32; // 両端に16pxずつの余白

export function TranslationCard({
  selection,
  onClose,
}: TranslationCardProps) {
  const [sourceLanguage, setSourceLanguage] = useState(DEFAULT_SOURCE_LANGUAGE);
  const [targetLanguage, setTargetLanguage] = useState(DEFAULT_TARGET_LANGUAGE);
  const [popupWidth, setPopupWidth] = useState(DEFAULT_POPUP_WIDTH);
  const [maxPopupWidth, setMaxPopupWidth] = useState(
    () => window.innerWidth - POPUP_EDGE_MARGIN
  );

  // Update max width on window resize
  useEffect(() => {
    const handleResize = () => {
      setMaxPopupWidth(window.innerWidth - POPUP_EDGE_MARGIN);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load initial settings and subscribe to changes
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings();
      setSourceLanguage(settings.sourceLanguage);
      setTargetLanguage(settings.targetLanguage);
      setPopupWidth(settings.popupWidth ?? DEFAULT_POPUP_WIDTH);
    };

    loadSettings();

    const unsubscribe = subscribeToSettings((settings) => {
      setSourceLanguage(settings.sourceLanguage);
      setTargetLanguage(settings.targetLanguage);
      setPopupWidth(settings.popupWidth ?? DEFAULT_POPUP_WIDTH);
    });

    return unsubscribe;
  }, []);

  const handleResizeEnd = async (newWidth: number) => {
    await saveSettings({ popupWidth: newWidth });
  };

  const { width, isResizing, handleLeftMouseDown, handleRightMouseDown } = useResizable({
    initialWidth: popupWidth,
    minWidth: MIN_POPUP_WIDTH,
    maxWidth: maxPopupWidth,
    onResizeEnd: handleResizeEnd,
  });

  const { result, isLoading, error, translate, availability } = useTranslator({
    sourceLanguage,
    targetLanguage,
    streaming: true,
  });

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
    popupWidth: width,
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

  if (!position) return null;

  const headerHeight = 40;
  const contentPadding = 24;
  const maxContentHeight = Math.max(
    position.maxHeight - headerHeight - contentPadding,
    64
  );

  return (
    <div
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 2147483647,
      }}
      className="font-sans text-sm leading-normal text-gray-800"
    >
      <div
        className="relative bg-white rounded-xl border border-solid border-gray-200 shadow-2xl"
        style={{
          width: `${width}px`,
          minWidth: `${MIN_POPUP_WIDTH}px`,
          maxWidth: `${maxPopupWidth}px`,
          overflow: "visible",
        }}
      >
        <ResizeHandle onMouseDown={handleLeftMouseDown} isResizing={isResizing} side="left" />
        <ResizeHandle onMouseDown={handleRightMouseDown} isResizing={isResizing} side="right" />
        <CardHeader
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          onSourceChange={handleSourceChange}
          onTargetChange={handleTargetChange}
          onSwap={handleSwap}
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

        <CardFooter result={result} />
      </div>
    </div>
  );
}
