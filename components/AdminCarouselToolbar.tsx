"use client";

import { useState } from "react";
import { Question, ResponseItem } from "@/types/database";
import PostDownloadModal from "./PostDownloadModal";
import { exportFullCarouselZip } from "@/lib/carousel-exporter";
import { formatDateString } from "./QuestionCard";

interface AdminCarouselToolbarProps {
  question: Question | null;
  responses: ResponseItem[];
  dateStr?: string;
}

export default function AdminCarouselToolbar({
  question,
  responses,
  dateStr,
}: AdminCarouselToolbarProps) {
  const [activeModal, setActiveModal] = useState<"question" | "outro" | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipStatus, setZipStatus] = useState("");

  if (!question) return null;

  const effectiveDate =
    dateStr ||
    (question.question_date
      ? formatDateString(question.question_date)
      : formatDateString(new Date().toISOString().split("T")[0]));

  const handleDownloadFullCarousel = async () => {
    setIsZipping(true);
    try {
      await exportFullCarouselZip({
        questionText: question.question,
        dateStr: effectiveDate,
        responses,
        aspectRatio: "4:5", // Gold standard for Instagram carousels
        format: "image/png",
        onProgress: (cur, total, status) => {
          setZipStatus(`${cur}/${total}`);
        },
      });
    } catch (err) {
      console.error("Failed to export full carousel zip:", err);
      alert("Failed to export full carousel zip.");
    } finally {
      setIsZipping(false);
      setZipStatus("");
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 pt-3 sm:pt-0">
        {/* Cover Slide Button */}
        <button
          type="button"
          onClick={() => setActiveModal("question")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-archive text-ink font-medium bg-[#FAF7F0] hover:bg-[#F3ECE0] border border-rule/80 hover:border-ink/50 rounded-sm transition-all shadow-sm"
          title="Download Slide 1: The Old Man Asks (Question Cover)"
        >
          <svg
            className="w-3.5 h-3.5 text-brass"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span>Cover Slide ↓</span>
        </button>

        {/* End Slide Button */}
        <button
          type="button"
          onClick={() => setActiveModal("outro")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-archive text-ink font-medium bg-[#FAF7F0] hover:bg-[#F3ECE0] border border-rule/80 hover:border-ink/50 rounded-sm transition-all shadow-sm"
          title="Download End Slide: Follow & Link in Bio instructions"
        >
          <svg
            className="w-3.5 h-3.5 text-brass"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span>End Slide ↓</span>
        </button>

        {/* Full Carousel Zip Button */}
        <button
          type="button"
          onClick={handleDownloadFullCarousel}
          disabled={isZipping}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-archive text-[#F4EFE6] font-medium bg-ink hover:bg-brass rounded-sm transition-all shadow-sm disabled:opacity-50"
          title="Download complete carousel bundle (.zip) with all slides ordered"
        >
          {isZipping ? (
            <>
              <div className="w-3 h-3 border-2 border-parchment border-t-transparent rounded-full animate-spin" />
              <span>Packaging {zipStatus}...</span>
            </>
          ) : (
            <>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              <span>Full Carousel (.zip) ↓</span>
            </>
          )}
        </button>
      </div>

      {/* Modal for Question Cover */}
      <PostDownloadModal
        isOpen={activeModal === "question"}
        onClose={() => setActiveModal(null)}
        cardType="question"
        text={question.question}
        dateStr={effectiveDate}
      />

      {/* Modal for End Outro */}
      <PostDownloadModal
        isOpen={activeModal === "outro"}
        onClose={() => setActiveModal(null)}
        cardType="outro"
        dateStr={effectiveDate}
      />
    </>
  );
}
