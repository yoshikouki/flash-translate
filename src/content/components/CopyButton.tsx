import { useState } from "react";

interface CopyButtonProps {
  text: string | null;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      className="flex items-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 text-sm leading-none cursor-pointer bg-transparent border-none transition-colors px-1 rounded disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      onClick={handleCopy}
      disabled={!text}
      aria-label="Copy translation"
      type="button"
    >
      {copied ? "✓" : "⧉"}
    </button>
  );
}
