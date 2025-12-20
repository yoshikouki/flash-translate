import { useState } from "react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string | null;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

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

  return (
    <button
      className={cn(
        "flex items-center hover:bg-blue-50 text-sm leading-none cursor-pointer bg-transparent border-none transition-colors px-1 rounded disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent",
        state == "idle" && "text-gray-400 hover:text-blue-600",
        state == "copied" && "text-green-600",
        state == "error" && "text-red-500",
      )}
      onClick={handleCopy}
      disabled={!text}
      aria-label={state === "error" ? "Copy failed" : "Copy translation"}
      type="button"
    >
      {state == "idle" && "⧉"}
      {state == "copied" && "✓"}
      {state == "error" && "✗"}
    </button>
  );
}
