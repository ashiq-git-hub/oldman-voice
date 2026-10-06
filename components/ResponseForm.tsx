"use client";

import { useState } from "react";
import SubmissionSuccess from "./SubmissionSuccess";

interface ResponseFormProps {
  questionId: string;
}

export default function ResponseForm({ questionId }: ResponseFormProps) {
  const [response, setResponse] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const charLimit = 2000;
  const currentLength = response.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = response.trim();
    if (!trimmed) {
      setErrorMessage("Please enter your thoughts before submitting.");
      return;
    }

    if (trimmed.length > charLimit) {
      setErrorMessage(`Please keep your response under ${charLimit} characters.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId,
          response: trimmed,
          website_url_hp: honeypot, // Honeypot trap
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to deliver your words. Please try again.");
      }

      // Success: clear input immediately for privacy and reveal confirmation
      setResponse("");
      setIsSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return <SubmissionSuccess onReset={() => setIsSuccess(false)} />;
  }

  return (
    <form onSubmit={handleSubmit} className="w-full mt-6 sm:mt-10">
      {/* Honeypot field (hidden from real users, caught by spam bots) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website_url_hp">Leave empty</label>
        <input
          type="text"
          id="website_url_hp"
          name="website_url_hp"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Stationery response container */}
      <div className="relative">
        <div className="stationery-box p-4 sm:p-8 rounded-sm">
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            disabled={isSubmitting}
            placeholder="Leave your answer here..."
            maxLength={charLimit}
            rows={4}
            className="w-full bg-transparent resize-none outline-none font-serif text-base sm:text-xl text-ink placeholder:text-ink-faint/60 placeholder:italic leading-relaxed transition-opacity disabled:opacity-50 min-h-[120px] sm:min-h-[140px]"
            aria-label="Your anonymous response"
          />

          {/* Understated bottom status bar */}
          <div className="mt-3 pt-2.5 sm:mt-4 sm:pt-3 border-t border-rule/50 flex items-center justify-between text-[11px] sm:text-xs text-ink-faint font-sans">
            <span className="tracking-wider">
              {currentLength > 0 ? `${currentLength} / ${charLimit}` : "strictly anonymous"}
            </span>

            {currentLength > 1800 && (
              <span className="text-amber-800 font-medium">
                {charLimit - currentLength} left
              </span>
            )}
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <p
            role="alert"
            className="mt-2.5 text-xs sm:text-sm text-red-800/90 font-sans tracking-wide text-left pl-1"
          >
            {errorMessage}
          </p>
        )}

        {/* Action button */}
        <div className="mt-4 sm:mt-8 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !response.trim()}
            className="vintage-btn w-full sm:w-auto justify-center group px-6 py-3.5 sm:py-3 bg-ink text-parchment hover:bg-charcoal active:bg-ink-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-parchment disabled:opacity-30 disabled:pointer-events-none rounded-none text-xs font-medium tracking-[0.16em] uppercase shadow-sm"
          >
            {isSubmitting ? (
              <span>placing your words...</span>
            ) : (
              <>
                <span>send anonymously</span>
                <span className="arrow-icon">→</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
