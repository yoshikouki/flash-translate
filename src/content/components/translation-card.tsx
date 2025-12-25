import { useEffect, useState } from "react";
import {
  DEFAULT_SOURCE_LANGUAGE,
  DEFAULT_TARGET_LANGUAGE,
} from "@/shared/constants/languages";
import {
  getSettings,
  saveSettings,
  subscribeToSettings,
} from "@/shared/storage/settings";
import { useDraggable } from "../hooks/useDraggable";
import { usePopupPosition } from "../hooks/usePopupPosition";
import { useResizable } from "../hooks/useResizable";
import type { SelectionInfo } from "../hooks/useTextSelection";
import { useTranslator } from "../hooks/useTranslator";
import { CardFooter } from "./card-footer";
import { CardHeader } from "./card-header";
import { DragHandle } from "./drag-handle";
import { ResizeHandle } from "./resize-handle";
import {
  calculateMaxPopupWidth,
  calculatePopupWidth,
  MIN_POPUP_WIDTH,
} from "./translation-card-utils";
import { TranslationContent } from "./translation-content";

interface TranslationCardProps {
  selection: SelectionInfo;
  onClose: () => void;
  onExcludeSite: () => void;
}

export function TranslationCard({
  selection,
  onClose,
  onExcludeSite,
}: TranslationCardProps) {
  const [sourceLanguage, setSourceLanguage] = useState(DEFAULT_SOURCE_LANGUAGE);
  const [targetLanguage, setTargetLanguage] = useState(DEFAULT_TARGET_LANGUAGE);
  const [maxPopupWidth, setMaxPopupWidth] = useState(() =>
    calculateMaxPopupWidth(window.innerWidth)
  );

  // Calculate popup width based on selection width (clamped to min/max)
  const selectionBasedWidth = calculatePopupWidth(
    selection.rect.width,
    maxPopupWidth
  );

  // Update max width on window resize
  useEffect(() => {
    const handleResize = () => {
      setMaxPopupWidth(calculateMaxPopupWidth(window.innerWidth));
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
    };

    loadSettings();

    const unsubscribe = subscribeToSettings((settings) => {
      setSourceLanguage(settings.sourceLanguage);
      setTargetLanguage(settings.targetLanguage);
    });

    return unsubscribe;
  }, []);

  const {
    width,
    isResizing,
    offsetX: resizeOffsetX,
    handleLeftMouseDown,
    handleRightMouseDown,
  } = useResizable({
    initialWidth: selectionBasedWidth,
    minWidth: MIN_POPUP_WIDTH,
    maxWidth: maxPopupWidth,
  });

  const {
    offset,
    isDragging,
    handleMouseDown: handleDragMouseDown,
  } = useDraggable();

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
    popupWidth: selectionBasedWidth,
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
  }, [selection.text, translate]);

  if (!position) {
    return null;
  }

  const headerHeight = 40;
  const contentPadding = 24;
  const maxContentHeight = Math.max(
    position.maxHeight - headerHeight - contentPadding,
    64
  );

  return (
    <div
      className="fixed font-sans text-gray-800 text-sm leading-normal"
      style={{
        left: `${position.x + offset.x + resizeOffsetX}px`,
        top: `${position.y + offset.y}px`,
        zIndex: 2_147_483_647,
      }}
    >
      <div
        className="relative overflow-visible rounded-xl border border-stone-400/60 border-solid bg-white/80 pt-4 shadow-2xl backdrop-blur"
        style={{
          width: `${width}px`,
          minWidth: `${MIN_POPUP_WIDTH}px`,
          maxWidth: `${maxPopupWidth}px`,
        }}
      >
        <DragHandle isDragging={isDragging} onMouseDown={handleDragMouseDown} />
        <ResizeHandle
          isResizing={isResizing}
          onMouseDown={handleLeftMouseDown}
          side="left"
        />
        <ResizeHandle
          isResizing={isResizing}
          onMouseDown={handleRightMouseDown}
          side="right"
        />
        <CardHeader
          onClose={onClose}
          onExcludeSite={onExcludeSite}
          onOpenSettings={handleOpenSettings}
          onSourceChange={handleSourceChange}
          onSwap={handleSwap}
          onTargetChange={handleTargetChange}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
        />

        <div
          className="min-h-16 px-4 py-3"
          style={{
            maxHeight: `${maxContentHeight}px`,
            overflowY: "auto",
          }}
        >
          <TranslationContent
            availability={availability}
            error={error}
            isLoading={isLoading}
            result={result}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
          />
        </div>

        <CardFooter result={result} />
      </div>
    </div>
  );
}
