import React, { useState } from "react";
import { ChevronDown, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import type { InterviewHistoryResponse, InterviewSessionResponse } from "../../../types";
import { apiService } from "../../../services/api";

interface InterviewReportProps {
  sessionData: InterviewSessionResponse | null;
  sessionHistories: InterviewHistoryResponse[];
  onReset: () => void;
}

export const InterviewReport: React.FC<InterviewReportProps> = ({
  sessionData,
  sessionHistories,
  onReset,
}) => {
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);
  const [emailInput, setEmailInput] = useState<string>("");
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSendEmailReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !sessionData) return;
    setIsSending(true);
    setErrorMsg(null);
    setEmailSent(false);

    try {
      await apiService.sendEmailReport(sessionData.accessKey, emailInput);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000);
      setEmailInput("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "이메일 발송 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  const averageScore = sessionHistories.length > 0
    ? Math.round(sessionHistories.reduce((acc, h) => acc + h.score, 0) / sessionHistories.length)
    : 0;

  const category = sessionData?.questions[0]?.category || "CS";

  return (
    <div className="flex flex-col gap-lg animate-fade-in">
      <header className="border-b border-black/5 dark:border-white/5 pb-md select-none text-center">
        <h2 className="text-[22px] font-semibold text-apple-ink dark:text-white leading-tight font-display tracking-tight">
          면접 종합 보고서 (Session Report)
        </h2>
        <p className="text-[12px] text-gray-500 dark:text-apple-body-muted mt-xxs">
          모의 면접 세션이 무사히 종료되었습니다. 점수 분포와 피드백 요약입니다.
        </p>
      </header>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md select-none">
        <Card className="flex flex-col items-center justify-center text-center p-md">
          <span className="text-[10px] font-mono text-gray-500 dark:text-apple-body-muted uppercase tracking-wider mb-xxs">
            평균 점수
          </span>
          <span className="text-[32px] font-semibold font-display text-apple-ink dark:text-white">
            {averageScore}<span className="text-[16px] text-gray-500 dark:text-apple-body-muted font-normal">/100</span>
          </span>
        </Card>
        
        <Card className="flex flex-col items-center justify-center text-center p-md">
          <span className="text-[10px] font-mono text-gray-500 dark:text-apple-body-muted uppercase tracking-wider mb-xxs">
            총 문항 수
          </span>
          <span className="text-[32px] font-semibold font-display text-apple-ink dark:text-white">
            {sessionHistories.length}개
          </span>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center p-md">
          <span className="text-[10px] font-mono text-gray-500 dark:text-apple-body-muted uppercase tracking-wider mb-xxs">
            분야 (Category)
          </span>
          <span className="text-[32px] font-semibold font-display text-apple-primary dark:text-apple-primary-on-dark uppercase tracking-tight">
            {category}
          </span>
        </Card>
      </div>

      {/* History Accordion List */}
      <div className="flex flex-col gap-xs mt-sm">
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-apple-body-muted select-none">
          문항별 상세 피드백 기록
        </h3>
        <div className="flex flex-col gap-xs">
          {sessionHistories.map((h, index) => {
            const relatedQ = sessionData?.questions.find((q) => q.id === h.questionId);
            const isExpanded = expandedHistoryId === h.id;
            return (
              <Card
                key={h.id}
                className="overflow-hidden p-0"
              >
                <button
                  type="button"
                  onClick={() => setExpandedHistoryId(isExpanded ? null : h.id)}
                  className="w-full text-left p-md flex items-center justify-between gap-md select-none group"
                >
                  <div className="flex items-center gap-md">
                    <span className="w-6 h-6 rounded-full bg-apple-primary/10 border border-apple-primary/20 text-apple-primary dark:text-apple-primary-on-dark flex items-center justify-center font-mono text-xs shrink-0">
                      {index + 1}
                    </span>
                    <h4 className="text-[14px] font-semibold text-apple-ink dark:text-white leading-snug group-hover:text-apple-primary dark:group-hover:text-apple-primary-on-dark transition-colors">
                      {relatedQ?.title || "추가 질문"}
                    </h4>
                  </div>
                  <div className="flex items-center gap-sm shrink-0">
                    <span className="font-mono text-xs font-semibold text-green-600 dark:text-green-500">
                      {h.score}/100
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400 dark:text-apple-body-muted" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-apple-body-muted" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-md bg-apple-canvas-parchment dark:bg-apple-surface-black/40 border-t border-black/5 dark:border-t dark:border-white/5 flex flex-col gap-md text-sm">
                    <div className="flex flex-col gap-xxs">
                      <span className="text-[10px] font-mono text-gray-500 dark:text-apple-body-muted uppercase tracking-wider">
                        나의 답변
                      </span>
                      <p className="text-apple-ink dark:text-apple-body-on-dark leading-relaxed font-body">
                        {h.userAnswer}
                      </p>
                    </div>
                    <div className="flex flex-col gap-xxs">
                      <span className="text-[10px] font-mono text-apple-primary dark:text-apple-primary-on-dark uppercase tracking-wider">
                        AI 분석 피드백
                      </span>
                      <p className="text-gray-500 dark:text-apple-body-muted leading-relaxed font-body whitespace-pre-wrap">
                        {h.feedback}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Email Dispatch Form */}
      <Card className="mt-md border border-black/10 dark:border-white/10 p-lg">
        <form onSubmit={handleSendEmailReport} className="flex flex-col gap-sm select-none">
          <div>
            <h4 className="text-[14px] font-semibold text-apple-ink dark:text-white">
              결과지 이메일로 받아보기
            </h4>
            <p className="text-[12px] text-gray-500 dark:text-apple-body-muted mt-xxs">
              제출한 질문의 AI 피드백을 담은 PDF 리포트와 분석지를 이메일로 받아보실 수 있습니다.
            </p>
          </div>

          <div className="flex gap-xs">
            <input
              type="email"
              placeholder="yourname@domain.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              disabled={isSending}
              className="bg-apple-canvas-parchment dark:bg-apple-surface-black border border-black/10 dark:border-white/10 rounded-md py-sm px-md text-sm text-apple-ink dark:text-white placeholder-gray-400 dark:placeholder-apple-body-muted/50 focus:outline-none focus:border-apple-primary flex-1 transition-all duration-300 ease-out-expo disabled:opacity-55"
            />
            <Button
              type="submit"
              variant="secondary"
              size="md"
              disabled={isSending}
            >
              <span>{isSending ? "발송 중..." : "발송"}</span>
            </Button>
          </div>

          {emailSent && (
            <p className="text-green-600 dark:text-green-500 text-[11px] font-mono animate-fade-in">
              ✓ 입력하신 이메일로 면접 분석 리포트 발송을 완료했습니다. (받은편지함을 확인하세요!)
            </p>
          )}

          {errorMsg && (
            <p className="text-red-600 dark:text-red-500 text-[11px] font-mono animate-fade-in">
              ✗ {errorMsg}
            </p>
          )}
        </form>
      </Card>

      <div className="flex justify-center select-none border-t border-black/5 dark:border-t dark:border-white/5 pt-md mt-sm">
        <Button
          type="button"
          onClick={onReset}
          variant="secondary"
          size="md"
          className="rounded-pill"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>새 모의 면접 시작하기</span>
        </Button>
      </div>
    </div>
  );
};
