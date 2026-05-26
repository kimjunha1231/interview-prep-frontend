import React, { useState } from "react";
import { ArrowRight, UploadCloud, FileText, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { SUBJECT_MAPS } from "../../../constants/subjects";
import { extractTextFromPdf } from "../../../utils/pdfParser";

interface InterviewSetupProps {
  interviewCategory: string;
  onChangeCategory: (category: string) => void;
  questionCount: number;
  onChangeCount: (count: number) => void;
  selectedSubjects: string[];
  onChangeSubjects: (subjects: string[]) => void;
  portfolioFile: File | null;
  onPortfolioFileChange: (file: File | null, text: string) => void;
  isStarting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

// SUBJECT_MAPS에서 HOME, ALL을 제외한 실제 과목 항목만 추출하여 체크박스 그룹 생성
const SUBJECT_ITEMS = Object.entries(SUBJECT_MAPS)
  .filter(([key, map]) => key !== "HOME" && key !== "ALL" && map.subjects)
  .map(([key, map]) => ({ key, label: map.label }));

export const InterviewSetup: React.FC<InterviewSetupProps> = ({
  interviewCategory,
  onChangeCategory,
  questionCount,
  onChangeCount,
  selectedSubjects,
  onChangeSubjects,
  portfolioFile,
  onPortfolioFileChange,
  isStarting,
  onSubmit,
}) => {
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isSubjectsOpen, setIsSubjectsOpen] = useState<boolean>(true);

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("포트폴리오는 오직 PDF 형식만 지원됩니다.");
      return;
    }

    setIsParsing(true);
    try {
      const text = await extractTextFromPdf(file);
      onPortfolioFileChange(file, text);
    } catch (err) {
      console.error("PDF Parsing failed:", err);
      alert("PDF 텍스트 추출 중 문제가 발생했습니다. 다른 PDF 파일로 시도해 주세요.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    onPortfolioFileChange(null, "");
  };

  const handleCategoryClick = (cat: string) => {
    onChangeCategory(cat);
    if (cat === "CS") {
      onChangeSubjects(["NETWORK", "OS", "DATABASE", "ARCHITECTURE", "ALGORITHM"]);
    } else if (cat === "FE") {
      onChangeSubjects(["JAVASCRIPT", "REACT", "HTML_CSS"]);
    } else if (cat === "BE") {
      onChangeSubjects(["JAVA", "SPRING", "DEVOPS", "DATABASE", "NETWORK", "ARCHITECTURE"]);
    } else if (cat === "PORTFOLIO") {
      onChangeSubjects([]);
    }
  };

  const handleToggleSubject = (key: string) => {
    let next: string[];
    if (selectedSubjects.includes(key)) {
      next = selectedSubjects.filter((s) => s !== key);
    } else {
      next = [...selectedSubjects, key];
    }
    onChangeSubjects(next);

    // 하위 과목들의 수동 토글 변경 시, 분야(Category) 버튼의 프리셋과의 완벽한 일치 여부에 맞춰 카테고리 상태 조절 가능
    // 단, CS/FE/BE/PORTFOLIO 중 하나를 유지하는 것이 UI상 안전함
  };

  const isSubmitDisabled = isStarting || (interviewCategory === "PORTFOLIO" && (!portfolioFile || isParsing));

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-lg select-none">
      <header className="border-b border-black/5 dark:border-b dark:border-white/5 pb-md">
        <h2 className="text-[22px] font-semibold text-apple-ink dark:text-white leading-tight font-display tracking-tight">
          모의 면접 설정 (Session Config)
        </h2>
        <p className="text-[13px] text-gray-500 dark:text-apple-body-muted mt-xxs">
          시니어 면접관 페르소나의 AI와 진행하는 1:1 모의 면접을 구성합니다.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {/* Category Column */}
        <div className="flex flex-col gap-xs">
          <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 dark:text-apple-body-muted">
            분야 (Category)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-xs">
            {["CS", "FE", "BE", "PORTFOLIO"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={`py-sm rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-300 ease-out-expo border ${
                  interviewCategory === cat
                    ? "bg-apple-primary border-apple-primary text-white dark:bg-white dark:border-white dark:text-apple-ink shadow-sm"
                    : "bg-black/5 dark:bg-apple-surface-tile-1/30 border-black/5 dark:border-white/5 text-gray-500 dark:text-apple-body-muted hover:border-black/10 dark:hover:border-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Count Column */}
        <div className="flex flex-col gap-xs">
          <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 dark:text-apple-body-muted">
            질문 수 (Count)
          </label>
          <div className="grid grid-cols-3 gap-xs">
            {[3, 5, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onChangeCount(num)}
                className={`py-sm rounded-md text-xs font-semibold transition-all duration-300 ease-out-expo border ${
                  questionCount === num
                    ? "bg-apple-primary border-apple-primary text-white dark:bg-white dark:border-white dark:text-apple-ink shadow-sm"
                    : "bg-black/5 dark:bg-apple-surface-tile-1/30 border-black/5 dark:border-white/5 text-gray-500 dark:text-apple-body-muted hover:border-black/10 dark:hover:border-white/20"
                }`}
              >
                {num}개
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conditional Subject Filter / Portfolio Uploader */}
      {interviewCategory !== "PORTFOLIO" ? (
        <div className="flex flex-col gap-xs border border-black/5 dark:border-white/5 bg-apple-canvas-parchment dark:bg-apple-surface-black/30 rounded-lg p-md">
          <button
            type="button"
            onClick={() => setIsSubjectsOpen(!isSubjectsOpen)}
            className="flex items-center justify-between w-full text-left focus:outline-none"
          >
            <div className="flex flex-col">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 dark:text-apple-body-muted">
                상세 주제 개별 선택 (Subject - 다중 선택 가능)
              </span>
              <span className="text-[12px] text-apple-ink/90 dark:text-white/90 mt-[2px] truncate max-w-[280px] sm:max-w-[400px]">
                {selectedSubjects.length > 0
                  ? `${selectedSubjects.map(s => SUBJECT_ITEMS.find(item => item.key === s)?.label).join(", ")} 선택됨`
                  : "선택된 주제 없음 (비워두면 전체 랜덤)"}
              </span>
            </div>
            <div className="text-gray-400 dark:text-apple-body-muted hover:text-apple-ink dark:hover:text-white transition-colors">
              {isSubjectsOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {isSubjectsOpen && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-xs mt-md pt-md border-t border-black/5 dark:border-t dark:border-white/5">
              {SUBJECT_ITEMS.map((item) => {
                const isActive = selectedSubjects.includes(item.key);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleToggleSubject(item.key)}
                    className={`py-xs px-sm rounded-pill text-[12px] font-medium transition-all duration-200 border flex items-center justify-center gap-xxs ${
                      isActive
                        ? "bg-apple-primary/10 border-apple-primary text-apple-primary dark:text-apple-primary-on-dark scale-[1.01] font-semibold"
                        : "bg-black/5 dark:bg-apple-surface-tile-1/10 border-black/5 dark:border-white/5 text-gray-500 dark:text-apple-body-muted hover:border-black/10 dark:hover:border-white/20 hover:text-apple-ink dark:hover:text-white"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="text-[10px] bg-apple-primary text-white w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-xs">
          <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 dark:text-apple-body-muted">
            포트폴리오 업로드 (PDF 전용)
          </label>
          
          {!portfolioFile ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center py-xl border border-dashed rounded-lg transition-all duration-300 ease-out-expo ${
                dragActive 
                  ? "border-apple-primary bg-apple-primary/5 scale-[1.01]" 
                  : "border-black/10 dark:border-white/10 bg-apple-canvas-parchment dark:bg-apple-surface-black/20 hover:border-black/20 dark:hover:border-white/20"
              }`}
            >
              <input
                id="portfolio-upload"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={isParsing}
              />
              <label 
                htmlFor="portfolio-upload"
                className="flex flex-col items-center gap-xs cursor-pointer text-center"
              >
                {isParsing ? (
                  <>
                    <span className="w-8 h-8 border-2 border-apple-ink/30 border-t-apple-ink dark:border-white/30 dark:border-t-white rounded-full animate-spin mb-xs" />
                    <span className="text-[13px] text-apple-ink dark:text-white font-medium">포트폴리오 분석 중...</span>
                    <span className="text-[11px] text-gray-500 dark:text-apple-body-muted">로컬 브라우저에서 텍스트 노드를 파싱하고 있습니다.</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-gray-400 dark:text-apple-body-muted mb-xs" />
                    <span className="text-[13px] text-apple-ink dark:text-white font-medium">포트폴리오 PDF 파일을 드래그하거나 클릭하여 업로드</span>
                    <span className="text-[11px] text-gray-500 dark:text-apple-body-muted">최대 용량에 관계 없이 브라우저 내에서 직접 텍스트를 추출합니다.</span>
                  </>
                )}
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between p-md bg-apple-canvas-parchment dark:bg-apple-surface-black/40 border border-black/10 dark:border-white/10 rounded-md">
              <div className="flex items-center gap-sm">
                <FileText className="w-8 h-8 text-apple-primary dark:text-apple-primary-on-dark shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-apple-ink dark:text-white truncate max-w-[200px] md:max-w-[400px]">
                    {portfolioFile.name}
                  </span>
                  <span className="text-[11px] text-green-600 dark:text-green-500 font-mono">
                    ✓ 분석 완료 (로컬 텍스트 기반)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-xs hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-gray-400 dark:text-apple-body-muted hover:text-apple-ink dark:hover:text-white transition-colors"
                aria-label="파일 제거"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isSubmitDisabled}
        className="w-full mt-md hover:scale-[1.01] active:scale-[0.98] disabled:scale-100 disabled:opacity-40"
      >
        {isStarting ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>면접 질문 생성 중... (로딩 중)</span>
          </>
        ) : (
          <>
            <span>면접 시작하기</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </form>
  );
};
