import { useState } from "react";

type CopyState = "idle" | "copied" | "error";

interface CopyButtonProps {
  text: string | null;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle");

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Failed to copy:", err);
      }
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  };

  const getIcon = () => {
    switch (state) {
      case "copied":
        return "✓";
      case "error":
        return "✗";
      default:
        return "⧉";
    }
  };

  const getColorClass = () => {
    switch (state) {
      case "copied":
        return "text-green-600";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-400 hover:text-blue-600";
    }
  };

  return (
    <button
      className={`flex items-center hover:bg-blue-50 text-sm leading-none cursor-pointer bg-transparent border-none transition-colors px-1 rounded disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent ${getColorClass()}`}
      onClick={handleCopy}
      disabled={!text}
      aria-label={state === "error" ? "Copy failed" : "Copy translation"}
      type="button"
    >
      {getIcon()}
    </button>
  );
}
