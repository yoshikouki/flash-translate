import { CopyButton } from "./copy-button";

interface CardFooterProps {
  result: string | null;
}

export function CardFooter({ result }: CardFooterProps) {
  return (
    <div
      className="flex items-stretch rounded-b-xl border-t border-none px-3"
      style={{ minHeight: "36px", justifyContent: "flex-end" }}
    >
      <CopyButton text={result} />
    </div>
  );
}
