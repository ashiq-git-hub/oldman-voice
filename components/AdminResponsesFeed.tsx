"use client";

import { useState } from "react";
import { Question, ResponseItem } from "@/types/database";
import { formatDateString } from "@/components/QuestionCard";
import AdminResponseCard from "./AdminResponseCard";
import AdminCarouselToolbar from "./AdminCarouselToolbar";

interface AdminResponsesFeedProps {
  question: Question | null;
  initialResponses: ResponseItem[];
}

export default function AdminResponsesFeed({
  question,
  initialResponses,
}: AdminResponsesFeedProps) {
  const [responses, setResponses] = useState<ResponseItem[]>(initialResponses);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleDeleted = (id: string) => {
    setResponses((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearAll = async () => {
    if (!question) return;
    setIsDeletingAll(true);
    try {
      const res = await fetch(`/api/admin/questions/${question.id}/responses`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to clear responses");
      setResponses([]);
    } catch (err) {
      console.error(err);
      alert("Failed to clear responses.");
    } finally {
      setIsDeletingAll(false);
      setShowClearConfirm(false);
    }
  };

  if (!question) {
    return (
      <div className="py-16 text-center">
        <h2 className="font-serif text-2xl text-ink font-normal italic">
          No question currently scheduled for today.
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Visit the &ldquo;Questions&rdquo; tab to compose or schedule one.
        </p>
      </div>
    );
  }

  return (
    <section>
      {/* Response Count and Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-rule gap-3">
        <p className="text-xs uppercase tracking-archive text-brass font-medium">
          {responses.length === 1
            ? "1 anonymous response"
            : `${responses.length} anonymous responses`}
        </p>

        {responses.length > 0 && (
          <div>
            {showClearConfirm ? (
              <div className="flex items-center gap-3 text-xs bg-[#FAF7F0] px-3 py-1 border border-rule">
                <span className="text-red-900">Delete all responses for today?</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={isDeletingAll}
                  className="text-red-800 font-semibold uppercase tracking-wider hover:underline"
                >
                  {isDeletingAll ? "..." : "Confirm"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="text-ink-faint uppercase tracking-wider hover:text-ink"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="text-xs uppercase tracking-archive text-ink-faint hover:text-red-800 transition-colors"
              >
                clear all responses
              </button>
            )}
          </div>
        )}
      </div>

      {/* Instagram Carousel Suite Toolbar */}
      <div className="my-5 p-3.5 sm:p-4 bg-[#FAF7F0] border border-rule rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-archive text-brass font-medium block">
            Instagram Carousel Suite
          </span>
          <span className="text-xs text-ink-muted font-serif italic">
            Export question cover, responses, and outro
          </span>
        </div>

        <AdminCarouselToolbar
          question={question}
          responses={responses}
          dateStr={question.question_date ? formatDateString(question.question_date) : undefined}
        />
      </div>

      {/* Response list or empty state */}
      {responses.length === 0 ? (
        <div className="py-16 text-center text-ink-muted">
          <p className="font-serif italic text-lg sm:text-xl">
            The journal sits open. No words have been left for this inquiry yet.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-rule/60">
          {responses.map((item) => (
            <AdminResponseCard
              key={item.id}
              response={item}
              onDeleted={handleDeleted}
              dateStr={
                question?.question_date
                  ? formatDateString(question.question_date)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
