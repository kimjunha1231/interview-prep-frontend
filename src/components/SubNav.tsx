import React, { useState } from "react";
import { BookOpen, UserCheck, Sun, Moon, Mail, MessageSquare } from "lucide-react";

interface SubNavProps {
  activeMode: "handbook" | "interview" | "subscription";
  onChangeMode: (mode: "handbook" | "interview" | "subscription") => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const SubNav: React.FC<SubNavProps> = ({ 
  activeMode, 
  onChangeMode, 
  theme, 
  onToggleTheme 
}) => {
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [emailCopied, setEmailCopied] = useState<boolean>(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("fullstackquestion@gmail.com");
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (err) {
      console.error("이메일 복사 실패:", err);
    }
  };
  return (
    <>
      <nav 
        className="bg-white/80 dark:bg-apple-surface-tile-1/80 backdrop-blur-md text-apple-ink dark:text-apple-body-on-dark h-[52px] px-lg flex items-center justify-between sticky top-0 z-50 border-b border-black/5 dark:border-white/5 select-none transition-colors duration-200"
        aria-label="서브 네비게이션"
      >
      <div className="flex items-center gap-xs">
        <h1 className="text-[17px] font-display font-semibold tracking-tight text-apple-ink dark:text-white">
          Interview Handbook
        </h1>
      </div>

      <div className="flex items-center bg-apple-canvas-parchment dark:bg-apple-surface-black/60 p-[3px] rounded-pill border border-black/10 dark:border-white/5">
        <button
          onClick={() => onChangeMode("handbook")}
          className={`flex items-center gap-xs px-md py-[6px] rounded-pill text-[12px] font-medium transition-all duration-300 ease-out-expo ${
            activeMode === "handbook"
              ? "bg-white dark:bg-apple-surface-tile-2 text-apple-ink dark:text-white font-semibold border border-black/5 dark:border-white/5"
              : "text-gray-500 dark:text-apple-body-muted hover:text-apple-ink dark:hover:text-white"
          }`}
          aria-pressed={activeMode === "handbook"}
        >
          <BookOpen className="w-3.5 h-3.5 text-apple-primary dark:text-apple-primary-on-dark" />
          <span>개념 학습 (Handbook)</span>
        </button>

        <button
          onClick={() => onChangeMode("interview")}
          className={`flex items-center gap-xs px-md py-[6px] rounded-pill text-[12px] font-medium transition-all duration-300 ease-out-expo ${
            activeMode === "interview"
              ? "bg-apple-primary text-white font-semibold border border-black/5 dark:border-white/5"
              : "text-gray-500 dark:text-apple-body-muted hover:text-apple-ink dark:hover:text-white"
          }`}
          aria-pressed={activeMode === "interview"}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>모의 면접 (Mock Interview)</span>
        </button>

        <button
          onClick={() => onChangeMode("subscription")}
          className={`flex items-center gap-xs px-md py-[6px] rounded-pill text-[12px] font-medium transition-all duration-300 ease-out-expo ${
            activeMode === "subscription"
              ? "bg-white dark:bg-apple-surface-tile-2 text-apple-ink dark:text-white font-semibold border border-black/5 dark:border-white/5"
              : "text-gray-500 dark:text-apple-body-muted hover:text-apple-ink dark:hover:text-white"
          }`}
          aria-pressed={activeMode === "subscription"}
        >
          <Mail className="w-3.5 h-3.5 text-apple-primary dark:text-apple-primary-on-dark" />
          <span>데일리 챌린지 구독</span>
        </button>
      </div>

      <div className="flex items-center gap-sm">
        {/* Contact/Feedback Button */}
        <button
          onClick={() => setIsContactModalOpen(true)}
          className="flex items-center gap-xs px-sm py-[6px] rounded-pill text-[12px] font-medium text-gray-500 dark:text-apple-body-muted hover:text-apple-primary dark:hover:text-apple-primary-on-dark transition-colors duration-200 cursor-pointer select-none"
          title="문의 및 제안"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">문의 및 제안</span>
        </button>

        {/* iOS style Toggle Switch */}
        <div className="flex items-center gap-xs select-none">
          <Sun className="w-3.5 h-3.5 text-amber-500 dark:text-gray-600" />
          <button
            onClick={onToggleTheme}
            className={`w-9 h-5 rounded-full p-[2px] transition-colors duration-200 focus:outline-none flex items-center ${
              theme === "dark" ? "bg-apple-primary" : "bg-black/10"
            }`}
            role="switch"
            aria-checked={theme === "dark"}
            aria-label="다크 모드 토글"
            title={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out-expo ${
                theme === "dark" ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
          <Moon className="w-3.5 h-3.5 text-gray-400 dark:text-amber-300 fill-transparent dark:fill-amber-300/20" />
        </div>
      </div>
    </nav>

    {/* Contact Modal */}
    {isContactModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-md bg-black/50 backdrop-blur-xs animate-fade-in" onClick={() => setIsContactModalOpen(false)}>
        <div 
          className="w-full max-w-[360px] bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-2xl p-lg relative shadow-xl animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            type="button"
            onClick={() => setIsContactModalOpen(false)}
            className="absolute right-4 top-4 text-gray-400 hover:text-apple-ink dark:hover:text-white text-[16px] focus:outline-none cursor-pointer select-none"
            aria-label="닫기"
          >
            ✕
          </button>

          <div className="flex flex-col gap-sm">
            <div className="text-center md:text-left">
              <span className="text-[20px]">✉️</span>
              <h3 className="text-[15px] font-bold text-apple-ink dark:text-white mt-xs">질문 및 기능 제안</h3>
              <p className="text-[11px] text-gray-500 dark:text-apple-body-muted mt-[2px] leading-relaxed">
                추가하고 싶은 면접 질문이나 기능 피드백은 메일로 편하게 보내주세요.
              </p>
            </div>

            <div className="flex gap-xs mt-sm">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=fullstackquestion@gmail.com&su=[풀스택 개념북] 질문 및 기능 제안&body=제안하실 내용을 여기에 작성해 주세요!"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center bg-apple-primary/10 border border-apple-primary/20 text-apple-primary dark:text-apple-primary-on-dark rounded-full py-[8px] text-[12px] font-semibold hover:bg-apple-primary/15 transition-all text-center"
              >
                메일 보내기
              </a>
              <button
                onClick={handleCopyEmail}
                className="flex-1 flex items-center justify-center bg-apple-canvas-parchment dark:bg-apple-surface-black border border-black/10 dark:border-white/10 rounded-full py-[8px] text-[12px] text-gray-500 dark:text-apple-body-muted hover:border-black/20 dark:hover:border-white/20 transition-all focus:outline-none cursor-pointer"
                title="이메일 주소 복사"
              >
                {emailCopied ? "복사 완료" : "주소 복사"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
