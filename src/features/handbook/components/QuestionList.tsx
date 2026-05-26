import React, { useRef, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { Skeleton } from "../../../components/ui/Skeleton";
import type { Question } from "../../../types";
import { SUBJECT_MAPS } from "../../../constants/subjects";

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
    "JAVA":         "Java",
    "SPRING":       "Spring",
    "DEVOPS":       "DevOps",
    "ARCHITECTURE": "소프트웨어 아키텍처",
    "ALGORITHM":    "자료구조 · 알고리즘",
    "ALL":          "전체 질문 모음",
    "SEARCH":       "검색 결과",
  };
  return headers[key] || "학습 핸드북";
};

export const QuestionList: React.FC<QuestionListProps> = ({
  selectedCategory,
  onChangeCategory,
  questions,
  selectedQuestionId,
  onSelectQuestion,
  loading,
}) => {
  const sidebarHeader = getSidebarHeader(selectedCategory);
  
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollTop = 0;
    }
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [selectedCategory]);

  return (
    <section ref={sectionRef} className="w-full md:w-[300px] lg:w-[320px] border-r border-black/5 dark:border-white/5 py-xl px-md md:pr-md flex flex-col gap-md select-none shrink-0 overflow-y-auto max-h-[85vh]">
      {/* Sidebar Header Category Title */}
      <div className="flex items-center gap-xs px-xs pb-xxs select-none">
        <BookOpen className="w-4 h-4 text-apple-primary dark:text-apple-primary-on-dark shrink-0" />
        <h3 className="font-display font-bold text-[14px] text-apple-ink dark:text-white">
          {sidebarHeader}
        </h3>
      </div>
      
      {/* Questions list container (Semantic ul with role="list") */}
      <ul ref={containerRef} className="flex flex-col gap-xxs overflow-y-auto pr-xs" role="list">
        {loading ? (
          <div aria-busy="true" aria-live="polite" className="w-full">
            <Skeleton count={8} className="h-[36px] mb-xxs bg-black/5 dark:bg-white/5" />
          </div>
        ) : questions.length > 0 ? (
          questions.map((q) => {
            const isActive = selectedQuestionId === q.id;
            // Shorten synthetic card title or keep it clean
            const displayName = q.id === -1 ? "개요" : q.title;

            // Find subject map for display badge
            const targetSubject = q.subject?.toLowerCase();
            let matchedKey = "";
            let matchedLabel = "";
            
            if (q.id !== -1 && targetSubject) {
              for (const [key, map] of Object.entries(SUBJECT_MAPS)) {
                if (map.subjects && map.subjects.includes(targetSubject)) {
                  matchedKey = key;
                  matchedLabel = map.label;
                  break;
                }
              }
            }

            return (
              <li
                key={q.id}
                className={`flex flex-col gap-xxs p-sm rounded-md transition-all group w-full ${
                  isActive
                    ? "bg-apple-primary/10 border-l-2 border-apple-primary pl-[10px]"
                    : "hover:bg-black/5 dark:hover:bg-white/5 border-l-2 border-transparent pl-[10px]"
                }`}
              >
                {/* Title area (click to select question) */}
                <button
                  onClick={() => onSelectQuestion(q)}
                  className={`text-left text-[13px] font-medium transition-colors w-full focus:outline-none ${
                    isActive
                      ? "text-apple-primary dark:text-apple-primary-on-dark font-semibold"
                      : "text-gray-700 dark:text-apple-body-on-dark hover:text-apple-ink dark:hover:text-white"
                  }`}
                  title={q.title}
                  aria-selected={isActive}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="block line-clamp-2 w-full break-all">
                    {displayName}
                  </span>
                </button>

                {/* Category tag badge (visible only when searching or in 'ALL' list) */}
                {matchedLabel && (selectedCategory === "SEARCH" || selectedCategory === "ALL") && (
                  <div className="flex justify-start mt-xxs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeCategory(matchedKey);
                      }}
                      className="px-xs py-[2px] text-[10px] font-medium rounded-pill bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-gray-400 dark:text-apple-body-muted/80 hover:text-apple-primary dark:hover:text-apple-primary-on-dark hover:border-apple-primary/30 dark:hover:border-apple-primary-on-dark/30 hover:bg-apple-primary/5 dark:hover:bg-apple-primary-on-dark/5 transition-all select-none"
                      aria-label={`${matchedLabel} 과목 질문 필터링`}
                    >
                      {matchedLabel}
                    </button>
                  </div>
                )}
              </li>
            );
          })
        ) : (
          <li className="text-center py-xxl text-gray-400 dark:text-apple-body-muted text-xs font-mono list-none">
            질문이 없습니다.
          </li>
        )}
      </ul>
    </section>
  );
};
