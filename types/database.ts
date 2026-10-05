export interface Question {
  id: string;
  question: string;
  question_date: string; // YYYY-MM-DD
  is_active: boolean;
  created_at: string;
}

export interface QuestionWithResponseCount extends Question {
  response_count: number;
}

export interface ResponseItem {
  id: string;
  question_id: string;
  response: string;
  created_at: string;
}

export interface SubmissionPayload {
  questionId: string;
  response: string;
  website_url_hp?: string; // Honeypot field (must be empty)
}
