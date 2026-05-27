import React from "react";
import { Mic, Square, Volume2, Send } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import type { InterviewSessionResponse } from "../../../types";

interface InterviewOngoingProps {
  sessionData: InterviewSessionResponse;
  currentQuestionIndex: number;
  isHandlingTailQuestion: boolean;
  currentTailQuestionText: string | null;
  isRecording: boolean;
  audioUrl: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  isTranscribing: boolean;
  isGrading: boolean;
  userAnswerText: string;
  onChangeAnswerText: (text: string) => void;
  onSubmit: () => void;
  transcribeError: string | null;
}

export const InterviewOngoing: React.FC<InterviewOngoingProps> = ({
  sessionData,
  currentQuestionIndex,
  isHandlingTailQuestion,
  currentTailQuestionText,
  isRecording,
  audioUrl,
  startRecording,
  stopRecording,
  isTranscribing,
  isGrading,
  userAnswerText,
  onChangeAnswerText,
  onSubmit,
  transcribeError,
}) => {
  const currentQuestion = sessionData.questions[currentQuestionIndex];

  return (
    <div className="flex flex-col gap-lg">
      {/* Progress Indicator */}
      <div className="flex flex-col gap-xxs select-none">
        <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 dark:text-apple-body-muted uppercase tracking-wider">
          <span>{isHandlingTailQuestion ? "꼬리 질문 릴레이 진행 중" : `질문 ${currentQuestionIndex + 1} / ${sessionData.questions.length}`}</span>
          <span>{Math.round((currentQuestionIndex / sessionData.questions.length) * 100)}% 완료</span>
        </div>
        <div className="h-[2px] w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-apple-primary transition-all duration-500 ease-out-expo"
            style={{ width: `${(currentQuestionIndex / sessionData.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-apple-canvas-parchment dark:bg-apple-surface-black/30 border border-black/5 dark:border-white/5 p-lg rounded-lg flex gap-md items-start">
        <span className="w-7 h-7 rounded-full bg-apple-primary/10 border border-apple-primary/20 text-apple-primary dark:text-apple-primary-on-dark flex items-center justify-center font-mono text-xs font-semibold shrink-0">
          {isHandlingTailQuestion ? "T" : `Q${currentQuestionIndex + 1}`}
        </span>
        <div className="flex flex-col gap-xxs">
          <span className="text-[10px] font-mono text-apple-primary dark:text-apple-primary-on-dark uppercase tracking-widest">
            {currentQuestion.category} // {currentQuestion.subject}
          </span>
          <h3 className="text-[18px] md:text-[20px] font-semibold text-apple-ink dark:text-white leading-snug tracking-tight">
            {isHandlingTailQuestion && currentTailQuestionText
               ? currentTailQuestionText
               : currentQuestion.title}
          </h3>
        </div>
      </div>

      {/* Recording Waveforms */}
      <div className="flex flex-col items-center justify-center py-xl border border-dashed border-black/10 dark:border-white/10 rounded-lg bg-apple-canvas-parchment dark:bg-apple-surface-black/20 gap-md">
        {isRecording ? (
          <div className="flex items-end justify-center gap-xxs h-8 select-none">
            <span className="w-1.5 bg-red-500 rounded-full animate-audio-wave-1 transform origin-bottom" />
            <span className="w-1.5 bg-red-500 rounded-full animate-audio-wave-2 transform origin-bottom" />
            <span className="w-1.5 bg-red-500 rounded-full animate-audio-wave-3 transform origin-bottom" />
            <span className="w-1.5 bg-red-500 rounded-full animate-audio-wave-4 transform origin-bottom" />
            <span className="w-1.5 bg-red-500 rounded-full animate-audio-wave-5 transform origin-bottom" />
          </div>
        ) : (
          <div className="h-8 flex items-center justify-center text-gray-500 dark:text-apple-body-muted text-xs font-mono select-none">
            {isTranscribing ? "음성을 변환 중입니다..." : "마이크 버튼을 눌러 답변을 시작하세요"}
          </div>
        )}

        <div className="flex gap-sm select-none">
          {isRecording ? (
            <button
              type="button"
              onClick={stopRecording}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-300 ease-out-expo shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:scale-95"
              aria-label="녹음 중지"
            >
              <Square className="w-5 h-5 fill-white" />
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              disabled={isTranscribing || isGrading}
              className="w-14 h-14 rounded-full bg-apple-primary hover:bg-apple-primary-focus disabled:bg-apple-surface-tile-1 text-white flex items-center justify-center transition-all duration-300 ease-out-expo shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:scale-95 disabled:scale-100 disabled:opacity-50"
              aria-label="음성 녹음 시작"
            >
              <Mic className="w-6 h-6" />
            </button>
          )}
        </div>

        {audioUrl && !isRecording && (
          <div className="flex items-center gap-xs bg-black/5 dark:bg-apple-surface-tile-1/50 border border-black/5 dark:border-white/5 py-xs px-sm rounded-pill mt-xs select-none">
            <Volume2 className="w-4 h-4 text-gray-500 dark:text-apple-body-muted" />
            <span className="text-[11px] font-mono text-gray-500 dark:text-apple-body-muted">녹음 완료</span>
            <audio src={audioUrl} controls className="h-6 w-40 text-xs focus:outline-none" />
          </div>
        )}
      </div>

      {/* Answer Area */}
      <div className="flex flex-col gap-xs">
        <div className="flex justify-between items-center select-none">
          <label className="text-[11px] font-mono uppercase tracking-wider text-gray-500 dark:text-apple-body-muted">
            답변 내용 (STT 인식결과)
          </label>
          <span className="text-[10px] text-gray-400 dark:text-apple-body-muted font-mono">텍스트를 직접 편집 및 추가 작성할 수 있습니다.</span>
        </div>
        {transcribeError && (
          <div className="text-red-500 dark:text-red-400 text-xs font-sans bg-red-500/5 dark:bg-red-950/20 border border-red-500/10 dark:border-red-900/30 px-md py-sm rounded-md mb-xs">
            ⚠️ STT 변환 실패: {transcribeError}
          </div>
        )}
        <textarea
          value={userAnswerText}
          onChange={(e) => onChangeAnswerText(e.target.value)}
          placeholder="이곳에 마이크 인식 결과가 표시되며 직접 키보드로 수정 및 작성이 가능합니다..."
          className="w-full h-36 bg-apple-canvas-parchment dark:bg-apple-surface-black border border-black/10 dark:border-white/10 rounded-md p-md text-sm text-apple-ink dark:text-white focus:outline-none focus:border-apple-primary transition-all duration-300 ease-out-expo leading-relaxed font-body"
          aria-label="답변 텍스트 수정 상자"
        />
      </div>

      {/* Submission Button */}
      <div className="flex justify-end select-none">
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!userAnswerText.trim() || isGrading || isRecording || isTranscribing}
          variant="primary"
          size="md"
        >
          {isGrading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-apple-ink/30 border-t-apple-ink dark:border-white/30 dark:border-t-white rounded-full animate-spin" />
              <span>AI 채점 분석 중...</span>
            </>
          ) : isTranscribing ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-apple-ink/30 border-t-apple-ink dark:border-white/30 dark:border-t-white rounded-full animate-spin" />
              <span>음성 변환 대기 중...</span>
            </>
          ) : (
            <>
              <span>시니어 AI 답변 제출</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
