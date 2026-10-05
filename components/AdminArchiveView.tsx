"use client";

import { useState } from "react";
import { QuestionWithResponseCount, ResponseItem } from "@/types/database";
import { formatDateString } from "@/components/QuestionCard";
import AdminResponseCard from "./AdminResponseCard";

interface AdminArchiveViewProps {
  questions: QuestionWithResponseCount[];
}

export default function AdminArchiveView({ questions }: AdminArchiveViewProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    questions[0]?.id || null
  );
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

  const fetchResponses = async (questionId: string) => {
    setSelectedQuestionId(questionId);
    setIsLoadingResponses(true);
    try {
      const res = await fetch(`/api/admin/questions/${questionId}/responses-list`);
      if (res.ok) {
        const data = await res.json();
        setResponses(data.responses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingResponses(false);
    }
  };

  const handleDeletedResponse = (id: string) => {
    setResponses((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      {/* Left List of Past Questions & Dates */}
      <div className="md:col-span-5 space-y-4">
        <h2 className="text-xs uppercase tracking-archive text-brass font-medium border-b border-rule pb-2">
          Chronological Inquiries
        </h2>

        {questions.length === 0 ? (
          <p className="text-sm text-ink-muted italic py-4">No inquiries archived yet.</p>
        ) : (
          <div className="divide-y divide-rule/60">
            {questions.map((q) => {
              const isSelected = q.id === selectedQuestionId;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => fetchResponses(q.id)}
                  className={`w-full text-left py-4 px-3 transition-colors ${
                    isSelected
                      ? "bg-[#FAF7F0] border-l-2 border-brass pl-4"
                      : "hover:bg-[#FAF7F0]/60"
                  }`}
                >
                  <time className="text-[11px] font-sans tracking-archive uppercase text-brass font-medium block">
                    {formatDateString(q.question_date)}
                  </time>
                  <p className="font-serif text-base text-ink line-clamp-2 mt-1">
                    &ldquo;{q.question}&rdquo;
                  </p>
                  <span className="text-[11px] font-sans tracking-wider text-ink-faint mt-1.5 block">
                    {q.response_count} {q.response_count === 1 ? "response" : "responses"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Selected Question's Responses */}
      <div className="md:col-span-7 bg-[#FAF7F0] border border-rule p-6 sm:p-8 rounded-sm">
        {selectedQuestion ? (
          <div>
            <div className="border-b border-rule pb-4 mb-4">
              <time className="text-xs uppercase tracking-archive text-brass font-medium font-sans">
                {formatDateString(selectedQuestion.question_date)}
              </time>
              <h3 className="font-serif text-2xl text-ink font-normal mt-1 leading-snug">
                &ldquo;{selectedQuestion.question}&rdquo;
              </h3>
              <p className="text-xs text-ink-faint uppercase tracking-wider font-sans mt-2">
                {selectedQuestion.response_count} {selectedQuestion.response_count === 1 ? "thought recorded" : "thoughts recorded"}
              </p>
            </div>

            {isLoadingResponses ? (
              <p className="py-8 text-center text-sm font-sans text-ink-faint">
                Opening correspondence...
              </p>
            ) : responses.length === 0 ? (
              <div className="py-12 text-center text-ink-muted">
                <p className="font-serif italic text-base">
                  No responses recorded for this date.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-rule/60">
                {responses.map((resp) => (
                  <AdminResponseCard
                    key={resp.id}
                    response={resp}
                    onDeleted={handleDeletedResponse}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-ink-muted italic text-center py-12">
            Select a date from the archive to read its correspondence.
          </p>
        )}
      </div>
    </div>
  );
}
