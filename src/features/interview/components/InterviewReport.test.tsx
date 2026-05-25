import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InterviewReport } from "./InterviewReport";
import type { InterviewHistoryResponse, InterviewSessionResponse } from "../../../types";

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

const mockSessionHistories: InterviewHistoryResponse[] = [
  {
    id: 1,
    sessionId: 1,
    questionId: 101,
    userAnswer: "This is my custom answer to the question",
    score: 80,
    feedback: "This is detailed feedback on the answer",
    tailQuestion: "This is a follow-up question"
  }
];

describe("InterviewReport Component", () => {
  it("renders the model answer for each question when expanded", async () => {
    render(
      <InterviewReport
        sessionData={mockSessionData}
        sessionHistories={mockSessionHistories}
        onReset={vi.fn()}
      />
    );

    // Accordion should show the question title
    const button = screen.getByRole("button", { name: /State and Props/ });
    expect(button).toBeInTheDocument();

    // Click the button to expand the detail using fireEvent
    fireEvent.click(button);

    // Verify "모범 답안" section header and content are present asynchronously
    const modelAnswerHeader = await screen.findByText("모범 답안");
    expect(modelAnswerHeader).toBeInTheDocument();
    expect(screen.getByText(/State represents the component-local state/)).toBeInTheDocument();
  });
});
