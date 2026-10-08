import { Question, QuestionWithResponseCount, ResponseItem } from "@/types/database";

/**
 * In-memory / local fallback store for seamless local preview
 * when Supabase credentials are not yet configured in .env.local.
 */

export const APP_TIMEZONE =
  process.env.APP_TIMEZONE ||
  process.env.NEXT_PUBLIC_APP_TIMEZONE ||
  "Asia/Kolkata";

/**
 * Returns today's date formatted as YYYY-MM-DD in the app's timezone (default IST / Asia/Kolkata).
 * Guarantees correct midnight rollover across Vercel serverless environments.
 */
export function getTodayDateString(timeZone: string = APP_TIMEZONE): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date());
  } catch {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

/**
 * Returns an offset date formatted as YYYY-MM-DD in the app's timezone (default IST / Asia/Kolkata).
 */
export function getOffsetDateString(daysOffset: number, timeZone: string = APP_TIMEZONE): string {
  const target = new Date(Date.now() + daysOffset * 86400000);
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(target);
  } catch {
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, "0");
    const day = String(target.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

const initialQuestions: Question[] = [
  {
    id: "q-1",
    question: "What is something you wish you had said?",
    question_date: getTodayDateString(),
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "q-2",
    question: "When did you last feel completely understood?",
    question_date: getOffsetDateString(-1),
    is_active: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "q-3",
    question: "What is something you are slowly learning to let go of?",
    question_date: getOffsetDateString(-2),
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "q-4",
    question: "What is a small thing that always makes your day better?",
    question_date: getOffsetDateString(-3),
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "q-5",
    question: "Who made you feel understood without saying much?",
    question_date: getOffsetDateString(1),
    is_active: true,
    created_at: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: "q-6",
    question: "What is something ordinary that you find beautiful?",
    question_date: getOffsetDateString(2),
    is_active: true,
    created_at: new Date(Date.now() + 86400000 * 2).toISOString(),
  },
];

const initialResponses: ResponseItem[] = [
  {
    id: "r-1",
    question_id: "q-1",
    response: "I think I stayed quiet because I was afraid things would change.",
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "r-2",
    question_id: "q-1",
    response: "Some people leave long before they actually walk away.",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "r-3",
    question_id: "q-1",
    response: "That I forgive you, even if you never asked for it.",
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "r-4",
    question_id: "q-2",
    response: "Sitting on a porch in late October with an old friend, watching the rain without saying a single word.",
    created_at: new Date(Date.now() - 86400000 * 1.2).toISOString(),
  },
  {
    id: "r-5",
    question_id: "q-3",
    response: "The need to be remembered by people who were only passing through.",
    created_at: new Date(Date.now() - 86400000 * 2.1).toISOString(),
  },
];

// Persistent across requests in Node process memory during development
declare global {
  // eslint-disable-next-line no-var
  var __mockQuestions: Question[] | undefined;
  // eslint-disable-next-line no-var
  var __mockResponses: ResponseItem[] | undefined;
}

if (!global.__mockQuestions) {
  global.__mockQuestions = [...initialQuestions];
}
if (!global.__mockResponses) {
  global.__mockResponses = [...initialResponses];
}

export const mockStore = {
  getQuestions(): Question[] {
    return (global.__mockQuestions || []).sort(
      (a, b) => new Date(b.question_date).getTime() - new Date(a.question_date).getTime()
    );
  },

  getTodayQuestion(): Question | null {
    const today = getTodayDateString();
    return (
      (global.__mockQuestions || []).find(
        (q) => q.question_date === today && q.is_active
      ) || null
    );
  },

  getQuestionById(id: string): Question | null {
    return (global.__mockQuestions || []).find((q) => q.id === id) || null;
  },

  getQuestionByDate(dateStr: string): Question | null {
    return (global.__mockQuestions || []).find((q) => q.question_date === dateStr) || null;
  },

  addQuestion(question: string, questionDate: string): Question {
    const newQ: Question = {
      id: "q-" + Date.now(),
      question,
      question_date: questionDate,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    // Replace if exists for date or push
    const idx = (global.__mockQuestions || []).findIndex(
      (q) => q.question_date === questionDate
    );
    if (idx >= 0 && global.__mockQuestions) {
      global.__mockQuestions[idx] = newQ;
    } else {
      global.__mockQuestions?.unshift(newQ);
    }
    return newQ;
  },

  updateQuestion(id: string, question: string, questionDate: string, isActive?: boolean): Question | null {
    const list = global.__mockQuestions || [];
    const item = list.find((q) => q.id === id);
    if (!item) return null;
    item.question = question;
    item.question_date = questionDate;
    if (typeof isActive === "boolean") {
      item.is_active = isActive;
    }
    return item;
  },

  deleteQuestion(id: string): boolean {
    if (!global.__mockQuestions) return false;
    const initialLen = global.__mockQuestions.length;
    global.__mockQuestions = global.__mockQuestions.filter((q) => q.id !== id);
    if (global.__mockResponses) {
      global.__mockResponses = global.__mockResponses.filter((r) => r.question_id !== id);
    }
    return global.__mockQuestions.length < initialLen;
  },

  getQuestionsWithCounts(): QuestionWithResponseCount[] {
    const questions = this.getQuestions();
    const responses = global.__mockResponses || [];
    return questions.map((q) => {
      const count = responses.filter((r) => r.question_id === q.id).length;
      return {
        ...q,
        response_count: count,
      };
    });
  },

  getResponsesForQuestion(questionId: string): ResponseItem[] {
    return (global.__mockResponses || [])
      .filter((r) => r.question_id === questionId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  addResponse(questionId: string, response: string): ResponseItem {
    const newR: ResponseItem = {
      id: "r-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      question_id: questionId,
      response,
      created_at: new Date().toISOString(),
    };
    global.__mockResponses?.unshift(newR);
    return newR;
  },

  deleteResponse(responseId: string): boolean {
    if (!global.__mockResponses) return false;
    const initialLen = global.__mockResponses.length;
    global.__mockResponses = global.__mockResponses.filter((r) => r.id !== responseId);
    return global.__mockResponses.length < initialLen;
  },

  deleteAllResponsesForQuestion(questionId: string): number {
    if (!global.__mockResponses) return 0;
    const initialLen = global.__mockResponses.length;
    global.__mockResponses = global.__mockResponses.filter((r) => r.question_id !== questionId);
    return initialLen - global.__mockResponses.length;
  },
};
