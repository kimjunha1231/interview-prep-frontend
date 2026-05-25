import React from "react";
import { BookOpen, UserCheck } from "lucide-react";

interface SubNavProps {
  activeMode: "handbook" | "interview";
  onChangeMode: (mode: "handbook" | "interview") => void;
}

export const SubNav: React.FC<SubNavProps> = ({ activeMode, onChangeMode }) => {
  return (
    <div 
      className="bg-apple-surface-tile-1/80 backdrop-blur-md text-apple-body-on-dark h-[52px] px-lg flex items-center justify-between sticky top-0 z-50 border-b border-white/5 select-none"
      aria-label="Sub navigation"
    >
      <div className="flex items-center gap-xs">
        <h1 className="text-[17px] font-display font-semibold tracking-tight text-white">
          Interview Handbook
        </h1>
      </div>

      <div className="flex items-center bg-apple-surface-black/60 p-[3px] rounded-pill border border-white/5">
        <button
          onClick={() => onChangeMode("handbook")}
          className={`flex items-center gap-xs px-md py-[6px] rounded-pill text-[12px] font-medium transition-all duration-300 ease-out-expo ${
            activeMode === "handbook"
              ? "bg-white text-apple-ink font-semibold shadow-sm"
              : "text-apple-body-muted hover:text-white"
          }`}
          aria-pressed={activeMode === "handbook"}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>개념 학습 (Handbook)</span>
        </button>

        <button
          onClick={() => onChangeMode("interview")}
          className={`flex items-center gap-xs px-md py-[6px] rounded-pill text-[12px] font-medium transition-all duration-300 ease-out-expo ${
            activeMode === "interview"
              ? "bg-apple-primary text-white font-semibold shadow-[0_0_10px_rgba(0,102,204,0.3)]"
              : "text-apple-body-muted hover:text-white"
          }`}
          aria-pressed={activeMode === "interview"}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>모의 면접 (Mock Interview)</span>
        </button>
      </div>
    </div>
  );
};
