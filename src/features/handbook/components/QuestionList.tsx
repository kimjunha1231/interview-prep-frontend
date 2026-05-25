import React from "react";
import { ChevronDown, BookOpen } from "lucide-react";
import { Skeleton } from "../../../components/ui/Skeleton";
import type { Question } from "../../../types";

interface QuestionListProps {
  selectedCategory: string;
  onChangeCategory: (category: string) => void;
  questions: Question[];
  selectedQuestionId?: number;
  onSelectQuestion: (question: Question) => void;
  loading: boolean;
}

const getSidebarHeader = (key: string): string => {
  const headers: Record<string, string> = {
    "HOME":         "시작 가이드",
    "JAVASCRIPT":   "JavaScript / TypeScript",
    "REACT":        "React / Next.js",
    "HTML_CSS":     "HTML · CSS · 웹 성능",
    "NETWORK":      "네트워크",
    "OS":           "OS · 컴퓨터 구조",
    "DATABASE":     "데이터베이스",
    "BACKEND":      "Java · Spring · DevOps",
    "ARCHITECTURE": "소프트웨어 아키텍처",
    "ALGORITHM":    "자료구조 · 알고리즘",
    "ALL":          "전체 질문 모음",
  };
  return headers[key] || "학습 핸드북";
};

export const QuestionList: React.FC<QuestionListProps> = ({
  selectedCategory,
  questions,
  selectedQuestionId,
  onSelectQuestion,
  loading,
}) => {
  const sidebarHeader = getSidebarHeader(selectedCategory);

  return (
    <section className="w-full md:w-[300px] lg:w-[320px] border-r border-black/5 dark:border-white/5 py-xl px-md md:pr-md flex flex-col gap-md select-none shrink-0 overflow-y-auto max-h-[85vh]">
      {/* Sidebar Header Category Selector Dropdown (Aesthetic Only) */}
      <div className="flex items-center justify-between px-xs py-xxs rounded-md border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors">
        <div className="flex items-center gap-xs">
          <BookOpen className="w-3.5 h-3.5 text-apple-primary dark:text-apple-primary-on-dark" />
          <span className="font-display font-semibold text-[13px] text-apple-ink dark:text-white">
            {sidebarHeader}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-apple-body-muted" />
      </div>
      
      {/* Questions list container */}
      <div className="flex flex-col gap-xxs overflow-y-auto pr-xs">
        {loading ? (
          <Skeleton count={8} className="h-[36px] mb-xxs bg-black/5 dark:bg-white/5" />
        ) : questions.length > 0 ? (
          questions.map((q) => {
            const isActive = selectedQuestionId === q.id;
            // Shorten synthetic card title or keep it clean
            const displayName = q.id === -1 ? "개요" : q.title;

            return (
              <button
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className={`text-left px-sm py-[6px] rounded-md text-[13px] transition-all group w-full flex items-center ${
                  isActive
                    ? "bg-apple-primary/10 text-apple-primary dark:text-apple-primary-on-dark font-semibold border-l-2 border-apple-primary pl-[10px]"
                    : "text-gray-500 dark:text-apple-body-muted hover:text-apple-ink dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                title={q.title}
              >
                <span className="block truncate w-full">
                  {displayName}
                </span>
              </button>
            );
          })
        ) : (
          <div className="text-center py-xxl text-gray-400 dark:text-apple-body-muted text-xs font-mono">
            질문이 없습니다.
          </div>
        )}
      </div>
    </section>
  );
};
