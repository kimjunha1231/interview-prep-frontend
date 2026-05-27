import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, Award, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import type { InterviewHistoryResponse, InterviewSessionResponse } from "../../../types";
import { normalizeMarkdown, mdComponents } from "../../../utils/markdown";


interface InterviewFeedbackProps {
  gradingResult: InterviewHistoryResponse;
  sessionData: InterviewSessionResponse;
  currentQuestionIndex: number;
  onTailQuestion: () => void;
  onNext: () => void;
}

export const InterviewFeedback: React.FC<InterviewFeedbackProps> = ({
  gradingResult,
  sessionData,
  currentQuestionIndex,
  onTailQuestion,
  onNext,
}) => {
  const currentQuestion = sessionData.questions[currentQuestionIndex];

  return (
    <div className="flex flex-col gap-lg">
      <header className="border-b border-black/5 dark:border-white/5 pb-md select-none">
        <h2 className="text-[20px] font-semibold text-apple-ink dark:text-white leading-tight font-display tracking-tight flex items-center gap-xs">
          <Sparkles className="w-5 h-5 text-apple-primary dark:text-apple-primary-on-dark" />
          <span>시니어 면접관의 실시간 피드백</span>
        </h2>
      </header>

      {/* Score and Question Info */}
      <div className="flex items-center gap-lg bg-apple-canvas-parchment dark:bg-apple-surface-black/30 border border-black/5 dark:border-white/5 p-lg rounded-lg select-none">
        <div className="relative w-20 h-20 rounded-full border-4 border-apple-primary/10 flex flex-col items-center justify-center bg-black/5 dark:bg-apple-surface-black/50">
          <Award className="w-4 h-4 text-apple-primary dark:text-apple-primary-on-dark absolute top-2" />
          <span className="text-[20px] font-semibold font-display text-apple-ink dark:text-white mt-xs">
            {gradingResult.score}
            <span className="text-[11px] text-gray-500 dark:text-apple-body-muted font-normal">/100</span>
          </span>
          <span className="text-[9px] font-mono text-gray-500 dark:text-apple-body-muted uppercase tracking-wider">SCORE</span>
        </div>

        <div className="flex flex-col gap-xs flex-1">
          <h4 className="text-[12px] font-mono uppercase tracking-wider text-gray-400 dark:text-apple-body-muted">
            질문 정보
          </h4>
          <p className="text-[14px] font-semibold text-apple-ink dark:text-white">
            {currentQuestion?.title}
          </p>
          <div className="flex gap-[3px] mt-xs">
            {Array.from({ length: 5 }).map((_, i) => {
              const dotsCount = gradingResult.score > 0 ? Math.max(1, Math.round(gradingResult.score / 20)) : 0;
              return (
                <span
                  key={i}
                  className={`w-1 h-1 rounded-full ${
                    i < dotsCount ? "bg-green-500" : "bg-black/10 dark:bg-white/10"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* User Answer */}
      <div className="flex flex-col gap-sm">
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-apple-body-muted border-b border-black/5 dark:border-white/5 pb-xxs select-none">
          나의 답변 (My Answer)
        </h3>
        <div className="text-[15px] text-apple-ink dark:text-apple-body-on-dark leading-relaxed font-body bg-apple-canvas-parchment dark:bg-apple-surface-black/20 p-md rounded-md border border-black/5 dark:border-white/5 whitespace-pre-wrap">
          {gradingResult.userAnswer}
        </div>
      </div>

      {/* Model Answer */}
      <div className="flex flex-col gap-sm">
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-apple-body-muted border-b border-black/5 dark:border-white/5 pb-xxs select-none">
          모범 답안 (Model Answer)
        </h3>
        <div className="text-[15px] text-apple-ink dark:text-apple-body-on-dark leading-relaxed font-body bg-apple-canvas-parchment dark:bg-apple-surface-black/20 p-md rounded-md border border-black/5 dark:border-white/5">
          {currentQuestion?.perfectAnswer ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {normalizeMarkdown(currentQuestion.perfectAnswer)}
            </ReactMarkdown>
          ) : (
            <span className="text-gray-400 dark:text-apple-body-muted italic">모범 답안 정보가 존재하지 않습니다.</span>
          )}
        </div>
      </div>

      {/* Feedback Text */}
      <div className="flex flex-col gap-sm">
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-apple-body-muted border-b border-black/5 dark:border-white/5 pb-xxs select-none">
          평가 피드백 (Evaluation Detail)
        </h3>
        <div className="text-[15px] text-apple-ink dark:text-apple-body-on-dark leading-relaxed font-body bg-apple-canvas-parchment dark:bg-apple-surface-black/20 p-md rounded-md border border-black/5 dark:border-white/5 whitespace-pre-wrap">
          {gradingResult.feedback}
        </div>
      </div>

      {/* Tail Question */}
      {gradingResult.tailQuestion && (
        <div className="bg-apple-primary/5 border border-apple-primary/10 p-md rounded-md">
          <h4 className="font-mono text-[11px] uppercase tracking-wider text-apple-primary dark:text-apple-primary-on-dark mb-xxs select-none">
            추천 꼬리 질문 (Follow-up Question)
          </h4>
          <p className="text-[15px] font-semibold text-apple-ink dark:text-white leading-relaxed">
            " {gradingResult.tailQuestion} "
          </p>
          <p className="text-[12px] text-gray-500 dark:text-apple-body-muted mt-xs select-none">
            이 꼬리 질문에 답변하여 면접 릴레이를 계속 진행하시겠습니까?
          </p>
        </div>
      )}

      {/* Switch Buttons */}
      <div className="flex justify-end gap-sm select-none mt-sm">
        {gradingResult.tailQuestion && (
          <Button
            type="button"
            onClick={onTailQuestion}
            variant="dark-utility"
            size="md"
            className="rounded-pill"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>꼬리 질문 답변하기</span>
          </Button>
        )}

        <Button
          type="button"
          onClick={onNext}
          variant="primary"
          size="md"
        >
          <span>
            {currentQuestionIndex + 1 < sessionData.questions.length
              ? "다음 질문 진행"
              : "최종 성적표 확인"}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
