import type { 
  Question, 
  ApiResponse, 
  InterviewSessionResponse, 
  InterviewHistoryResponse 
} from "../types";

export const apiService = {
  /**
   * Fetch random questions for the Concept Handbook
   */
  async getRandomQuestions(category?: string, subject?: string, count: number = 50): Promise<Question[]> {
    let url = `/api/questions/random?count=${count}`;
    if (category) url += `&category=${category}`;
    if (subject) url += `&subject=${subject}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: ApiResponse<Question[]> = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch questions");
    return data.data;
  },

  /**
   * Fetch all questions (stably sorted) for the Concept Handbook
   */
  async getQuestions(category?: string, subject?: string): Promise<Question[]> {
    let url = "/api/questions";
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (subject) params.append("subject", subject);
    const queryString = params.toString();
    if (queryString) url += "?" + queryString;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: ApiResponse<Question[]> = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch questions");
    return data.data;
  },

  /**
   * Fetch a single question by its ID
   */
  async getQuestion(id: number): Promise<Question> {
    const res = await fetch(`/api/questions/${id}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: ApiResponse<Question> = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch question");
    return data.data;
  },

  /**
   * Create a new interview session
   */
  async startInterviewSession(
    category: string,
    subject?: string,
    count: number = 3,
    portfolioText?: string,
    subjects?: string[]
  ): Promise<InterviewSessionResponse> {
    const res = await fetch("/api/interviews/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        subject: subject || undefined,
        count,
        portfolioText: portfolioText || undefined,
        subjects: subjects || undefined,
      }),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: ApiResponse<InterviewSessionResponse> = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to start interview session");
    return data.data;
  },

  /**
   * Submit an answer to the current question
   */
  async submitAnswer(sessionId: number, questionId: number, userAnswer: string): Promise<InterviewHistoryResponse> {
    const res = await fetch(`/api/interviews/sessions/${sessionId}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId,
        userAnswer,
      }),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: ApiResponse<InterviewHistoryResponse> = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to submit answer");
    return data.data;
  },

  /**
   * Fetch session history for reporting
   */
  async getSessionHistory(sessionId: number): Promise<InterviewHistoryResponse[]> {
    const res = await fetch(`/api/interviews/sessions/${sessionId}/history`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: ApiResponse<InterviewHistoryResponse[]> = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch session history");
    return data.data;
  },

  /**
   * Send audio Blob for STT transcription
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append("file", audioBlob, "answer.wav");

    const res = await fetch("/api/interviews/transcribe", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: ApiResponse<{ text: string }> = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to transcribe audio");
    return data.data.text;
  },

  /**
   * Send interview feedback report via email
   */
  async sendEmailReport(sessionId: number, email: string): Promise<void> {
    const res = await fetch(`/api/interviews/sessions/${sessionId}/report/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: ApiResponse<null> = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to send email report");
  },

  /**
   * Subscribe to the daily interview question newsletter
   */
  async subscribeNewsletter(email: string, category: string = "ALL"): Promise<void> {
    const res = await fetch("/api/subscriptions/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, category }),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: ApiResponse<null> = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to subscribe to newsletter");
  },

  /**
   * Unsubscribe from the daily interview question newsletter
   */
  async unsubscribeNewsletter(email: string): Promise<void> {
    const res = await fetch("/api/subscriptions/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: ApiResponse<null> = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to unsubscribe from newsletter");
  }
};
