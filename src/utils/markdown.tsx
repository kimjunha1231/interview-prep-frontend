import React from "react";
import ReactMarkdown from "react-markdown";

/**
 * Pre-process markdown text so that CommonMark can parse `**` bold markers
 * even when they wrap Unicode curly-quote characters (' ' " ").
 */
export function normalizeMarkdown(text: string): string {
  if (!text) return "";
  const normalized = text
    .replace(/\*\*\u2018/g, "**'")
    .replace(/\u2019\*\*/g, "'**")
    .replace(/\*\*\u201C/g, '**"')
    .replace(/\u201D\*\*/g, '"**');

  return normalized.replace(/([\)\].'\",;:!?])\*\*([가-힣a-zA-Z0-9])/g, "$1\u200B**$2");
}

// Unified custom renderers for react-markdown
export const mdComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  pre: ({ children }) => (
    <pre className="bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-md px-md py-sm overflow-x-auto my-xs">
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    const isBlock = Boolean(className);
    if (isBlock) {
      return (
        <code className="font-mono text-[13px] text-[#e6edf3] leading-relaxed whitespace-pre">
          {children}
        </code>
      );
    }
    return (
      <code className="font-mono text-[13px] bg-apple-primary/5 text-apple-primary dark:bg-apple-surface-tile-1/60 dark:text-apple-primary-on-dark px-[5px] py-[1px] rounded-xs border border-black/5 dark:border-white/5 align-middle">
        {children}
      </code>
    );
  },
  h1: ({ children }) => (
    <h2 className="text-[20px] font-semibold font-display text-apple-ink dark:text-white mt-lg mb-xs leading-snug tracking-tight">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h3 className="text-[17px] font-semibold font-display text-apple-ink dark:text-white mt-md mb-xxs leading-snug tracking-tight border-b border-black/5 dark:border-white/5 pb-xxs">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="text-[15px] font-semibold font-display text-apple-primary dark:text-apple-primary-on-dark mt-sm mb-xxs leading-snug">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-[15px] text-apple-ink dark:text-apple-body-on-dark leading-[1.75] font-body mb-xs">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside flex flex-col gap-[2px] mb-xs pl-lg">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside flex flex-col gap-[2px] mb-xs pl-lg">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-[14.5px] text-gray-500 dark:text-apple-body-muted leading-[1.75] font-body marker:text-apple-primary dark:marker:text-apple-primary-on-dark">
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-apple-ink dark:text-white">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-gray-500 dark:text-apple-body-muted">{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-[3px] border-apple-primary/40 pl-md bg-black/5 dark:bg-apple-surface-tile-1/20 rounded-r-md py-xs my-xs">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-black/5 dark:border-white/5 my-md" />,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-apple-primary dark:text-apple-primary-on-dark underline underline-offset-2 hover:opacity-80 transition-opacity"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-xs">
      <table className="w-full text-[13.5px] border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-black/5 dark:bg-apple-surface-tile-1/40 text-gray-500 dark:text-apple-body-muted">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-black/5 dark:border-b border-white/5">{children}</tr>,
  th: ({ children }) => (
    <th className="text-left px-sm py-xs font-semibold text-[11px] uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-sm py-[6px] text-apple-ink dark:text-apple-body-on-dark">{children}</td>
  ),
};

// Caveats variant: red bullet style
export const caveatsComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  ...mdComponents,
  p: ({ children }) => (
    <p className="text-[14px] text-gray-500 dark:text-apple-body-muted leading-[1.75] font-body mb-[6px] flex gap-xs items-start">
      <span className="text-red-400 mt-[4px] shrink-0 text-[10px]">▸</span>
      <span>{children}</span>
    </p>
  ),
  li: ({ children }) => (
    <li className="text-[14px] text-gray-500 dark:text-apple-body-muted leading-[1.75] font-body flex gap-xs items-start list-none">
      <span className="text-red-400 mt-[4px] shrink-0 text-[10px]">▸</span>
      <span>{children}</span>
    </    li>
  ),
  ul: ({ children }) => <ul className="flex flex-col gap-[2px] mb-xs">{children}</ul>,
  ol: ({ children }) => <ol className="flex flex-col gap-[2px] mb-xs">{children}</ol>,
};
