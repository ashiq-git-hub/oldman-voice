"use client";

import { useState } from "react";
import { ResponseItem } from "@/types/database";
import PostDownloadModal from "./PostDownloadModal";

interface AdminResponseCardProps {
  response: ResponseItem;
  onDeleted?: (id: string) => void;
  dateStr?: string;
}

export default function AdminResponseCard({
  response,
  onDeleted,
  dateStr,
}: AdminResponseCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const formattedTime = new Date(response.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/responses/${response.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete response");
      }

      if (onDeleted) {
        onDeleted(response.id);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete the response.");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <article className="group py-6 border-b border-rule relative">
      <div className="flex items-start justify-between gap-4">
        {/* The Quote */}
        <div className="flex-1 pr-4">
          <p className="font-serif text-lg sm:text-xl text-ink leading-relaxed whitespace-pre-wrap">
            &ldquo;{response.response}&rdquo;
          </p>

          <div className="mt-3 flex items-center gap-3 text-[11px] text-ink-faint font-sans uppercase tracking-wider">
            <span>received at {formattedTime}</span>
          </div>
        </div>

        {/* Actions (Export Photo & Delete) */}
        <div className="shrink-0 flex items-center gap-2">
          {/* Post Photo Download Button */}
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs uppercase tracking-archive text-ink-muted hover:text-ink hover:bg-[#F3ECE0] border border-rule/70 hover:border-rule rounded-sm transition-all"
            title="Export and download as social photo post"
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
            <span className="hidden sm:inline">Post Photo</span>
            <span>↓</span>
          </button>

          {showConfirm ? (
            <div className="flex items-center gap-2 bg-[#FAF7F0] p-1.5 border border-rule text-xs">
              <span className="text-ink-muted text-[11px]">Remove?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-800 font-medium hover:underline text-[11px] uppercase tracking-wider"
              >
                {isDeleting ? "..." : "Yes"}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="text-ink-faint hover:text-ink text-[11px] uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-brass transition-opacity text-xs uppercase tracking-archive text-ink-faint hover:text-red-800 p-1"
              title="Delete this response from archive"
            >
              delete
            </button>
          )}
        </div>
      </div>

      {/* Social Post Download Modal */}
      <PostDownloadModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        response={response}
        dateStr={dateStr}
      />
    </article>
  );
}
