import { usePopupInteraction } from "../hooks/use-popup-interaction";
import type { SelectionInfo } from "../hooks/use-text-selection";
import { useTranslationCardState } from "../hooks/use-translation-card-state";
import { CardFooter } from "./card-footer";
import { CardHeader } from "./card-header";
import { DragHandle } from "./drag-handle";
import { ResizeHandle } from "./resize-handle";
import { MIN_POPUP_WIDTH } from "./translation-card-utils";
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
  // Translation state and settings management
  const {
    sourceLanguage,
    targetLanguage,
    handleSourceChange,
    handleTargetChange,
    handleSwap,
    result,
    isLoading,
    error,
    availability,
    maxPopupWidth,
  } = useTranslationCardState({ selection });

  // Popup interaction (resize, drag, position)
  const {
    position,
    finalLeft,
    finalTop,
    width,
    isResizing,
    isDragging,
    handleLeftMouseDown,
    handleRightMouseDown,
    handleDragMouseDown,
  } = usePopupInteraction({
    selectionRect: selection.rect,
    maxPopupWidth,
  });

  const handleOpenSettings = () => {
    const settingsUrl = chrome.runtime.getURL("src/popup/index.html");
    window.open(settingsUrl, "_blank");
  };

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
        left: `${finalLeft}px`,
        top: `${finalTop}px`,
        zIndex: 2_147_483_647,
      }}
    >
      <div
        className="relative overflow-visible rounded-xl border border-stone-400/60 border-solid bg-white/90 pt-4 shadow-2xl backdrop-blur"
        style={{
          width: `${width}px`,
          minWidth: `${MIN_POPUP_WIDTH}px`,
          maxWidth: `${maxPopupWidth}px`,
        }}
      >
        <DragHandle
          isDragging={isDragging}
          onKeyDown={handleDragKeyDown}
          onMouseDown={handleDragMouseDown}
        />
        <ResizeHandle
          isResizing={isResizing}
          onKeyDown={handleLeftKeyDown}
          onMouseDown={handleLeftMouseDown}
          side="left"
        />
        <ResizeHandle
          isResizing={isResizing}
          onKeyDown={handleRightKeyDown}
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
