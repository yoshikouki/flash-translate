import ReactMarkdown from "react-markdown";

interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="mb-2 font-bold text-lg">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-2 font-bold text-base">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-1 font-semibold text-sm">{children}</h3>
        ),
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => (
          <ul className="mb-2 list-inside list-disc">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 list-inside list-decimal">{children}</ol>
        ),
        li: ({ children }) => <li className="mb-1">{children}</li>,
        code: ({ children }) => (
          <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="mb-2 overflow-x-auto rounded bg-gray-100 p-2">
            {children}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mb-2 border-gray-300 border-l-4 pl-3 text-gray-600 italic">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            className="text-blue-600 underline hover:text-blue-800"
            href={href}
            rel="noopener noreferrer"
            target="_blank"
          >
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        hr: () => <hr className="my-3 border-gray-200" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
