export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MOCK_ID_REGEX = /^q-[0-9a-zA-Z_-]+$/;

export function isValidQuestionId(id: unknown): boolean {
  if (typeof id !== "string") return false;
  const trimmed = id.trim();
  return UUID_REGEX.test(trimmed) || MOCK_ID_REGEX.test(trimmed);
}

export function validateResponseSubmission(
  response: unknown,
  honeypot?: unknown
): ValidationResult {
  // Check honeypot: automated spam bots fill invisible fields
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return { valid: false, error: "Automated submission detected." };
  }

  if (typeof response !== "string") {
    return { valid: false, error: "Response must be a text value." };
  }

  const trimmed = response.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Please enter your thoughts before submitting." };
  }

  if (trimmed.length > 2000) {
    return {
      valid: false,
      error: `Responses are limited to 2000 characters. Current length: ${trimmed.length}.`,
    };
  }

  // Basic sanitization: strip zero-width characters and normalize line breaks
  const sanitized = trimmed
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // strip zero-width spaces
    .replace(/\r\n/g, "\n");

  if (sanitized.trim().length === 0) {
    return { valid: false, error: "Please enter non-empty text." };
  }

  return { valid: true, sanitized };
}

export function validateQuestion(
  question: unknown,
  questionDate: unknown
): { valid: boolean; error?: string } {
  if (typeof question !== "string" || question.trim().length === 0) {
    return { valid: false, error: "Question cannot be empty." };
  }

  if (question.trim().length > 1000) {
    return { valid: false, error: "Question cannot exceed 1000 characters." };
  }

  if (typeof questionDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(questionDate)) {
    return { valid: false, error: "Invalid date format. Expected YYYY-MM-DD." };
  }

  return { valid: true };
}
