"use client";

import { useState } from "react";
import { QuestionWithResponseCount } from "@/types/database";
import { formatDateString } from "@/components/QuestionCard";
import { getTodayDateString, getOffsetDateString } from "@/lib/mock-store";

interface AdminQuestionManagerProps {
  initialQuestions: QuestionWithResponseCount[];
}

export default function AdminQuestionManager({
  initialQuestions,
}: AdminQuestionManagerProps) {
  const [questions, setQuestions] = useState<QuestionWithResponseCount[]>(initialQuestions);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [questionText, setQuestionText] = useState("");
  const [questionDate, setQuestionDate] = useState(getOffsetDateString(1)); // Default to tomorrow
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const todayStr = getTodayDateString();

  const handleEditClick = (q: QuestionWithResponseCount) => {
    setEditingId(q.id);
    setQuestionText(q.question);
    setQuestionDate(q.question_date);
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setQuestionText("");
    setQuestionDate(getOffsetDateString(1));
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const trimmed = questionText.trim();
    if (!trimmed) {
      setFeedback({ type: "error", message: "Question content cannot be empty." });
      return;
    }

    if (!questionDate) {
      setFeedback({ type: "error", message: "Please select a valid date." });
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        // Update existing question
        const res = await fetch("/api/questions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            question: trimmed,
            question_date: questionDate,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update question.");

        setQuestions((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? { ...item, question: trimmed, question_date: questionDate }
              : item
          )
        );

        setFeedback({ type: "success", message: "Question updated successfully." });
        handleCancelEdit();
      } else {
        // Create new question
        const res = await fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: trimmed,
            question_date: questionDate,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to schedule question.");

        const newQ: QuestionWithResponseCount = {
          ...data.question,
          response_count: 0,
        };

        setQuestions((prev) => [newQ, ...prev].sort((a, b) => b.question_date.localeCompare(a.question_date)));
        setFeedback({ type: "success", message: "New question placed in the schedule." });
        setQuestionText("");
        setQuestionDate(getOffsetDateString(1));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving question.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you wish to remove this question and its responses?")) return;

    try {
      const res = await fetch(`/api/questions?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete question.");

      setQuestions((prev) => prev.filter((q) => q.id !== id));
      if (editingId === id) handleCancelEdit();
    } catch (err) {
      console.error(err);
      alert("Failed to delete question.");
    }
  };

  return (
    <div className="space-y-12">
      {/* Editor Box */}
      <section className="bg-[#FAF7F0] border border-rule p-6 sm:p-8 rounded-sm">
        <div className="border-b border-rule pb-4 mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-ink font-normal">
            {editingId ? "Edit Question" : "Compose Daily Question"}
          </h2>
          <span className="text-[11px] uppercase tracking-archive text-brass font-sans">
            {editingId ? "Revising entry" : "New entry"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="q-date"
                className="block text-xs uppercase tracking-archive text-ink-muted font-sans mb-2"
              >
                Scheduled Date
              </label>
              <input
                id="q-date"
                type="date"
                required
                value={questionDate}
                onChange={(e) => setQuestionDate(e.target.value)}
                className="w-full bg-[#F4F0E7] border border-rule px-4 py-2.5 text-sm text-ink font-sans outline-none focus:border-brass transition-colors rounded-none"
              />
              <span className="text-[11px] text-ink-faint mt-1 block">
                {questionDate === todayStr ? "Scheduled for Today" : questionDate > todayStr ? "Future date" : "Past date"}
              </span>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="q-text"
                className="block text-xs uppercase tracking-archive text-ink-muted font-sans mb-2"
              >
                Inquiry Text
              </label>
              <textarea
                id="q-text"
                required
                rows={3}
                maxLength={1000}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="What is something you hope never changes?"
                className="w-full bg-[#F4F0E7] border border-rule px-4 py-2.5 font-serif text-lg text-ink placeholder:text-ink-faint/50 placeholder:italic outline-none focus:border-brass transition-colors rounded-none"
              />
              <div className="flex justify-between items-center text-[11px] text-ink-faint mt-1">
                <span>Thought-provoking, quiet, and reflective.</span>
                <span>{questionText.length} / 1000</span>
              </div>
            </div>
          </div>

          {feedback && (
            <p
              role="alert"
              className={`text-xs font-sans tracking-wide ${
                feedback.type === "success" ? "text-emerald-800" : "text-red-800"
              }`}
            >
              {feedback.message}
            </p>
          )}

          <div className="flex items-center justify-end gap-4 pt-2 border-t border-rule/50">
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs uppercase tracking-archive text-ink-faint hover:text-ink font-sans"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="vintage-btn px-6 py-2.5 bg-ink text-parchment hover:bg-charcoal active:bg-ink-light disabled:opacity-50 text-xs font-medium tracking-archive uppercase rounded-none transition-all shadow-sm"
            >
              {isSubmitting ? (
                <span>saving inquiry...</span>
              ) : (
                <>
                  <span>{editingId ? "update question" : "save & schedule"}</span>
                  <span className="arrow-icon">→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Questions Registry Table / Cards */}
      <section>
        <div className="flex items-center justify-between border-b border-rule pb-3 mb-4">
          <h3 className="text-xs uppercase tracking-archive text-brass font-medium">
            Scheduled & Past Inquiries ({questions.length})
          </h3>
        </div>

        <div className="space-y-3">
          {questions.map((q) => {
            const isToday = q.question_date === todayStr;
            const isFuture = q.question_date > todayStr;

            return (
              <div
                key={q.id}
                className={`p-5 bg-[#FAF7F0] border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isToday
                    ? "border-brass bg-[#FAF7F0]"
                    : "border-rule hover:border-ink/30"
                }`}
              >
                <div className="space-y-1.5 flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-sans tracking-widest px-2 py-0.5 ${
                        isToday
                          ? "bg-brass/20 text-brass-dark font-semibold"
                          : isFuture
                          ? "bg-olive/15 text-olive-dark"
                          : "bg-ink/5 text-ink-faint"
                      }`}
                    >
                      {isToday ? "Today" : isFuture ? "Scheduled Future" : "Past"}
                    </span>
                    <time className="text-xs font-sans tracking-archive uppercase text-ink-muted">
                      {formatDateString(q.question_date)}
                    </time>
                  </div>

                  <p className="font-serif text-lg text-ink">
                    &ldquo;{q.question}&rdquo;
                  </p>

                  <span className="text-[11px] font-sans tracking-wider text-ink-faint block">
                    {q.response_count} {q.response_count === 1 ? "response" : "responses"}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-rule/50">
                  <button
                    type="button"
                    onClick={() => handleEditClick(q)}
                    className="text-xs uppercase tracking-archive text-ink-muted hover:text-ink font-sans transition-colors"
                  >
                    edit
                  </button>
                  <span className="text-rule">·</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    className="text-xs uppercase tracking-archive text-ink-faint hover:text-red-800 font-sans transition-colors"
                  >
                    delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
