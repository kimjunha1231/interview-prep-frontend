import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpen, ExternalLink, ChevronDown, HelpCircle } from "lucide-react";
import type { Question } from "../../../types";

interface QuestionDetailProps {
  question: Question | null;
}

/**
 * Pre-process markdown text so that CommonMark can parse `**` bold markers
 * even when they wrap Unicode curly-quote characters (' ' " ").
 * Strategy: replace `**'...'**` and `**"..."**` patterns so bold wraps the
 * whole phrase using straight quotes, which the parser handles reliably.
 */
function normalizeMarkdown(text: string): string {
  if (!text) return "";
  // Replace curly single-quotes immediately adjacent to ** with straight ones
  // so the parser sees word characters right after the delimiter run.
  const normalized = text
    .replace(/\*\*\u2018/g, "**'")
    .replace(/\u2019\*\*/g, "'**")
    .replace(/\*\*\u201C/g, '**"')
    .replace(/\u201D\*\*/g, '"**');

  // Fix CommonMark parser limitation: when a closing delimiter ** is preceded by a punctuation (like ')')
  // and immediately followed by a letter (like Korean particles '를', '와'), it fails to parse as bold.
  // We insert a Zero-Width Space (\u200B) BEFORE the closing ** to allow correct bold formatting.
  return normalized.replace(/([\)\].'\",;:!?])\*\*([가-힣a-zA-Z0-9])/g, "$1\u200B**$2");
}

// react-markdown v8: handle `pre` as the outer block wrapper, `code` as the inner
// => code without className → inline; code with className (language-*) → block (inside pre)
const mdComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  // ── Block wrapper for fenced code blocks ──────────────────────────────────
  pre: ({ children }) => (
    <pre className="bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-md px-md py-sm overflow-x-auto my-xs">
      {children}
    </pre>
  ),

  // ── code: inline when no className, block when className exists ───────────
  code: ({ className, children }) => {
    const isBlock = Boolean(className); // 'language-js', 'language-ts' etc.
    if (isBlock) {
      return (
        <code className="font-mono text-[13px] text-[#e6edf3] leading-relaxed whitespace-pre">
          {children}
        </code>
      );
    }
    // Inline code
    return (
      <code className="font-mono text-[13px] bg-apple-primary/5 text-apple-primary dark:bg-apple-surface-tile-1/60 dark:text-apple-primary-on-dark px-[5px] py-[1px] rounded-xs border border-black/5 dark:border-white/5 align-middle">
        {children}
      </code>
    );
  },

  // ── Headings ──────────────────────────────────────────────────────────────
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

  // ── Paragraph ─────────────────────────────────────────────────────────────
  p: ({ children }) => (
    <p className="text-[15px] text-apple-ink dark:text-apple-body-on-dark leading-[1.75] font-body mb-xs">
      {children}
    </p>
  ),

  // ── Lists ─────────────────────────────────────────────────────────────────
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

  // ── Inline emphasis ───────────────────────────────────────────────────────
  strong: ({ children }) => (
    <strong className="font-semibold text-apple-ink dark:text-white">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-gray-500 dark:text-apple-body-muted">{children}</em>
  ),

  // ── Blockquote ────────────────────────────────────────────────────────────
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

  // ── Table ─────────────────────────────────────────────────────────────────
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
const caveatsComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
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
    </li>
  ),
  ul: ({ children }) => <ul className="flex flex-col gap-[2px] mb-xs">{children}</ul>,
  ol: ({ children }) => <ol className="flex flex-col gap-[2px] mb-xs">{children}</ol>,
};

export const QuestionDetail: React.FC<QuestionDetailProps> = ({ question }) => {
  const [openHints, setOpenHints] = useState<Record<number, boolean>>({});

  useEffect(() => {
    Promise.resolve().then(() => {
      setOpenHints({});
    });
  }, [question]);

  if (!question) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-black/10 dark:border-white/10 rounded-lg p-xxl text-gray-500 dark:text-apple-body-muted min-h-[50vh] bg-apple-canvas-parchment dark:bg-apple-surface-black/30 transition-colors duration-200">
        <BookOpen className="w-8 h-8 mb-sm opacity-40 text-apple-primary dark:text-apple-primary-on-dark" />
        <p className="text-[14px] font-mono tracking-tight text-center max-w-[400px]">
          상단 카테고리를 선택한 후, 왼쪽 리스트에서 질문을 클릭하면 상세한 시니어 기술 가이드라인이 표시됩니다.
        </p>
      </div>
    );
  }

  const displayCategory = question.category === "OVERVIEW" ? "안내" : question.category;

  return (
    <article className="flex-1 flex flex-col gap-lg max-w-[800px] mx-auto w-full">
      {/* Topic badge + title */}
      <header className="flex flex-col gap-xs border-b border-black/5 dark:border-white/5 pb-md">
        <div className="flex items-center gap-xs">
          <span className="px-xs py-[2px] bg-apple-primary/10 text-apple-primary dark:text-apple-primary-on-dark font-mono text-[10px] rounded-pill border border-apple-primary/20 uppercase tracking-widest">
            {displayCategory} · {question.subject}
          </span>
        </div>
        <h1 className="text-[24px] md:text-[30px] font-semibold text-apple-ink dark:text-white leading-tight font-display tracking-tight mt-xs">
          {question.title}
        </h1>
      </header>

      {/* Summary box — rendered via ReactMarkdown to support **bold** */}
      {question.summary && (
        <section
          id="section-summary"
          className="bg-black/5 dark:bg-apple-surface-tile-1/30 border-l-[3px] border-apple-primary p-md rounded-r-md"
        >
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-apple-primary dark:text-apple-primary-on-dark mb-xxs">
            핵심 요약 (Key Summary)
          </h3>
          <div className="text-[15px] italic text-gray-500 dark:text-apple-body-muted leading-relaxed font-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Inline-only: strip block wrappers so text stays italic
                p: ({ children }) => <span>{children}</span>,
                strong: ({ children }) => (
                  <strong className="font-semibold not-italic text-apple-ink dark:text-apple-body-on-dark">{children}</strong>
                ),
                code: ({ children }) => (
                  <code className="font-mono text-[13px] bg-apple-primary/5 text-apple-primary dark:bg-apple-surface-tile-1/60 dark:text-apple-primary-on-dark px-[4px] py-[1px] rounded-xs border border-black/5 dark:border-white/5 not-italic align-middle">
                    {children}
                  </code>
                ),
              }}
            >
              {normalizeMarkdown(question.summary)}
            </ReactMarkdown>
          </div>
        </section>
      )}

      {/* Explanation — full markdown rendering */}
      {question.explanation && (
        <section id="section-explanation" className="flex flex-col">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-apple-body-muted border-b border-black/5 dark:border-white/5 pb-xxs mb-sm">
            상세 가이드라인 (Detailed Guide)
          </h3>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {normalizeMarkdown(question.explanation)}
          </ReactMarkdown>
        </section>
      )}

      {/* Caveats — red-accented bullet style */}
      {question.caveats && (
        <section
          id="section-caveats"
          className="bg-red-500/5 dark:bg-red-950/10 border border-red-500/10 p-md rounded-md"
        >
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-red-500 dark:text-red-400 mb-xs">
            주요 주의사항 (Caveats)
          </h3>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={caveatsComponents}>
            {normalizeMarkdown(question.caveats)}
          </ReactMarkdown>
        </section>
      )}

      {/* Tail questions */}
      {question.tailQuestions && question.tailQuestions.length > 0 && (
        <section id="section-tails" className="flex flex-col gap-md">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-apple-body-muted border-b border-black/5 dark:border-white/5 pb-xxs mb-xs">
            예상 꼬리 질문 (Anticipated Follow-up Questions)
          </h3>
          <div className="flex flex-col gap-sm">
            {question.tailQuestions.map((tq, tqIdx) => {
              const isOpen = !!openHints[tqIdx];
              return (
                <div
                  key={tqIdx}
                  className="bg-black/5 dark:bg-apple-surface-tile-1/20 border border-black/5 dark:border-white/5 rounded-lg overflow-hidden transition-all duration-200"
                >
                  {/* Question Row (Header of Card) - Semantic Button */}
                  <button
                    type="button"
                    id={`hint-btn-${tqIdx}`}
                    aria-expanded={isOpen}
                    aria-controls={`hint-panel-${tqIdx}`}
                    className="w-full text-left p-md flex items-start justify-between gap-md hover:bg-black/5 dark:hover:bg-white/5 select-none focus:outline-none focus:ring-1 focus:ring-apple-primary/20 rounded-t-lg transition-colors"
                    onClick={() => {
                      setOpenHints(prev => ({
                        ...prev,
                        [tqIdx]: !prev[tqIdx]
                      }));
                    }}
                  >
                    <div className="flex gap-xs items-start">
                      <span className="font-display font-bold text-apple-primary dark:text-apple-primary-on-dark text-[15px] mt-[1px]">Q.</span>
                      <span className="text-[15px] font-semibold text-apple-ink dark:text-white leading-relaxed">
                        {tq.question}
                      </span>
                    </div>
                    <div
                      className="text-gray-500 dark:text-apple-body-muted hover:text-apple-ink dark:hover:text-white transition-colors shrink-0 mt-[2px]"
                      aria-hidden="true"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-apple-primary dark:text-apple-primary-on-dark" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Answer / Hint Panel (Collapsible) - Semantic Region */}
                  {isOpen && (
                    <div 
                      id={`hint-panel-${tqIdx}`}
                      role="region"
                      aria-labelledby={`hint-btn-${tqIdx}`}
                      className="px-md pb-md pt-xs border-t border-black/5 dark:border-white/5 bg-apple-canvas-parchment dark:bg-apple-surface-tile-2/20 text-gray-500 dark:text-apple-body-muted text-[13.5px] leading-[1.65]"
                    >
                      <div className="flex items-center gap-xs text-[11px] font-mono text-apple-primary dark:text-apple-primary-on-dark mb-sm select-none">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>모범 힌트 & 해설</span>
                      </div>
                      <div className="markdown-hint">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                          {normalizeMarkdown(tq.answer)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* References */}
      {question.references && question.references.length > 0 && (
        <section id="section-references" className="border-t border-black/5 dark:border-white/5 pt-md mt-sm select-none">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-apple-body-muted mb-xs">
            공식 레퍼런스 (Authority References)
          </h3>
          <div className="flex flex-wrap gap-xs">
            {question.references.map((ref, rIdx) => (
              <a
                key={rIdx}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-xs px-sm py-[6px] bg-black/5 dark:bg-apple-surface-tile-1/40 border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/20 text-apple-primary dark:text-apple-primary-on-dark rounded-md text-[13px] font-medium transition-all"
                aria-label={`${ref.name} (새 창에서 열기)`}
              >
                <span>{ref.name}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
