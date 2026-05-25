import type { 
  Question, 
  ApiResponse, 
  InterviewSessionResponse, 
  InterviewHistoryResponse 
} from "../types";

/**
 * Common helper to make HTTP requests and handle errors consistently
 */
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, options);
    let data: ApiResponse<T>;
    
    try {
      data = await res.json();
    } catch (e) {
      throw new Error(`서버 응답을 분석할 수 없습니다. (HTTP ${res.status})`);
    }

    if (!res.ok) {
      throw new Error(data.error || `네트워크 오류가 발생했습니다. (HTTP ${res.status})`);
    }

    if (!data.success) {
      throw new Error(data.error || "요청 처리에 실패했습니다.");
    }

    return data.data;
  } catch (err: any) {
    // Detect generic network connectivity issue
    if (err.name === "TypeError" && err.message === "Failed to fetch") {
      throw new Error("서버와의 연결이 원활하지 않습니다. 네트워크 연결을 확인해 주세요.");
    }
    throw err;
  }
}

export const apiService = {
  /**
   * Fetch random questions for the Concept Handbook
   */
  async getRandomQuestions(category?: string, subject?: string, count: number = 50): Promise<Question[]> {
    let url = `/api/questions/random?count=${count}`;
    if (category) url += `&category=${category}`;
    if (subject) url += `&subject=${subject}`;

    return fetchJson<Question[]>(url);
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

    return fetchJson<Question[]>(url);
  },

  /**
   * Fetch a single question by its ID
   */
  async getQuestion(id: number): Promise<Question> {
    return fetchJson<Question>(`/api/questions/${id}`);
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
    return fetchJson<InterviewSessionResponse>("/api/interviews/sessions", {
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
  },

  /**
   * Submit an answer to the current question
   */
  async submitAnswer(accessKey: string, questionId: number, userAnswer: string): Promise<InterviewHistoryResponse> {
    return fetchJson<InterviewHistoryResponse>(`/api/interviews/sessions/${accessKey}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId,
        userAnswer,
      }),
    });
  },

  /**
   * Fetch session history for reporting
   */
  async getSessionHistory(accessKey: string): Promise<InterviewHistoryResponse[]> {
    return fetchJson<InterviewHistoryResponse[]>(`/api/interviews/sessions/${accessKey}/history`);
  },

  /**
   * Send audio Blob for STT transcription
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append("file", audioBlob, "answer.wav");

    const data = await fetchJson<{ text: string }>("/api/interviews/transcribe", {
      method: "POST",
      body: formData,
    });
    return data.text;
  },

  /**
   * Send interview feedback report via email
   */
  async sendEmailReport(accessKey: string, email: string): Promise<void> {
    await fetchJson<null>(`/api/interviews/sessions/${accessKey}/report/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Subscribe to the daily interview question newsletter
   */
  async subscribeNewsletter(email: string, category: string = "ALL"): Promise<void> {
    await fetchJson<null>("/api/subscriptions/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, category }),
    });
  },

  /**
   * Unsubscribe from the daily interview question newsletter
   */
  async unsubscribeNewsletter(email: string): Promise<void> {
    await fetchJson<null>("/api/subscriptions/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  }
};
