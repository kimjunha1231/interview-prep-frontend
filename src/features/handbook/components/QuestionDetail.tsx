import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpen, ExternalLink, ChevronDown, HelpCircle, Sparkles } from "lucide-react";
import type { Question } from "../../../types";
import { normalizeMarkdown, mdComponents, caveatsComponents } from "../../../utils/markdown";

interface QuestionDetailProps {
  question: Question | null;
  onSwitchMode?: () => void;
}

export const QuestionDetail: React.FC<QuestionDetailProps> = ({ 
  question,
  onSwitchMode
}) => {
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
      {/* 과목 개요 페이지용 와이드 히어로 카드 (Interactive Category Hero Card) */}
      {question.id === -1 && onSwitchMode && (
        <div className="w-full bg-[#0066cc]/5 dark:bg-[#2997ff]/5 border border-[#0066cc]/10 dark:border-[#2997ff]/10 rounded-lg p-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md mb-xs relative overflow-hidden select-none animate-fade-in">
          <div className="absolute -right-16 -top-16 w-32 h-32 bg-apple-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-xxs max-w-[500px]">
            <span className="font-mono text-[10px] uppercase tracking-wider text-apple-primary dark:text-apple-primary-on-dark flex items-center gap-xxs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>실전 트레이닝 (AI Interview)</span>
            </span>
            <h4 className="text-[14px] font-bold text-apple-ink dark:text-white mt-xxs">
              {question.title.replace(" 개요", "")} AI 모의 면접 준비 완료
            </h4>
            <p className="text-[12px] text-gray-500 dark:text-apple-body-muted leading-relaxed mt-xxs">
              개념을 다 익히셨나요? 1:1 대화식 AI 모의 면접으로 실무 역량을 즉시 테스트해 보세요.
            </p>
          </div>
          <button
            type="button"
            onClick={onSwitchMode}
            className="px-md py-xs bg-[#0066cc] hover:bg-[#0071e3] text-white text-[12px] font-bold rounded-md transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0 flex items-center gap-xxs"
          >
            <span>모의 면접 바로가기</span>
            <span>→</span>
          </button>
        </div>
      )}

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
