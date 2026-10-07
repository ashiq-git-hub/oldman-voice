"use client";

import { useState } from "react";
import Link from "next/link";
import { Question, ResponseItem } from "@/types/database";
import { formatDateString } from "@/components/QuestionCard";
import AdminResponseCard from "./AdminResponseCard";

interface AdminInquiryResponsesViewProps {
  question: Question;
  initialResponses: ResponseItem[];
}

export default function AdminInquiryResponsesView({
  question,
  initialResponses,
}: AdminInquiryResponsesViewProps) {
  const [responses, setResponses] = useState<ResponseItem[]>(initialResponses);

  const handleDeletedResponse = (id: string) => {
    setResponses((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div>
      {/* Return Navigation */}
      <div className="mb-6">
        <Link
          href="/admin/archive"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-archive text-ink-muted hover:text-ink transition-colors pb-1 border-b border-rule hover:border-ink"
        >
          <span>←</span>
          <span>Back to Archive</span>
        </Link>
      </div>

      {/* Inquiry Masthead Card */}
      <section className="bg-[#FAF7F0] border border-rule p-6 sm:p-8 rounded-sm mb-8">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-3.5 h-px bg-brass inline-block" />
          <time className="text-xs uppercase tracking-archive text-brass font-medium font-sans">
            {formatDateString(question.question_date)}
          </time>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink font-normal leading-snug">
          &ldquo;{question.question}&rdquo;
        </h1>

        <div className="mt-4 pt-3 border-t border-rule/60 flex items-center justify-between text-xs font-sans">
          <span className="uppercase tracking-wider text-ink-muted">
            {responses.length}{" "}
            {responses.length === 1 ? "thought recorded" : "thoughts recorded"}
          </span>

          <span className="text-[11px] text-ink-faint tracking-archive uppercase">
            {question.is_active ? "Active inquiry" : "Past archive"}
          </span>
        </div>
      </section>

      {/* Responses Section */}
      <section>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-rule">
          <h2 className="text-xs uppercase tracking-archive text-ink font-medium">
            Reader Correspondence
          </h2>
          <span className="text-xs text-ink-faint font-sans">
            {responses.length} total
          </span>
        </div>

        {responses.length === 0 ? (
          <div className="bg-[#FAF7F0] border border-rule/70 p-12 text-center rounded-sm">
            <p className="font-serif italic text-lg text-ink-muted mb-2">
              No responses recorded for this date.
            </p>
            <p className="text-xs uppercase tracking-wider text-ink-faint font-sans">
              No words were left behind by readers for this inquiry.
            </p>
          </div>
        ) : (
          <div className="bg-[#FAF7F0] border border-rule px-6 sm:px-8 divide-y divide-rule/60 rounded-sm">
            {responses.map((resp) => (
              <AdminResponseCard
                key={resp.id}
                response={resp}
                onDeleted={handleDeletedResponse}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
