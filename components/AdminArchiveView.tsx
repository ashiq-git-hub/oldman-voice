"use client";

import Link from "next/link";
import { QuestionWithResponseCount } from "@/types/database";
import { formatDateString } from "@/components/QuestionCard";

interface AdminArchiveViewProps {
  questions: QuestionWithResponseCount[];
}

export default function AdminArchiveView({ questions }: AdminArchiveViewProps) {
  return (
    <div className="w-full">
      {questions.length === 0 ? (
        <div className="bg-[#FAF7F0] border border-rule/70 p-12 text-center rounded-sm">
          <p className="font-serif italic text-lg text-ink-muted mb-2">
            No inquiries archived yet.
          </p>
          <p className="text-xs uppercase tracking-wider text-ink-faint font-sans">
            Past questions will appear here once scheduled.
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {questions.map((q) => {
            const hasResponses = q.response_count > 0;
            return (
              <div
                key={q.id}
                className="group bg-[#FAF7F0] border border-rule/80 hover:border-brass/60 p-4 sm:p-7 rounded-sm transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Column: Date & Question */}
                  <div className="flex-1 min-w-0 pr-0 sm:pr-6">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-3 h-px bg-brass inline-block" />
                      <time className="text-[11px] sm:text-xs font-sans tracking-archive uppercase text-brass font-medium">
                        {formatDateString(q.question_date)}
                      </time>
                      {q.is_active && (
                        <span className="ml-1 text-[10px] uppercase tracking-wider bg-brass/15 text-brass px-1.5 py-0.5 rounded-none font-sans font-medium">
                          Active
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/admin/archive/${q.id}`}
                      className="group-hover:text-brass transition-colors duration-200 block"
                    >
                      <h2 className="font-serif text-lg sm:text-2xl text-ink font-normal leading-snug break-words">
                        &ldquo;{q.question}&rdquo;
                      </h2>
                    </Link>

                    {/* Responses Count */}
                    <div className="mt-2.5 flex items-center gap-2 text-xs font-sans">
                      <span
                        className={`font-medium ${
                          hasResponses ? "text-ink" : "text-ink-faint"
                        }`}
                      >
                        {q.response_count}{" "}
                        {q.response_count === 1 ? "response" : "responses"}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Prominent View Button */}
                  <div className="shrink-0 flex items-center justify-start sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-rule/50 w-full sm:w-auto">
                    <Link
                      href={`/admin/archive/${q.id}`}
                      className="vintage-btn inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-ink text-parchment hover:bg-charcoal active:bg-ink-light text-xs font-sans font-medium uppercase tracking-[0.14em] shadow-sm transition-all"
                      title={`View all ${q.response_count} responses for this date`}
                    >
                      <span>View</span>
                      <span className="arrow-icon">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
