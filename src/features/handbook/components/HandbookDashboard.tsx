import React, { useState, useEffect, useRef } from "react";
import { Search, UserCheck } from "lucide-react";
import { QuestionList } from "./QuestionList";
import { QuestionDetail } from "./QuestionDetail";
import { apiService } from "../../../services/api";
import type { Question } from "../../../types";
import { Button } from "../../../components/ui/Button";

interface HandbookDashboardProps {
  onSwitchMode: () => void;
}

interface SubjectMap {
  label: string;
  subjects?: string[];
  category?: string;
}

// Option B: full subject coverage — maps every actual subject in questions.json
const SUBJECT_MAPS: Record<string, SubjectMap> = {
  "HOME":       { label: "홈" },
  "JAVASCRIPT": { label: "JavaScript",  subjects: ["javascript", "typescript"] },
  "REACT":      { label: "React",        subjects: ["react", "nextjs"] },
  "HTML_CSS":   { label: "HTML/CSS",     subjects: ["html_css", "web_performance"] },
  "NETWORK":    { label: "네트워크",     subjects: ["network"] },
  "OS":         { label: "OS·시스템",   subjects: ["os", "computer_architecture"] },
  "DATABASE":   { label: "데이터베이스", subjects: ["database"] },
  "BACKEND":    { label: "백엔드",       subjects: ["java", "spring", "devops"] },
  "ARCHITECTURE":{ label: "아키텍처",   subjects: ["software_engineering", "system_design", "design_pattern"] },
  "ALGORITHM":  { label: "알고리즘",     subjects: ["algorithm", "data_structure"] },
  "ALL":        { label: "전체 질문" },
};

const getSyntheticOverview = (subjectKey: string): Question => {
  const overviews: Record<string, { title: string; summary: string; explanation: string; caveats: string }> = {
    "HOME": {
      title: "Handbooks 개요",
      summary: "Interview Handbook 개념 학습 안내 가이드",
      explanation: "Interview Handbook 개념 학습 핸드북에 오신 것을 환영합니다!\n\n본 핸드북은 **JavaScript, React, 네트워크, OS, 데이터베이스, 백엔드(Java/Spring), 아키텍처, 알고리즘** 등 400개 이상의 기술 면접 문항을 마크다운 기반 개발 문서 형식으로 명쾌하게 해설한 학습실입니다.\n\n상단의 카테고리 네비게이션을 통해 원하는 과목으로 즉시 이동하여 질문 목록을 탐색하고 개별 핵심 요약, 상세 설명, 그리고 면접 시 실수하기 쉬운 주의 사항을 미리 숙지해 보세요.",
      caveats: "본 개념 학습실에 기재된 모범 답안들은 모의 면접(Mock Interview) 세션에서 AI 면접관이 채점 기준을 산출할 때의 뼈대로 적용됩니다.\n\n암기식 대답을 지양하고, 원리 이해 및 실제 실무 트레이드오프 경험을 곁들여 나만의 언어로 정리하는 훈련을 권장합니다."
    },
    "JAVASCRIPT": {
      title: "JavaScript / TypeScript 개요",
      summary: "자바스크립트(JavaScript)의 핵심 원리와 TypeScript 타입 시스템 학습 가이드",
      explanation: "자바스크립트는 웹 브라우저뿐만 아니라 Node.js를 통해 서버 사이드에서도 실행되는 현대 웹의 핵심 프로그래밍 언어입니다.\n\n본 과목(총 **123개** 문항)에서는 자바스크립트의 실행 엔진 동작 원리(Call Stack, Execution Context, Event Loop)부터 시작해 프로토타입 기반 상속, 클로저, 비동기 처리, 그리고 TypeScript의 타입 추론 및 제네릭 등 기술 면접에서 단골로 출제되는 핵심 이론을 다룹니다.",
      caveats: "V8 엔진의 내부 최적화 기법(Hidden Class, Inline Cache 등)은 브라우저 엔진에 종속적이므로 표준 ECMA 스펙과 구분하여 이해해야 합니다.\n\n마이크로태스크(Microtask)와 매크로태스크(Macrotask)의 실행 우선순위 차이는 비동기 디버깅 시 자주 발생하는 실수이므로 명확히 인지하세요."
    },
    "REACT": {
      title: "React / Next.js 개요",
      summary: "현대 선언적 웹 UI 라이브러리인 React의 코어 메커니즘과 Next.js 앱 라우팅",
      explanation: "React는 컴포넌트 기반의 선언적 프로그래밍 모델을 제시하며 웹 프론트엔드 생태계를 주도해 왔습니다.\n\n본 과목(총 **35개** 문항)에서는 React의 Virtual DOM 렌더링 최적화, Reconciliation 알고리즘, Hooks의 내부 구현 원리, 그리고 Next.js의 App Router, RSC(React Server Components), SSR/SSG/ISR 전략 등 고급 프론트엔드 아키텍처 이론을 명쾌하게 파헤칩니다.",
      caveats: "Virtual DOM이 무조건 일반 DOM보다 빠르다는 오해는 지양해야 합니다. 비교 연산 오버헤드가 발생할 수 있으므로 최적화 시점을 정확히 판단해야 합니다.\n\nHook은 오직 React 함수형 컴포넌트 내부 및 커스텀 Hook 내에서만 호출되어야 하는 실행 규칙(Rule of Hooks)이 존재합니다."
    },
    "HTML_CSS": {
      title: "HTML / CSS · 웹 성능 개요",
      summary: "웹 표준·레이아웃 시스템, 웹 접근성, 그리고 Core Web Vitals 최적화",
      explanation: "HTML과 CSS는 웹 인터페이스의 뼈대와 디자인을 결정하는 웹 표준 기술입니다.\n\n본 과목(총 **33개** 문항)에서는 시맨틱 HTML을 활용한 SEO 최적화와 웹 접근성(a11y) 보장법, CSS Flexbox 및 Grid 레이아웃의 실무적 적용, 브라우저 하드웨어 가속을 활용한 렌더링 성능 최적화, 그리고 LCP·CLS·INP·TTFB 등 Core Web Vitals 지표 개선 전략을 다룹니다.",
      caveats: "CSS 애니메이션 구현 시 `width`/`height` 대신 `transform`/`opacity`를 사용해야 리플로우(Reflow)와 리페인트(Repaint)를 건너뛰고 GPU 가속을 통해 60fps 프레임을 부드럽게 확보할 수 있습니다.\n\n웹 접근성은 스크린 리더 지원에만 머무르지 않고, 적절한 명도 대비 및 키보드 초점 이동 규칙을 보장하는 것이 포함됩니다."
    },
    "NETWORK": {
      title: "네트워크 개요",
      summary: "HTTP, TCP/IP, DNS, 보안 프로토콜 등 웹 통신의 근간",
      explanation: "네트워크는 모든 웹 애플리케이션의 기반이 되는 통신 인프라입니다.\n\n본 과목(총 **71개** 문항)에서는 TCP/IP 4계층 모델, HTTP/1.1 → HTTP/2 → HTTP/3(QUIC) 프로토콜 진화 과정, DNS 조회 과정, TLS/SSL 핸드셰이크, CORS, 웹소켓, REST vs GraphQL 등 실무 및 면접에서 빈출되는 네트워크 이론 전반을 다룹니다.",
      caveats: "HTTP/2의 멀티플렉싱은 Head-of-Line Blocking(HOLB)을 해소하지만, HTTP/3(QUIC)은 이를 UDP 기반 전송으로 더욱 개선합니다. 두 프로토콜의 차이를 명확히 구분하세요.\n\nCORS는 서버가 브라우저에게 허용 출처를 알려주는 메커니즘입니다. 서버 설정 문제이지 클라이언트 측에서 우회할 수 없다는 점을 명심하세요."
    },
    "OS": {
      title: "OS · 컴퓨터 구조 개요",
      summary: "운영체제 핵심 원리, 프로세스/스레드, 메모리 관리, 컴퓨터 아키텍처",
      explanation: "운영체제(OS)는 하드웨어와 소프트웨어 사이의 인터페이스로, 모든 프로그램의 실행 기반을 제공합니다.\n\n본 과목(총 **37개** 문항)에서는 프로세스와 스레드의 차이, 컨텍스트 스위칭, 데드락(Deadlock), 메모리 관리(가상 메모리, 페이징, 세그멘테이션), CPU 스케줄링 알고리즘 등 CS 전공 필수 이론을 다룹니다. 또한 컴퓨터 구조(CPU 파이프라이닝, 캐시 메모리, 명령어 집합 구조)도 함께 학습합니다.",
      caveats: "프론트엔드 관점에서 브라우저는 멀티 프로세스 구조(Browser, Renderer, GPU, Network 프로세스)를 갖습니다. 이 구조를 이해하면 웹 성능 디버깅에 큰 도움이 됩니다.\n\n동시성(Concurrency)과 병렬성(Parallelism)의 차이, 그리고 자바스크립트의 단일 스레드 이벤트 루프와의 관계를 명확히 설명할 수 있어야 합니다."
    },
    "DATABASE": {
      title: "데이터베이스 개요",
      summary: "관계형 DB, SQL, 트랜잭션, 인덱싱, NoSQL 전략",
      explanation: "데이터베이스는 애플리케이션의 상태를 영속적으로 저장하고 조회하는 핵심 인프라입니다.\n\n본 과목(총 **22개** 문항)에서는 관계형 데이터베이스(RDBMS)의 ACID 트랜잭션 속성, 정규화(Normalization), 인덱스(Index) 원리와 B-Tree 구조, 실행 계획(Explain) 분석법, 그리고 NoSQL(MongoDB, Redis) 사용 전략 등을 다룹니다.",
      caveats: "인덱스는 읽기 성능을 향상시키지만 쓰기 성능을 저하시킵니다. 과도한 인덱스 생성은 오히려 역효과를 낳을 수 있습니다.\n\nN+1 쿼리 문제는 ORM 사용 시 가장 자주 발생하는 성능 이슈입니다. `JOIN` 또는 `Eager Loading` 전략으로 해결할 수 있습니다."
    },
    "BACKEND": {
      title: "백엔드 (Java · Spring · DevOps) 개요",
      summary: "Java 언어 심화, Spring Framework 핵심 원리, DevOps 배포 인프라",
      explanation: "현대 백엔드 개발은 안정적인 언어 기반 위에 프레임워크가 제공하는 추상화와 인프라 자동화의 조합으로 이루어집니다.\n\n본 과목(총 **53개** 문항)에서는 Java의 JVM 메모리 구조·GC 알고리즘·동시성 처리, Spring Framework의 IoC/DI 컨테이너·AOP·트랜잭션 관리·Spring Security, 그리고 Docker·CI/CD 파이프라인·Kubernetes 기초 등 실무 중심 백엔드 이론을 다룹니다.",
      caveats: "Spring의 `@Transactional`은 같은 빈(Bean) 내부에서 메서드를 호출하면 프록시를 거치지 않아 트랜잭션이 적용되지 않는 **Self-Invocation 문제**가 발생합니다.\n\nDocker 컨테이너는 VM과 달리 OS 커널을 공유합니다. 따라서 호스트 OS와 다른 커널 기능이 필요한 경우 컨테이너만으로는 해결이 불가능합니다."
    },
    "ARCHITECTURE": {
      title: "소프트웨어 아키텍처 개요",
      summary: "SOLID 원칙, 디자인 패턴, 시스템 설계, 소프트웨어 엔지니어링 이론",
      explanation: "지속 가능하고 확장 가능한 소프트웨어를 만들기 위해서는 견고한 아키텍처 설계 원칙이 필요합니다.\n\n본 과목(총 **46개** 문항)에서는 OOP의 SOLID 원칙, GoF 디자인 패턴(Creational·Structural·Behavioral), 마이크로서비스 아키텍처(MSA) vs 모놀리스 비교, DDD(Domain-Driven Design), 대규모 시스템 설계(System Design) 접근 방법 등을 다룹니다.",
      caveats: "과도한 추상화와 설계 패턴 도입은 오히려 코드 복잡성을 가중시키는 오버 엔지니어링이 될 수 있으므로 YAGNI(You Aren't Gonna Need It) 원칙과 균형을 맞춰야 합니다.\n\n시스템 설계 면접에서는 정답보다 **트레이드오프(Trade-off)를 인식하고 논리적으로 선택하는 과정**을 평가합니다. 완벽한 설계보다 합리적인 의사결정 과정을 보여주세요."
    },
    "ALGORITHM": {
      title: "자료구조 · 알고리즘 개요",
      summary: "효율적인 문제 해결과 시간/공간 복잡도 분석",
      explanation: "알고리즘과 자료구조는 효율적인 데이터 처리 및 메모리 관리를 위한 개발자의 기본 소양입니다.\n\n본 과목(총 **16개** 문항)에서는 배열, 연결 리스트, 스택, 큐, 해시 테이블, 트리, 그래프 등 핵심 자료구조의 특징과 시간 복잡도를 명확히 파악하고, 정렬/탐색 알고리즘의 동작 원리와 최적 사용 시나리오를 학습합니다.",
      caveats: "자바스크립트는 내장 `Array.prototype.sort()` 메소드가 문자열 정렬 기준으로 동작하므로 숫자 정렬 시 반드시 비교 함수 `(a, b) => a - b`를 주입해 주어야 합니다.\n\n재귀 함수 사용 시 자바스크립트 콜 스택 제한(약 1만 개)으로 인해 발생 가능한 Stack Overflow 예외를 항상 대비하여 반복문이나 꼬리 재귀 최적화 검토가 필요합니다."
    },
    "ALL": {
      title: "전체 질문 모음 개요",
      summary: "모든 주제의 면접 질문을 한눈에 탐색",
      explanation: "Interview Handbook의 **전체 질문(400개+)** 을 한 곳에서 탐색합니다.\n\n특정 주제에 얽매이지 않고 유연하게 지식을 점검하거나, 검색 기능을 활용해 원하는 키워드로 질문을 빠르게 찾을 수 있습니다.",
      caveats: "전체 질문 목록은 양이 많으므로 상단 검색창(⌘K)을 활용해 키워드로 필터링하면 더욱 효율적으로 학습할 수 있습니다."
    }
  };

  const overview = overviews[subjectKey] || {
    title: "개요",
    summary: "개념 학습 안내",
    explanation: "주제를 선택하여 학습을 시작하세요.",
    caveats: ""
  };

  return {
    id: -1,
    category: "OVERVIEW",
    subject: subjectKey,
    title: overview.title,
    perfectAnswer: "",
    summary: overview.summary,
    explanation: overview.explanation,
    caveats: overview.caveats,
    references: []
  };
};

export const HandbookDashboard: React.FC<HandbookDashboardProps> = ({ onSwitchMode }) => {
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string>("JAVASCRIPT");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);
  const initialQuestionRef = useRef<Question | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Newsletter Subscription States
  const [emailInput, setEmailInput] = useState<string>("");
  const [subscriptionCategory, setSubscriptionCategory] = useState<string>("ALL");
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [unsubscribed, setUnsubscribed] = useState<boolean>(false);
  const [subError, setSubError] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Load questions based on selected subject key
  useEffect(() => {
    let active = true;

    if (selectedSubjectKey === "HOME") {
      setQuestions([]);
      setSelectedQuestion(getSyntheticOverview("HOME"));
      return;
    }

    Promise.resolve().then(() => {
      if (active) setLoadingQuestions(true);
    });

    const mapping = SUBJECT_MAPS[selectedSubjectKey];
    
    // Determine queries to make
    const fetchPromises: Promise<Question[]>[] = [];
    
    if (mapping.category && !mapping.subjects) {
      // Query by category (e.g. CS)
      fetchPromises.push(apiService.getQuestions(mapping.category, undefined));
    } else if (mapping.subjects) {
      // Query by multiple subjects in parallel
      mapping.subjects.forEach(sub => {
        fetchPromises.push(apiService.getQuestions(undefined, sub));
      });
    } else {
      // ALL category: fetch a mix of all questions
      fetchPromises.push(apiService.getQuestions(undefined, undefined));
    }

    Promise.all(fetchPromises)
      .then((results) => {
        if (!active) return;
        
        // Merge results and remove duplicates by ID
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

        // Prepend synthetic overview question for the active category
        const overviewQ = getSyntheticOverview(selectedSubjectKey);
        const finalQuestions = [overviewQ, ...merged];
        
        setQuestions(finalQuestions);
        
        if (initialQuestionRef.current) {
          const targetSub = initialQuestionRef.current.subject.toLowerCase();
          const activeMap = SUBJECT_MAPS[selectedSubjectKey];
          const isMatchedCategory = activeMap.subjects && activeMap.subjects.includes(targetSub);
          const isAllCategory = selectedSubjectKey === "ALL";
          
          if (isMatchedCategory || isAllCategory) {
            const exists = merged.some(q => q.id === initialQuestionRef.current?.id);
            if (!exists && initialQuestionRef.current) {
              setQuestions([overviewQ, initialQuestionRef.current, ...merged]);
            }
            setSelectedQuestion(initialQuestionRef.current);
          } else {
            setSelectedQuestion(overviewQ);
          }
          initialQuestionRef.current = null; // Consume ref
        } else {
          setSelectedQuestion(overviewQ);
        }
      })
      .catch((err) => {
        console.error("Error loading handbook questions:", err);
      })
      .finally(() => {
        if (active) setLoadingQuestions(false);
      });

    return () => {
      active = false;
    };
  }, [selectedSubjectKey]);

  // Client-side filtering logic
  const filteredQuestions = questions.filter(q => {
    if (q.id === -1) return true; // Keep synthetic overview always
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.title.toLowerCase().includes(query) ||
      (q.summary && q.summary.toLowerCase().includes(query)) ||
      (q.explanation && q.explanation.toLowerCase().includes(query)) ||
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
    <div className="flex-1 flex flex-col min-h-screen bg-apple-surface-black">
      {/* 1. Docusaurus style dynamic top-nav */}
      <header className="bg-apple-surface-tile-1/80 backdrop-blur-md text-apple-body-on-dark h-[52px] px-lg flex items-center justify-between sticky top-0 z-50 border-b border-white/5 select-none">
        <div className="flex items-center gap-md">
          <span className="font-sans font-bold text-sm tracking-tight text-white select-none whitespace-nowrap">
            풀스택 면접 준비
          </span>
        </div>

        {/* Categories Menu */}
        <nav className="flex items-center gap-xs overflow-x-auto max-w-[60%] scrollbar-none" aria-label="Subject navigation">
          {Object.entries(SUBJECT_MAPS).map(([key, map]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedSubjectKey(key);
                setSearchQuery(""); // Clear search on category switch
              }}
              className={`px-sm py-xs text-[12px] font-medium transition-colors whitespace-nowrap ${
                selectedSubjectKey === key
                  ? "text-apple-primary-on-dark font-semibold border-b-2 border-apple-primary"
                  : "text-apple-body-muted hover:text-white"
              }`}
            >
              {map.label}
            </button>
          ))}
        </nav>

        {/* Right Switch Mode & Search */}
        <div className="flex items-center gap-sm">
          {/* Header search bar */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-xs top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-apple-body-muted/60" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-apple-surface-black border border-white/10 rounded-md py-[4px] pl-[26px] pr-[38px] text-[12px] text-white placeholder-apple-body-muted/50 focus:outline-none focus:border-apple-primary w-[140px] md:w-[180px] transition-all"
            />
            <span className="absolute right-xs top-1/2 -translate-y-1/2 text-[9px] font-mono text-apple-body-muted/60 bg-white/5 border border-white/10 px-xs py-[1px] rounded pointer-events-none select-none">
              ⌘K
            </span>
          </div>

          <Button
            type="button"
            onClick={onSwitchMode}
            variant="secondary"
            size="sm"
            className="rounded-pill border border-white/10 text-[11px] font-semibold flex items-center gap-xxs px-sm py-[4px]"
          >
            <UserCheck className="w-3 h-3 text-apple-primary-on-dark" />
            <span>모의 면접 시작</span>
          </Button>
        </div>
      </header>

      {/* 2. Three-column layout */}
      <div className="flex-1 flex w-full max-w-[1440px] mx-auto min-h-[calc(100vh-96px)]">
        {/* Mobile search bar */}
        <div className="p-md sm:hidden border-b border-white/5 bg-apple-surface-black/30">
          <div className="relative">
            <Search className="absolute left-xs top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-apple-body-muted/60" />
            <input
              type="text"
              placeholder="핸드북 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-apple-surface-black border border-white/10 rounded-md py-[6px] pl-[28px] pr-md text-[13px] text-white placeholder-apple-body-muted/50 focus:outline-none focus:border-apple-primary"
            />
          </div>
        </div>

        {/* Column A: Left Sidebar (Question List) */}
        <QuestionList
          selectedCategory={selectedSubjectKey}
          onChangeCategory={setSelectedSubjectKey}
          questions={filteredQuestions}
          selectedQuestionId={selectedQuestion?.id}
          onSelectQuestion={setSelectedQuestion}
          loading={loadingQuestions}
        />

        {/* Column B: Center content (Detail Panel) */}
        <main className="flex-1 px-lg py-xl border-r border-white/5 overflow-y-auto max-h-[85vh]">
          <QuestionDetail question={selectedQuestion} />
        </main>

        {/* Column C: Right Sidebar (Table of Contents & Daily Newsletter) */}
        <aside className="hidden lg:block w-[18%] p-lg select-none">
          <div className="sticky top-[72px] flex flex-col gap-lg">
            {tocItems.length > 0 && (
              <nav className="flex flex-col gap-sm" aria-label="Table of contents">
                <span className="font-display font-semibold text-[11px] tracking-wider uppercase text-apple-body-muted">
                  목차 (On this page)
                </span>
                <ul className="flex flex-col gap-xs border-l border-white/5 pl-xxs">
                  {tocItems.map(item => (
                    <li key={item.id}>
                      <button
                        onClick={() => handleScrollToSection(item.id)}
                        className="text-left w-full text-[12px] text-apple-body-muted hover:text-white hover:border-l hover:border-white/20 pl-sm py-[2px] transition-all truncate"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {/* 데일리 면접 챌린지 구독 폼 */}
            <div className="border-t border-white/5 pt-md mt-sm flex flex-col gap-xs">
              <span className="font-display font-semibold text-[11px] tracking-wider uppercase text-apple-primary-on-dark flex items-center gap-xxs">
                <span>데일리 챌린지 구독</span>
                <span className="text-[10px] bg-apple-primary/10 border border-apple-primary text-apple-primary-on-dark px-xxs py-[1px] rounded">Daily</span>
              </span>
              <p className="text-[11px] text-apple-body-muted leading-relaxed">
                매일 오전 9시, 엄선된 1개의 면접 질문과 해설지를 메일로 발송해 드립니다.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-xxs mt-xxs">
                <input
                  type="email"
                  placeholder="yourname@domain.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  disabled={isSubscribing}
                  required
                  className="w-full bg-apple-surface-black border border-white/10 rounded-md py-xs px-sm text-[12px] text-white placeholder-apple-body-muted/40 focus:outline-none focus:border-apple-primary transition-all disabled:opacity-50"
                />
                
                <select
                  value={subscriptionCategory}
                  onChange={(e) => setSubscriptionCategory(e.target.value)}
                  disabled={isSubscribing}
                  className="w-full bg-apple-surface-black border border-white/10 rounded-md py-xs px-sm text-[12px] text-white focus:outline-none focus:border-apple-primary transition-all disabled:opacity-50 appearance-none cursor-pointer mt-xxs"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\' fill=\'none\' stroke=\'%2386868b\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M4 6l4 4 4-4\'/%3E%3C/svg%3E")',
                    backgroundPosition: 'right 12px center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '12px'
                  }}
                >
                  <option value="ALL">전체 질문 (ALL)</option>
                  <option value="CS">컴퓨터 과학 (CS)</option>
                  <option value="FE">프론트엔드 (Frontend)</option>
                  <option value="BE">백엔드 (Backend)</option>
                </select>

                <div className="flex gap-xs mt-xxs">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={isSubscribing}
                    onClick={async () => {
                      const normalizedEmail = emailInput.trim();
                      if (!normalizedEmail) return;
                      
                      const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
                      if (!emailRegex.test(normalizedEmail)) {
                        setSubError("올바른 이메일 형식이 아닙니다.");
                        return;
                      }

                      setIsSubscribing(true);
                      setSubError(null);
                      setSubscribed(false);
                      setUnsubscribed(false);
                      try {
                        await apiService.subscribeNewsletter(normalizedEmail, subscriptionCategory);
                        setSubscribed(true);
                        setEmailInput("");
                        setTimeout(() => setSubscribed(false), 5000);
                      } catch (err: any) {
                        console.error(err);
                        setSubError(err.message || "구독 등록에 실패했습니다.");
                      } finally {
                        setIsSubscribing(false);
                      }
                    }}
                    className="flex-1 py-[6px] text-[11px] font-semibold tracking-wider hover:scale-[1.01]"
                  >
                    {isSubscribing ? "진행 중..." : "구독 신청"}
                  </Button>
                  <Button
                    type="button"
                    variant="dark-utility"
                    size="sm"
                    disabled={isSubscribing}
                    onClick={async () => {
                      const normalizedEmail = emailInput.trim();
                      if (!normalizedEmail) return;

                      const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
                      if (!emailRegex.test(normalizedEmail)) {
                        setSubError("올바른 이메일 형식이 아닙니다.");
                        return;
                      }

                      setIsSubscribing(true);
                      setSubError(null);
                      setSubscribed(false);
                      setUnsubscribed(false);
                      try {
                        await apiService.unsubscribeNewsletter(normalizedEmail);
                        setUnsubscribed(true);
                        setEmailInput("");
                        setTimeout(() => setUnsubscribed(false), 5000);
                      } catch (err: any) {
                        console.error(err);
                        setSubError(err.message || "구독 해제에 실패했습니다.");
                      } finally {
                        setIsSubscribing(false);
                      }
                    }}
                    className="flex-1 py-[6px] text-[11px] font-semibold tracking-wider hover:scale-[1.01]"
                  >
                    구독 취소
                  </Button>
                </div>
              </form>
              {subscribed && (
                <p className="text-green-500 text-[10px] font-mono mt-xxs animate-pulse">
                  ✓ 구독이 완료되었습니다!
                </p>
              )}
              {unsubscribed && (
                <p className="text-yellow-500 text-[10px] font-mono mt-xxs animate-pulse">
                  ✓ 구독이 취소되었습니다.
                </p>
              )}
              {subError && (
                <p className="text-red-500 text-[10px] font-mono mt-xxs">
                  ✗ {subError}
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
