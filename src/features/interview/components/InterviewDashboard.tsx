import React, { useState, useEffect } from "react";
import { SEO } from "../../../components/SEO";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { apiService } from "../../../services/api";
import { InterviewSetup } from "./InterviewSetup";
import { InterviewOngoing } from "./InterviewOngoing";
import { InterviewFeedback } from "./InterviewFeedback";
import { InterviewReport } from "./InterviewReport";
import { getDbSubjectsForKey } from "../../../constants/subjects";
import type { InterviewSessionResponse, InterviewHistoryResponse } from "../../../types";

export const InterviewDashboard: React.FC = () => {
  const [interviewStep, setInterviewStep] = useState<"setup" | "ongoing" | "feedback" | "report">("setup");
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [interviewCategory, setInterviewCategory] = useState<string>("CS");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    "NETWORK", "OS", "DATABASE", "ARCHITECTURE", "ALGORITHM"
  ]);
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [sessionData, setSessionData] = useState<InterviewSessionResponse | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // Portfolio Uploads
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [portfolioText, setPortfolioText] = useState<string>("");

  // STT / State
  const [userAnswerText, setUserAnswerText] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [gradingResult, setGradingResult] = useState<InterviewHistoryResponse | null>(null);

  // Audio Hook
  const { 
    isRecording, 
    audioUrl, 
    audioBlob, 
    startRecording, 
    stopRecording, 
    clearAudio 
  } = useAudioRecorder({
    onTranscriptUpdate: setUserAnswerText
  });
  
  // Tail Question
  const [isHandlingTailQuestion, setIsHandlingTailQuestion] = useState<boolean>(false);
  const [currentTailQuestionText, setCurrentTailQuestionText] = useState<string | null>(null);

  // Report
  const [sessionHistories, setSessionHistories] = useState<InterviewHistoryResponse[]>([]);

  // --- Handlers ---
  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarting(true);
    try {
      let dbSubjects: string[] = [];
      if (interviewCategory !== "PORTFOLIO") {
        selectedSubjects.forEach((key) => {
          dbSubjects = [...dbSubjects, ...getDbSubjectsForKey(key)];
        });
      }

      const data = await apiService.startInterviewSession(
        interviewCategory,
        undefined,
        questionCount,
        interviewCategory === "PORTFOLIO" ? portfolioText : undefined,
        dbSubjects.length > 0 ? dbSubjects : undefined
      );
      setSessionData(data);
      setCurrentQuestionIndex(0);
      setUserAnswerText("");
      clearAudio();
      setGradingResult(null);
      setIsHandlingTailQuestion(false);
      setCurrentTailQuestionText(null);
      setInterviewStep("ongoing");
    } catch (err) {
      console.error("Failed to start session:", err);
      alert("면접 세션을 생성하는 데 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleMicStart = async () => {
    try {
      await startRecording();
    } catch (err) {
      console.error("Mic start error:", err);
      alert("마이크 사용 권한이 없거나 에러가 발생했습니다.");
    }
  };

  const handleMicStop = async () => {
    stopRecording();
  };

  // Trigger transcription when audioBlob is captured
  useEffect(() => {
    let active = true;

    if (audioBlob) {
      Promise.resolve().then(() => {
        if (active) {
          setIsTranscribing(true);
          setTranscribeError(null);
        }
      });

      apiService.transcribeAudio(audioBlob)
        .then((text) => {
          if (!active) return;
          setUserAnswerText(text);
        })
        .catch((err: unknown) => {
          const error = err as Error;
          console.error("Transcribe failed:", error);
          if (active) {
            setTranscribeError(error.message || String(error));
          }
        })
        .finally(() => {
          if (active) setIsTranscribing(false);
        });
    }

    return () => {
      active = false;
    };
  }, [audioBlob]);

  const handleSubmitAnswer = async () => {
    if (!sessionData || !userAnswerText.trim()) return;
    setIsGrading(true);
    const questionId = sessionData.questions[currentQuestionIndex].id;

    try {
      const data = await apiService.submitAnswer(sessionData.accessKey, questionId, userAnswerText);
      setGradingResult(data);
      setInterviewStep("feedback");
    } catch (err) {
      console.error("Answer evaluation failed:", err);
    } finally {
      setIsGrading(false);
    }
  };

  const handleNextQuestion = () => {
    if (!sessionData) return;
    if (currentQuestionIndex + 1 < sessionData.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setUserAnswerText("");
      clearAudio();
      setGradingResult(null);
      setIsHandlingTailQuestion(false);
      setCurrentTailQuestionText(null);
      setInterviewStep("ongoing");
    } else {
      // Session finished
      fetchReportHistories();
    }
  };

  const fetchReportHistories = async () => {
    if (!sessionData) return;
    try {
      const data = await apiService.getSessionHistory(sessionData.accessKey);
      setSessionHistories(data);
      setInterviewStep("report");
    } catch (err) {
      console.error("Failed to load session history:", err);
    }
  };

  const handleTailQuestionFlow = () => {
    if (gradingResult && gradingResult.tailQuestion) {
      setCurrentTailQuestionText(gradingResult.tailQuestion);
      setIsHandlingTailQuestion(true);
      setUserAnswerText("");
      clearAudio();
      setGradingResult(null);
      setInterviewStep("ongoing");
    }
  };

  const handleResetSession = () => {
    setInterviewStep("setup");
    setSessionData(null);
    setSessionHistories([]);
    setUserAnswerText("");
    clearAudio();
    setGradingResult(null);
    setIsHandlingTailQuestion(false);
    setCurrentTailQuestionText(null);
    setPortfolioFile(null);
    setPortfolioText("");
    setSelectedSubjects([
      "NETWORK", "OS", "DATABASE", "ARCHITECTURE", "ALGORITHM"
    ]);
    setInterviewCategory("CS");
  };

  return (
    <div className="flex-1 flex items-center justify-center max-w-[960px] w-full mx-auto px-lg py-xl">
      <SEO title="AI 실시간 모의 면접" />

      <div className="w-full bg-white dark:bg-apple-surface-tile-1/20 border border-black/5 dark:border-white/5 rounded-lg p-lg md:p-xl shadow-md dark:shadow-lg relative overflow-hidden transition-colors duration-200">
        
        {/* --- 1. Setup Form --- */}
        {interviewStep === "setup" && (
          <InterviewSetup
            interviewCategory={interviewCategory}
            onChangeCategory={setInterviewCategory}
            questionCount={questionCount}
            onChangeCount={setQuestionCount}
            selectedSubjects={selectedSubjects}
            onChangeSubjects={setSelectedSubjects}
            portfolioFile={portfolioFile}
            onPortfolioFileChange={(file, text) => {
              setPortfolioFile(file);
              setPortfolioText(text);
            }}
            isStarting={isStarting}
            onSubmit={handleStartInterview}
          />
        )}

        {/* --- 2. Ongoing Interview --- */}
        {interviewStep === "ongoing" && sessionData && (
          <InterviewOngoing
            sessionData={sessionData}
            currentQuestionIndex={currentQuestionIndex}
            isHandlingTailQuestion={isHandlingTailQuestion}
            currentTailQuestionText={currentTailQuestionText}
            isRecording={isRecording}
            audioUrl={audioUrl}
            startRecording={handleMicStart}
            stopRecording={handleMicStop}
            isTranscribing={isTranscribing}
            isGrading={isGrading}
            userAnswerText={userAnswerText}
            onChangeAnswerText={setUserAnswerText}
            onSubmit={handleSubmitAnswer}
            transcribeError={transcribeError}
          />
        )}

        {/* --- 3. AI Feedback --- */}
        {interviewStep === "feedback" && gradingResult && sessionData && (
          <InterviewFeedback
            gradingResult={gradingResult}
            sessionData={sessionData}
            currentQuestionIndex={currentQuestionIndex}
            onTailQuestion={handleTailQuestionFlow}
            onNext={handleNextQuestion}
          />
        )}

        {/* --- 4. Final Report --- */}
        {interviewStep === "report" && (
          <InterviewReport
            sessionData={sessionData}
            sessionHistories={sessionHistories}
            onReset={handleResetSession}
          />
        )}
      </div>
    </div>
  );
};
