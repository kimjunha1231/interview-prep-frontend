import React from "react";
import { BookOpen, UserCheck, Sun, Moon } from "lucide-react";

interface SubNavProps {
  activeMode: "handbook" | "interview";
  onChangeMode: (mode: "handbook" | "interview") => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const SubNav: React.FC<SubNavProps> = ({ 
  activeMode, 
  onChangeMode, 
  theme, 
  onToggleTheme 
}) => {
  return (
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
              ? "bg-white dark:bg-apple-surface-tile-2 text-apple-ink dark:text-white font-semibold shadow-sm border border-black/5 dark:border-white/5"
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
              ? "bg-apple-primary text-white font-semibold shadow-[0_0_10px_rgba(0,102,204,0.3)]"
              : "text-gray-500 dark:text-apple-body-muted hover:text-apple-ink dark:hover:text-white"
          }`}
          aria-pressed={activeMode === "interview"}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>모의 면접 (Mock Interview)</span>
        </button>
      </div>

      <div className="flex items-center gap-sm">
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
  );
};

