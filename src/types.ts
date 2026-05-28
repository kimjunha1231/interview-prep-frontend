export interface TailQuestion {
  question: string;
  answer: string;
}

export interface ReferenceItem {
  name: string;
  url: string;
}

export interface Question {
  id: number;
  category: string;
  subject: string;
  title: string;
  perfectAnswer: string;
  importance?: number;
  summary?: string;
  explanation?: string;
  caveats?: string;
  tailQuestions?: TailQuestion[];
  references?: ReferenceItem[];
}

export interface QuestionSummary {
  id: number;
  category: string;
  subject: string;
  title: string;
  importance?: number;
  summary?: string;
}


export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ApiError;
}

export interface StartSessionRequest {
  memberId?: number;
  category?: string;
  subject?: string;
  count?: number;
  portfolioText?: string;
}

export interface InterviewSessionResponse {
  id: number;
  accessKey: string;
  memberId: number | null;
  createdAt: string;
  questions: Array<{
    id: number;
    category: string;
    subject: string;
    title: string;
    perfectAnswer: string;
  }>;
}

export interface SubmitAnswerRequest {
  questionId: number;
  userAnswer: string;
}

export interface InterviewHistoryResponse {
  id: number;
  sessionId: number;
  questionId: number;
  userAnswer: string;
  score: number;
  feedback: string;
  tailQuestion: string | null;
}
