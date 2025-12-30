import { CopyButton } from "./copy-button";

interface TranslationCardFooterProps {
  result: string | null;
}

export function TranslationCardFooter({ result }: TranslationCardFooterProps) {
  return (
    <div
      className="flex items-stretch rounded-b-xl border-t border-none px-3"
      style={{ minHeight: "36px", justifyContent: "flex-end" }}
    >
      <CopyButton text={result} />
    </div>
  );
}
