interface ExcludeConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ExcludeConfirmation({
  onConfirm,
  onCancel,
}: ExcludeConfirmationProps) {
  return (
    <>
      <span className="text-xs text-gray-600">このサイトで無効にする？</span>
      <div className="flex items-center gap-2">
        <button
          className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors cursor-pointer border-none"
          onClick={onConfirm}
          type="button"
        >
          無効にする
        </button>
        <button
          className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer bg-transparent border-none transition-colors p-1"
          onClick={onCancel}
          aria-label="Cancel"
          type="button"
        >
          ×
        </button>
      </div>
    </>
  );
}
