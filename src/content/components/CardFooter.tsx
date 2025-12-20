import { CopyButton } from "./CopyButton";

interface CardFooterProps {
  result: string | null;
}

export function CardFooter({ result }: CardFooterProps) {
  return (
    <div
      className="flex items-stretch px-3 border-t border-none rounded-b-xl"
      style={{ minHeight: "36px", justifyContent: "flex-end" }}
    >
      <CopyButton text={result} />
    </div>
  );
}
