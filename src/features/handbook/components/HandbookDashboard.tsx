import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { QuestionList } from "./QuestionList";
import { QuestionDetail } from "./QuestionDetail";
import { apiService } from "../../../services/api";
import { SUBJECT_MAPS } from "../../../constants/subjects";
import { getSyntheticOverview } from "../../../constants/overviews";
import type { Question } from "../../../types";
import { SEO } from "../../../components/SEO";

interface HandbookDashboardProps {
  onSwitchMode: () => void;
  isActive?: boolean;
}

export const HandbookDashboard: React.FC<HandbookDashboardProps> = ({ onSwitchMode, isActive }) => {
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string>("ALL");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const initialQuestionRef = useRef<Question | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);

  // Search input focus hotkey (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle questionId query parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryQuestionId = params.get("questionId");
    
    if (queryQuestionId) {
      const qId = parseInt(queryQuestionId, 10);
      if (!isNaN(qId)) {
        apiService.getQuestion(qId)
          .then((question) => {
            initialQuestionRef.current = question;
            
            // Find matched category in SUBJECT_MAPS
            const targetSubject = question.subject.toLowerCase();
            let matchedKey = "ALL";
            
            for (const [key, map] of Object.entries(SUBJECT_MAPS)) {
              if (map.subjects && map.subjects.includes(targetSubject)) {
                matchedKey = key;
                break;
              }
            }
            
            setSelectedSubjectKey(matchedKey);
            
            // Clean up the URL parameter
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({ path: newUrl }, "", newUrl);
          })
          .catch((err) => {
            console.error("Failed to load initial question from URL parameter:", err);
          });
      }
    }
  }, []);

  // TanStack Query to load and cache questions based on subject key
  const { data: questionsData = [], isLoading: loadingQuestions } = useQuery<Question[]>({
    queryKey: ["questions", selectedSubjectKey],
    queryFn: async () => {
      const mapping = SUBJECT_MAPS[selectedSubjectKey];
      const fetchPromises: Promise<Question[]>[] = [];
      
      if (mapping.category && !mapping.subjects) {
        fetchPromises.push(apiService.getQuestions(mapping.category, undefined));
      } else if (mapping.subjects) {
        mapping.subjects.forEach(sub => {
          fetchPromises.push(apiService.getQuestions(undefined, sub));
        });
      } else {
        fetchPromises.push(apiService.getQuestions(undefined, undefined));
      }

      const results = await Promise.all(fetchPromises);
      
      const merged: Question[] = [];
      const seenIds = new Set<number>();
      
      results.forEach(list => {
        list.forEach(q => {
          if (!seenIds.has(q.id)) {
            seenIds.add(q.id);
            merged.push(q);
          }
        });
      });

      const overviewQ = getSyntheticOverview(selectedSubjectKey);
      
      // Inject initialQuestion if it belongs to this category to prevent blank selections
      if (initialQuestionRef.current) {
        const targetSub = initialQuestionRef.current.subject.toLowerCase();
        const isMatchedCategory = mapping.subjects && mapping.subjects.includes(targetSub);
        const isAllCategory = selectedSubjectKey === "ALL";
        
        if (isMatchedCategory || isAllCategory) {
          const exists = merged.some(q => q.id === initialQuestionRef.current?.id);
          if (!exists) {
            return [overviewQ, initialQuestionRef.current, ...merged];
          }
        }
      }

      return [overviewQ, ...merged];
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Load ALL questions for background cache and global search
  const { data: allQuestions = [] } = useQuery<Question[]>({
    queryKey: ["questions", "ALL"],
    queryFn: async () => {
      const results = await apiService.getQuestions(undefined, undefined);
      const overviewQ = getSyntheticOverview("ALL");
      return [overviewQ, ...results];
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Keep selectedQuestion in sync with category switch or custom query param load
  useEffect(() => {
    if (loadingQuestions || questionsData.length === 0) return;

    const overviewQ = questionsData[0]; // Overview is always index 0
    
    if (initialQuestionRef.current) {
      const targetSub = initialQuestionRef.current.subject.toLowerCase();
      const activeMap = SUBJECT_MAPS[selectedSubjectKey];
      const isMatchedCategory = activeMap.subjects && activeMap.subjects.includes(targetSub);
      const isAllCategory = selectedSubjectKey === "ALL";
      
      if (isMatchedCategory || isAllCategory) {
        setSelectedQuestion(initialQuestionRef.current);
      } else {
        setSelectedQuestion(overviewQ);
      }
      initialQuestionRef.current = null; // Consume ref
    } else {
      const isStillAvailable = questionsData.some(q => q.id === selectedQuestion?.id && q.id !== -1);
      if (!isStillAvailable) {
        setSelectedQuestion(overviewQ);
      }
    }
  }, [selectedSubjectKey, questionsData, loadingQuestions]);

  // Scroll to top of main panel when selected question changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [selectedQuestion]);

  // Client-side filtering logic
  const filteredQuestions = (searchQuery.trim() ? allQuestions : questionsData).filter(q => {
    if (!searchQuery.trim()) {
      if (q.id === -1) return true; // Keep synthetic overview always
      return true;
    }
    // If search query is present, do not show synthetic overview card
    if (q.id === -1) return false;
    
    const query = searchQuery.toLowerCase();
    return (
      q.title.toLowerCase().includes(query) ||
      (q.summary && q.summary.toLowerCase().includes(query)) ||
      (q.explanation && q.explanation.toLowerCase().includes(query)) ||
      (q.perfectAnswer && q.perfectAnswer.toLowerCase().includes(query)) ||
      (q.caveats && q.caveats.toLowerCase().includes(query)) ||
      q.subject.toLowerCase().includes(query)
    );
  });

  // TOC parsing
  const getTocItems = (q: Question | null) => {
    if (!q) return [];
    const items = [];
    if (q.summary) items.push({ id: "section-summary", label: "요약" });
    if (q.explanation) items.push({ id: "section-explanation", label: "상세 설명" });
    if (q.caveats) items.push({ id: "section-caveats", label: "주의 사항" });
    if (q.tailQuestions && q.tailQuestions.length > 0) items.push({ id: "section-tails", label: "추천 꼬리 질문" });
    if (q.references && q.references.length > 0) items.push({ id: "section-references", label: "참고자료" });
    return items;
  };

  const tocItems = getTocItems(selectedQuestion);

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white dark:bg-black transition-colors duration-200">
      {isActive && (
        <SEO
          title={
            selectedQuestion && selectedQuestion.id !== -1 
              ? selectedQuestion.title 
              : (selectedSubjectKey === "ALL" 
                  ? undefined 
                  : (SUBJECT_MAPS[selectedSubjectKey] ? `${SUBJECT_MAPS[selectedSubjectKey].label} 면접 준비` : undefined)
                )
          }
          description={
            selectedQuestion && selectedQuestion.id !== -1 
              ? selectedQuestion.summary 
              : (selectedSubjectKey === "ALL" 
                  ? undefined 
                  : (SUBJECT_MAPS[selectedSubjectKey] ? `${SUBJECT_MAPS[selectedSubjectKey].label} 관련 기술 면접 핵심 개념 학습 및 대표 질문 리스트를 확인해보세요.` : undefined)
                )
          }
          question={selectedQuestion && selectedQuestion.id !== -1 ? selectedQuestion : null}
        />
      )}
      {/* 1. Dynamic category sub-nav header */}
      <header className="bg-white/80 dark:bg-apple-surface-tile-1/80 backdrop-blur-md text-apple-ink dark:text-apple-body-on-dark h-[46px] px-lg flex items-center justify-between sticky top-[52px] z-40 border-b border-black/5 dark:border-white/5 select-none transition-colors duration-200 gap-md">
        {/* Categories Menu */}
        <nav className="flex-1 min-w-0 flex items-center justify-start md:justify-center gap-xs overflow-x-auto scrollbar-none" aria-label="Subject navigation">
          {Object.entries(SUBJECT_MAPS).map(([key, map]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedSubjectKey(key);
                setSearchQuery(""); // Clear search on category switch
                setMobileView("list"); // Return to list view on category change
              }}
              className={`px-sm py-xs text-[12px] font-medium transition-colors whitespace-nowrap ${
                selectedSubjectKey === key
                  ? "text-apple-primary dark:text-apple-primary-on-dark font-semibold border-b-2 border-apple-primary"
                  : "text-gray-500 dark:text-apple-body-muted hover:text-apple-ink dark:hover:text-white"
              }`}
            >
              {map.label}
            </button>
          ))}
        </nav>

        {/* Right Search */}
        <div className="flex items-center gap-sm shrink-0">
          {/* Header search bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-xs top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-apple-body-muted/60" />
            <label htmlFor="handbook-search-input" className="sr-only">
              질문 검색
            </label>
            <input
              ref={searchInputRef}
              id="handbook-search-input"
              type="text"
              placeholder="검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-apple-canvas-parchment dark:bg-apple-surface-black border border-black/10 dark:border-white/10 rounded-md py-[4px] pl-[26px] pr-[38px] text-[12px] text-apple-ink dark:text-white placeholder-gray-400 dark:placeholder-apple-body-muted/50 focus:outline-none focus:border-apple-primary w-[100px] lg:w-[150px] transition-all"
            />
            <span className="absolute right-xs top-1/2 -translate-y-1/2 text-[9px] font-mono text-gray-400 dark:text-apple-body-muted/60 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-xs py-[1px] rounded pointer-events-none select-none">
              ⌘K
            </span>
          </div>
        </div>
      </header>

      {/* 2. Three-column layout */}
      <div className="flex-1 flex w-full max-w-[1440px] mx-auto min-h-[calc(100vh-142px)]">
        {/* Mobile search bar */}
        <div className={`p-md sm:hidden border-b border-black/5 dark:border-white/5 bg-apple-canvas-parchment dark:bg-apple-surface-black/30 w-full ${mobileView === "detail" ? "hidden" : "block"}`}>
          <div className="relative">
            <Search className="absolute left-xs top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-apple-body-muted/60" />
            <input
              type="text"
              placeholder="핸드북 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-apple-canvas-parchment dark:bg-apple-surface-black border border-black/10 dark:border-white/10 rounded-md py-[6px] pl-[28px] pr-md text-[13px] text-apple-ink dark:text-white placeholder-gray-400 dark:placeholder-apple-body-muted/50 focus:outline-none focus:border-apple-primary"
            />
          </div>
        </div>

        {/* Column A: Left Sidebar (Question List) */}
        <div className={`w-full md:w-auto ${mobileView === "detail" ? "hidden md:block" : "block"}`}>
          <QuestionList
            selectedCategory={searchQuery.trim() ? "SEARCH" : selectedSubjectKey}
            onChangeCategory={(key) => {
              setSelectedSubjectKey(key);
              setSearchQuery(""); // Clear search query to restore clean category view
            }}
            questions={filteredQuestions}
            selectedQuestionId={selectedQuestion?.id}
            onSelectQuestion={(q) => {
              setSelectedQuestion(q);
              if (q && q.id !== -1) {
                setMobileView("detail");
                // 글로벌 검색 유입 시, 해당 질문에 매핑된 카테고리 탭으로 자동 스위칭 및 검색어 초기화
                if (searchQuery.trim()) {
                  const targetSubject = q.subject.toLowerCase();
                  let matchedKey = "ALL";
                  for (const [key, map] of Object.entries(SUBJECT_MAPS)) {
                    if (map.subjects && map.subjects.includes(targetSubject)) {
                      matchedKey = key;
                      break;
                    }
                  }
                  if (matchedKey !== selectedSubjectKey) {
                    setSelectedSubjectKey(matchedKey);
                  }
                  setSearchQuery(""); // Clear search to restore default category list view
                }
              }
            }}
            loading={loadingQuestions}
          />
        </div>

        {/* Column B: Center content (Detail Panel) */}
        <main ref={mainContentRef} className={`flex-1 px-lg py-xl border-r border-black/5 dark:border-white/5 overflow-y-auto max-h-[calc(100vh-120px)] transition-colors duration-200 ${mobileView === "list" ? "hidden md:block" : "block"}`}>
          {/* Mobile Back to List Button */}
          {mobileView === "detail" && (
            <div className="md:hidden mb-md flex items-center">
              <button
                onClick={() => setMobileView("list")}
                className="text-[13px] font-semibold text-apple-primary dark:text-apple-primary-on-dark flex items-center gap-xxs active:scale-95 transition-transform"
              >
                <span>← 질문 목록으로</span>
              </button>
            </div>
          )}
          <QuestionDetail 
            question={selectedQuestion} 
            onSwitchMode={onSwitchMode}
          />
        </main>

        {/* Column C: Right Sidebar (Table of Contents & Daily Newsletter) */}
        <aside className="hidden lg:block w-[18%] p-lg select-none">
          <div className="sticky top-[118px] flex flex-col gap-lg">
            {tocItems.length > 0 && (
              <nav className="flex flex-col gap-sm" aria-label="Table of contents">
                <span className="font-display font-semibold text-[11px] tracking-wider uppercase text-gray-400 dark:text-apple-body-muted">
                  목차 (On this page)
                </span>
                <ul className="flex flex-col gap-xs border-l border-black/5 dark:border-white/5 pl-xxs">
                  {tocItems.map(item => (
                    <li key={item.id}>
                      <button
                        onClick={() => handleScrollToSection(item.id)}
                        className="text-left w-full text-[12px] text-gray-500 dark:text-apple-body-muted hover:text-apple-ink dark:hover:text-white hover:border-l hover:border-black/20 dark:hover:border-white/20 pl-sm py-[2px] transition-all truncate"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {/* 목차만 남기고 데일리 면접 챌린지 구독 폼 제거 */}
          </div>
        </aside>
      </div>
    </div>
  );
};
