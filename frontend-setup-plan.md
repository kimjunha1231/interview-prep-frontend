# 🎨 프론트엔드 프로젝트 초기 세팅 및 개발 계획 (Frontend Setup & Implementation Plan)

본 문서는 **Interview Handbook (AI 모의 면접 및 개념 학습 플랫폼)** 서비스의 리액트 프론트엔드 프로젝트를 구축하기 위한 초기 세팅 및 단계별 기능 구현 계획서입니다.

---

## 🏛️ 1. 기술 스택 (Tech Stack)

*   **기본 프레임워크**: React (Vite 기반, TypeScript 개발 환경)
*   **스타일링**: Tailwind CSS (Tailwind CSS v3 기반의 유틸리티 클래스 및 Vanilla CSS 커스텀 애니메이션)
*   **아이콘 라이브러리**: Lucide React
*   **SEO / GEO 제어**: React Helmet Async (`react-helmet-async`)
*   **이력서 파싱**: PDF.js (브라우저 로컬 파싱으로 백엔드 메모리 부하 방지)
*   **음성 제어**: Web Audio API & MediaRecorder API (WAV/MP3 Blob 오디오 데이터 생성)
*   **HTTP 통신**: Fetch API 또는 Axios (백엔드 `localhost:8080` API 연동 및 CORS 처리)
*   **정적 빌드 최적화**: `vite-plugin-prerender` (빌드 타임 사전 렌더링으로 AI 크롤러 대비)
*   **정적 호스팅**: Vercel ($0 무료 배포)

---

## 🎨 2. UI/UX 디자인 시스템 및 테마 가이드 (Apple HIG & Minimalist Dark)
인공적인 AI 스타일(네온 그라데이션, 글로우 테두리 등)을 배제하고, 콘텐츠와 텍스트의 정밀성에 집중할 수 있는 **Apple & Professional Pro** 감성의 디자인 시스템을 구현합니다.

*   **타이포그래피 (Typography)**:
    *   **헤드라인**: `SF Pro Display, system-ui, -apple-system, sans-serif` (자간을 좁히는 `-0.02em` tracking 적용하여 Apple 특유의 밀도감 연출)
    *   **본문 텍스트**: `SF Pro Text, system-ui, -apple-system, sans-serif` (가독성을 위한 `17px` 베이스, `1.47` line-height 구성)
    *   **코드/기술 요소**: `SF Mono, Fira Code, monospace` 사용
*   **색상 팔레트 (Color Palette)**:
    *   **메인 캔버스 (Canvas)**: Pure Black (`#000000` - 깊은 몰입감의 다크 배경) 또는 Parchment Off-White (`#F5F5F7` - 라이트 모드 대응 시)
    *   **레이어 카드 (Elevated Layers)**: Apple System Grays (`#1C1C1E` - 기본 패널/카드, `#2C2C2E` - 호버 및 활성 영역)
    *   **핵심 강조색 (Accent)**: Action Blue (`#0066CC` - 모든 상호작용 및 링크 요소를 관통하는 단일 액센트), System Green (`#30D158` - 성공, 추천, 통과 등 보조 상태 표시)
    *   **텍스트 대비**: Primary White (`#F5F5F7` - 메인 텍스트), Secondary Gray (`#8E8E93` - 설명글 및 보조 정보)
*   **디자인 마감 및 재질 (Materials & Finish)**:
    *   **초정밀 보더 (Hairline Borders)**: 카드와 컴포넌트 경계는 1px 두께의 초정밀 반투명 라인 (`border border-white/5` 혹은 `border-white/10`)으로 분리
    *   **그림자 제한 (Shadow Rule)**: 일반 UI(버튼, 카드, 텍스트)에는 그림자를 적용하지 않으며, 오직 입체감이 필요한 특정 시각 자료나 마이크 컴포넌트에만 부드러운 분산형 그림자 (`rgba(0,0,0,0.22) 3px 5px 30px`) 적용
    *   **마이크로 인터랙션 (Micro-animations)**:
        *   모든 버튼 클릭/누름 시 스프링 압축 느낌의 `transform: scale(0.95)` 스케일 축소 효과 부여
        *   자연스러운 감속을 지닌 전환 효과 (`transition-all duration-300 ease-out`) 사용
        *   로딩 및 채점 대기 시에는 과도한 네온 그라데이션 이동을 빼고, 차분한 모노톤 스켈레톤 로더 적용

---

## 🚀 3. SEO & GEO (Generative Engine Optimization) 및 웹 접근성(a11y) 설계

### ➊ GEO (생성형 AI 엔진 검색 최적화) 전략
ChatGPT Search, Perplexity, Google Gemini 등 AI 검색엔진이 핸드북 본문을 분석하고 정보 출처로 적극 인용하도록 설계합니다.

*   **구조화 데이터 (JSON-LD) 주입**: 
    질문 상세 페이지 방문 시 `react-helmet-async`를 통해 Schema.org의 `FAQPage` 구조화 데이터를 `<head>`에 동적으로 주입합니다.
    *   `Question` 타입에 질문 제목 매핑
    *   `Answer` 타입에 30초 핵심 답변 및 요약 매핑
*   **출처 신뢰성 (Authority Metrics) 확보**: 
    각 질문마다 제공되는 공식 가이드 및 문서 링크(`references`)를 본문 하단에 의미론적(Semantic) 링크 태그로 명확히 표시하여 AI 검색 봇이 검증된 신뢰적 데이터로 가중치를 두도록 유도합니다.
*   **빌드 타임 정적 렌더링 (Prerendering)**: 
    `vite-plugin-prerender`를 설정하여 전체 질문 루트를 빌드 타임에 정적 HTML 파일들로 미리 파싱해 둡니다. AI 검색 봇(예: OAI-SearchBot)이 자바스크립트를 로딩하지 않고 HTML만 긁어갈 때도 JSON-LD와 질문답변 데이터를 무리 없이 수집해 가도록 완벽 대응합니다.

### ➋ 웹 접근성 (Accessibility / a11y) 및 시멘틱 HTML 설계
*   **시멘틱 구조(Semantic Markup)**: 
    레이아웃 구조에 맞춰 `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` 태그를 철저히 분류하여 웹 표준을 준수합니다.
*   **대체 텍스트 및 ARIA 속성**:
    *   아이콘 전용 버튼(마이크 녹음기, 닫기 등)에는 반드시 명확한 `aria-label`을 정의합니다. (예: `aria-label="마이크 음성 녹음 시작"`)
    *   AI 분석 대기 및 피드백 로딩 등 상태 변화가 감지되는 영역에는 `role="status"` 및 `aria-live="polite"` 속성을 부여합니다.
*   **키보드 포커스 및 네비게이션**:
    *   모든 제어 버튼은 마우스 없이 키보드 Tab 키로 완벽하게 이동이 가능해야 합니다.
    *   포커스가 올려진 상태를 보여주는 포커스 링 스타일(`focus-visible:ring-2 focus-visible:ring-emerald-500`)을 명확히 정의합니다.
*   **명도 대비 규격**:
    다크 모드 배색 시 텍스트와 배경의 명도 대비를 4.5:1 이상으로 유지해 시각 장애인 및 저시력자도 읽을 수 있도록 세팅합니다.

---

## 🗺️ 4. 단계별 개발 로드맵 (Roadmap)

### 📌 Phase 1: 프로젝트 스케폴딩 및 스타일 시스템 세팅
*   [ ] **Vite React TS 스케폴딩 생성**: `frontend` 폴더 초기화 및 기본 빌드 환경 테스트
*   [ ] **Tailwind CSS 연동**: `tailwind.config.js` 설정 및 테마 컬러 정의
*   [ ] **SEO/GEO 메타 제어 및 사전 렌더링 설정**: `react-helmet-async` 및 `vite-plugin-prerender` 의존성 주입
*   [ ] **API 클라이언트 유틸리티 설정**: 백엔드와 연결하기 위한 API 요청 래퍼 클래스 및 환경 변수(`VITE_API_URL`) 설정

### 📌 Phase 2: 개념 학습 핸드북 뷰 (Handbook View)
*   [ ] **카테고리 & 과목 대시보드**: 
    *   CS (알고리즘, 자료구조, 네트워크, 데이터베이스, 운영체제), FE (JavaScript, React, TypeScript), BE (Java, Spring) 카드 레이아웃 구성
*   [ ] **핸드북 아코디언/카드 목록**:
    *   질문 목록 표시, 중요도(importance 1~5) 배지 시각화
*   [ ] **상세 보기 패널**:
    *   백엔드 엔티티의 리치 필드(`summary`, `explanation`, `caveats`, `tailQuestions`, `references`)를 마크다운 파서 등을 활용해 가독성 있게 렌더링 및 **JSON-LD Schema 자동 주입**

### 📌 Phase 3: AI 모의 면접 기능 구현 (AI Mock Interview)
*   [ ] **면접 세션 시작 폼**:
    *   원하는 카테고리, 세부 과목, 질문 개수(1~10개) 선택 후 `/api/interviews/sessions` 요청을 통해 세션 생성 및 질문 전달받기
*   [ ] **면접 진행 카드 UI**:
    *   질문 1개씩 순차 제시, 사용자 답변 대기 상태 (스크린 리더 배려 마크업 적용)
*   [ ] **오디오 녹음기 및 웨이브 렌더러**:
    *   마이크 권한 획득, `MediaRecorder` 기반 실시간 음성 녹음
    *   녹음 중 녹음 상태 및 오디오 주파수 애니메이션 시각화
    *   녹음 정지 시 오디오 데이터 Blob(WAV/MP3) 추출 및 재생 컴포넌트 제공
*   [ ] **답변 전송 및 실시간 STT**:
    *   오디오 Blob 데이터를 FormData에 담아 백엔드 `/api/interviews/transcribe` 호출하여 문자열로 변환받기
    *   변환된 텍스트 수정 및 보완이 가능한 입력창 연동

### 📌 Phase 4: 실시간 AI 채점 및 꼬리 질문 피드백 루프
*   [ ] **AI 채점 응답 대기 UI**:
    *   "시니어 면접관이 답변을 분석 중입니다..." 스켈레톤 로딩 애니메이션 및 `role="status"` 스크린 리더 음성 트리거
*   [ ] **채점 결과 패널**:
    *   점수(Score) 게이지 바 애니메이션 효과 제공
    *   다차원 분석 피드백(잘한 점, 아쉬운 점, 실무 조언) 렌더링
*   [ ] **동적 꼬리 질문 전개**:
    *   AI가 낸 맞춤형 꼬리 질문을 사용자에게 던지고, 다시 녹음하여 대답할 수 있는 릴레이 인터랙션 구현

### 📌 Phase 5: 최종 면접 이력 보고서 (Interview Report)
*   [ ] **전체 면접 요약 대시보드**:
    *   모든 질문에 대한 평균 점수, 답변 기록, AI 총평 시각화
*   [ ] **이메일 리포트 신청 폼**:
    *   이메일을 입력받아 비동기 결과지를 발송할 수 있도록 백엔드 API 연동

---

## 🧪 5. 검증 및 확인 시나리오
1.  로컬 기동 (`npm run dev`) 후 `localhost:5173` 접속 검증
2.  마이크 권한 차단/허용 예외 처리 및 `aria-label` 정상 리딩 테스트
3.  웹 소스 보기(View Source) 시 JSON-LD 스키마 및 마크다운 렌더링 본문이 사전 렌더링되어 파싱되어 있는지 확인 (GEO/SEO 수집 검증)
4.  백엔드 API 호출 시 CORS 에러 발생 유무 및 해결 여부 확인
