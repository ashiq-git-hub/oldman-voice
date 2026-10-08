"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  PostAspectRatio,
  PostImageFormat,
  PostCardType,
  renderPostToCanvas,
  DEFAULT_OUTRO_TEXT,
} from "@/lib/post-card-renderer";
import { formatDateString } from "@/components/QuestionCard";

interface PostDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardType?: PostCardType;
  text?: string;
  response?: {
    id: string;
    response: string;
    created_at: string;
  } | null;
  dateStr?: string;
  title?: string;
}

export default function PostDownloadModal({
  isOpen,
  onClose,
  cardType = "response",
  text,
  response,
  dateStr,
  title,
}: PostDownloadModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<PostAspectRatio>("4:5");
  const [format, setFormat] = useState<PostImageFormat>("image/png");
  const [isRendering, setIsRendering] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Editable text state (especially useful for custom outro or custom question)
  const initialText = useMemo(() => {
    if (text) return text;
    if (response) return response.response;
    if (cardType === "outro") return DEFAULT_OUTRO_TEXT;
    return "";
  }, [text, response, cardType]);

  const [currentText, setCurrentText] = useState(initialText);

  // Update text whenever modal opens or props change
  useEffect(() => {
    setCurrentText(initialText);
  }, [initialText]);

  const effectiveDateStr = useMemo(() => {
    if (dateStr && dateStr !== "TODAY") return dateStr;
    if (response?.created_at) {
      try {
        const d = response.created_at.split("T")[0];
        return formatDateString(d);
      } catch {
        // Fallback
      }
    }
    const today = new Date().toISOString().split("T")[0];
    return formatDateString(today);
  }, [dateStr, response?.created_at]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Render canvas whenever inputs change
  const renderCanvas = useCallback(async () => {
    if (!canvasRef.current || !currentText) return;
    setIsRendering(true);
    try {
      await renderPostToCanvas(canvasRef.current, {
        text: currentText,
        dateStr: effectiveDateStr,
        aspectRatio,
        cardType,
        format,
      });
    } catch (err) {
      console.error("Canvas render error:", err);
    } finally {
      setIsRendering(false);
    }
  }, [currentText, effectiveDateStr, aspectRatio, cardType, format]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        renderCanvas();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, renderCanvas]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDownloading(true);
    try {
      const extension = format === "image/png" ? "png" : "jpg";
      const cleanDate = effectiveDateStr.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
      let prefix = "response";
      if (cardType === "question") prefix = "01-theoldman-asks";
      else if (cardType === "outro") prefix = "end-theoldman-keeps";

      const filename = `theoldman-keeps-${cleanDate}-${prefix}-${aspectRatio.replace(":", "x")}.${extension}`;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsDownloading(false);
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          setIsDownloading(false);
        },
        format,
        format === "image/jpeg" ? 0.95 : undefined
      );
    } catch (err) {
      console.error("Download error:", err);
      setIsDownloading(false);
      alert("Failed to download image.");
    }
  };

  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          let pngBlob = blob;
          if (blob.type !== "image/png") {
            const dataUrl = canvas.toDataURL("image/png");
            const res = await fetch(dataUrl);
            pngBlob = await res.blob();
          }
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": pngBlob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2400);
        } catch {
          alert("Image clipboard copying is not supported in this browser.");
        }
      }, "image/png");
    } catch (err) {
      console.error("Clipboard copy error:", err);
    }
  };

  const modalTitle =
    title ||
    (cardType === "question"
      ? "Slide 1: Question Cover Post"
      : cardType === "outro"
      ? "End Slide: Follow & Instruction CTA"
      : "Reader Response Post");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink/75 backdrop-blur-sm animate-fade-in">
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#FAF7F0] border border-rule shadow-2xl rounded-sm overflow-hidden z-10">
        {/* Modal Top Bar */}
        <header className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-rule bg-[#F4EFE6]/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-px bg-brass inline-block" />
              <p className="text-[10px] sm:text-[11px] uppercase tracking-archive text-brass font-medium">
                Instagram Carousel Post Generator
              </p>
            </div>
            <h2 className="font-serif text-lg sm:text-xl text-ink font-normal">
              {modalTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink transition-colors rounded-sm hover:bg-[#EBE4D5]/60"
            title="Close modal (Esc)"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        {/* Modal Body: Controls & Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
          {/* Controls Column */}
          <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
            {/* If question card, allow tweaking line breaks */}
            {cardType === "question" && (
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ink-faint font-sans mb-1 font-medium">
                  Question Text & Line Breaks
                </label>
                <textarea
                  rows={3}
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  className="w-full text-xs font-serif p-2.5 bg-[#F4EFE6] border border-rule rounded-sm text-ink outline-none focus:border-brass leading-relaxed resize-none"
                  placeholder="Enter question text..."
                />
              </div>
            )}

            {/* If outro card, allow quick text adjustments */}
            {cardType === "outro" && (
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ink-faint font-sans mb-1 font-medium">
                  Outro Message
                </label>
                <textarea
                  rows={5}
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  className="w-full text-xs font-serif p-2.5 bg-[#F4EFE6] border border-rule rounded-sm text-ink outline-none focus:border-brass leading-relaxed resize-none"
                />
              </div>
            )}

            {/* Aspect Ratio Options */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ink-faint font-sans mb-2 font-medium">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
                {[
                  {
                    id: "4:5" as PostAspectRatio,
                    label: "4:5 Portrait",
                    desc: "Instagram Feed Post (1080 × 1350)",
                    badge: "Best",
                  },
                  {
                    id: "1:1" as PostAspectRatio,
                    label: "1:1 Square",
                    desc: "Square Post (1080 × 1080)",
                    badge: null,
                  },
                  {
                    id: "9:16" as PostAspectRatio,
                    label: "9:16 Story",
                    desc: "Stories & Reels (1080 × 1920)",
                    badge: null,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAspectRatio(item.id)}
                    className={`flex flex-col items-start p-2.5 sm:p-3 text-left border rounded-sm transition-all ${
                      aspectRatio === item.id
                        ? "bg-[#F3ECE0] border-ink text-ink shadow-sm ring-1 ring-ink/10"
                        : "bg-[#FAF7F0] border-rule/80 text-ink-muted hover:border-ink/50 hover:bg-[#F6F1E6]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-sans text-xs font-medium tracking-wide">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="text-[9px] uppercase tracking-wider bg-brass/20 text-brass px-1.5 py-0.5 rounded-sm font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-ink-faint mt-1 hidden sm:block">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* File Format Options */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ink-faint font-sans mb-2 font-medium">
                Image Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat("image/png")}
                  className={`py-2 px-3 text-xs tracking-wider uppercase font-sans border rounded-sm transition-all ${
                    format === "image/png"
                      ? "bg-[#F3ECE0] border-ink text-ink font-semibold"
                      : "bg-[#FAF7F0] border-rule/80 text-ink-muted hover:border-ink/50"
                  }`}
                >
                  PNG (Crisp)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("image/jpeg")}
                  className={`py-2 px-3 text-xs tracking-wider uppercase font-sans border rounded-sm transition-all ${
                    format === "image/jpeg"
                      ? "bg-[#F3ECE0] border-ink text-ink font-semibold"
                      : "bg-[#FAF7F0] border-rule/80 text-ink-muted hover:border-ink/50"
                  }`}
                >
                  JPEG (Photo)
                </button>
              </div>
            </div>

            {/* Information snippet */}
            <div className="bg-[#F4EFE6]/70 border border-rule/70 p-3 rounded-sm text-[11px] text-ink-muted leading-relaxed">
              <p className="font-serif italic text-xs text-ink mb-1">
                Archival Linen Stationery
              </p>
              <p>
                Renders with authentic paper grain and signature typography for your Instagram carousel.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isRendering || isDownloading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-ink text-[#F4EFE6] text-xs uppercase tracking-archive font-sans hover:bg-brass transition-colors rounded-sm shadow-sm disabled:opacity-50"
              >
                {isDownloading ? (
                  <span>Generating image...</span>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
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
                    <span>Download Slide</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                disabled={isRendering}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 bg-transparent border border-rule hover:border-ink text-ink-muted hover:text-ink text-xs uppercase tracking-wider font-sans transition-colors rounded-sm disabled:opacity-50"
              >
                {copied ? (
                  <span className="text-brass font-medium">✓ Copied to clipboard!</span>
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Copy Image</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Canvas Preview Area */}
          <div className="flex-1 flex flex-col items-center justify-center bg-[#EFE9DC]/60 border border-rule/80 rounded-sm p-4 sm:p-6 min-h-[360px] overflow-hidden relative">
            {isRendering && (
              <div className="absolute inset-0 bg-[#EFE9DC]/75 backdrop-blur-[1px] flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-muted">
                  <div className="w-3.5 h-3.5 border-2 border-brass border-t-transparent rounded-full animate-spin" />
                  <span>Preparing stationery...</span>
                </div>
              </div>
            )}

            {/* The Canvas element */}
            <canvas
              ref={canvasRef}
              className="max-h-[58vh] w-auto max-w-full rounded-sm object-contain shadow-xl ring-1 ring-black/5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
