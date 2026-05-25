import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { InterviewFeedback } from "./InterviewFeedback";
import type { InterviewHistoryResponse, InterviewSessionResponse } from "../../../types";

const mockGradingResult: InterviewHistoryResponse = {
  id: 1,
  sessionId: 1,
  questionId: 101,
  userAnswer: "This is my custom answer to the question",
  score: 80,
  feedback: "This is detailed feedback on the answer",
  tailQuestion: "This is a follow-up question"
};

const mockSessionData: InterviewSessionResponse = {
  id: 1,
  accessKey: "test-access-key",
  memberId: null,
  createdAt: "2026-05-26T00:00:00Z",
  questions: [
    {
      id: 101,
      category: "Frontend",
      subject: "React",
      title: "State and Props",
      perfectAnswer: "State represents the component-local state, while props are inputs passed down by parent components."
    }
  ]
};

describe("InterviewFeedback Component", () => {
  it("renders the user's answer and the model answer", () => {
    render(
      <InterviewFeedback
        gradingResult={mockGradingResult}
        sessionData={mockSessionData}
        currentQuestionIndex={0}
        onTailQuestion={vi.fn()}
        onNext={vi.fn()}
      />
    );

    // Verify "나의 답변" section header and content are present
    expect(screen.getByText("나의 답변 (My Answer)")).toBeInTheDocument();
    expect(screen.getByText("This is my custom answer to the question")).toBeInTheDocument();

    // Verify "모범 답안" section header and content are present
    expect(screen.getByText("모범 답안 (Model Answer)")).toBeInTheDocument();
    expect(screen.getByText(/State represents the component-local state/)).toBeInTheDocument();
  });
});
