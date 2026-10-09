"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  PostAspectRatio,
  PostImageFormat,
  renderPostToCanvas,
  DEFAULT_WRITES_TEXT,
} from "@/lib/post-card-renderer";
import { formatDateString } from "@/components/QuestionCard";
import { getTodayDateString } from "@/lib/mock-store";

const PRESETS = [
  {
    name: "Short Poem",
    desc: "Tender line breaks",
    text: `I wanted to ask you
if you remembered the rain
that evening on the porch,
but the moment passed
like smoke through fingers.

Sometimes the quietest things
are the ones we carry longest.`,
  },
  {
    name: "Personal Journal",
    desc: "Two quiet paragraphs",
    text: `I used to think growing older meant having all the answers.
Now I realize it just means getting comfortable with having none.

You stop searching for grand reasons and start noticing the afternoon light on the kitchen table instead.`,
  },
  {
    name: "Relatable Reflection",
    desc: "Everyday insight",
    text: `Nobody warns you that the hardest part of letting go isn't the memory itself.

It's the habit of reaching for your phone to share a small thing with someone who isn't there anymore.`,
  },
  {
    name: "Single Thought",
    desc: "Minimalist prose",
    text: `We spend our whole lives trying to be understood, when all we really needed was to be forgiven for being human.`,
  },
];

export default function AdminWritesStudio() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Form State
  const [text, setText] = useState<string>(DEFAULT_WRITES_TEXT);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [aspectRatio, setAspectRatio] = useState<PostAspectRatio>("4:5");
  const [format, setFormat] = useState<PostImageFormat>("image/png");

  // Interaction State
  const [isRendering, setIsRendering] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Formatted Date (e.g. "09 / OCTOBER / 2026")
  const formattedDate = useMemo(() => {
    return formatDateString(selectedDate || getTodayDateString());
  }, [selectedDate]);

  // Text metrics
  const wordCount = useMemo(() => {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [text]);

  const lineCount = useMemo(() => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    return lines.length;
  }, [text]);

  // Fit estimation
  const lengthWarning = useMemo(() => {
    if (wordCount > 180 || lineCount > 22) {
      return {
        level: "danger",
        message: "Text exceeds single-slide capacity. Consider trimming or splitting into multiple slides.",
      };
    }
    if (wordCount > 120 || lineCount > 16) {
      return {
        level: "warning",
        message: "Long entry: Font size will automatically scale down to preserve comfortable reading.",
      };
    }
    return {
      level: "normal",
      message: "Optimal length: Fits beautifully with generous margins and large serif display.",
    };
  }, [wordCount, lineCount]);

  // Render canvas
  const renderCanvas = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsRendering(true);
    try {
      await renderPostToCanvas(canvasRef.current, {
        text: text || " ",
        dateStr: formattedDate,
        aspectRatio,
        cardType: "writes",
        format,
      });
    } catch (err) {
      console.error("Canvas render error:", err);
    } finally {
      setIsRendering(false);
    }
  }, [text, formattedDate, aspectRatio, format]);

  // Trigger render when inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      renderCanvas();
    }, 40);
    return () => clearTimeout(timer);
  }, [renderCanvas]);

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDownloading(true);
    try {
      const extension = format === "image/png" ? "png" : "jpg";
      const cleanDate = (selectedDate || getTodayDateString())
        .replace(/[^a-zA-Z0-9]/g, "-")
        .toLowerCase();

      const filename = `theoldman-keeps-writes-${cleanDate}-${aspectRatio.replace(":", "x")}.${extension}`;

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

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
      {/* Category Masthead */}
      <div className="mb-6 sm:mb-8 pb-5 border-b border-rule">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-px bg-[#745A55] inline-block" />
          <p className="text-[10px] sm:text-[11px] uppercase tracking-archive text-[#745A55] font-semibold">
            Content Category · Original Writing
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal tracking-tight">
              Old Man Writes
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted font-sans mt-1">
              Enter your poems, journal entries, and reflections. Renders finished high-resolution Instagram posts on tactile dusty rose stationery.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] bg-[#E8D3D1] border border-[#C9A3A0] text-[#49332F] rounded-sm font-sans font-medium">
              <span className="w-2 h-2 rounded-full bg-[#C9A3A0]" />
              Dusty Rose Palette (#C9A3A0)
            </span>
          </div>
        </div>
      </div>

      {/* Studio Workspace: Editor + Canvas Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editor Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5 bg-[#FAF7F0] border border-rule p-5 sm:p-6 rounded-sm shadow-sm">
          {/* Date Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="post-date"
                className="text-[11px] uppercase tracking-wider text-ink-faint font-sans font-medium"
              >
                Post Date
              </label>
              <span className="text-[11px] font-serif text-[#745A55]">
                {formattedDate}
              </span>
            </div>
            <input
              id="post-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-xs font-sans px-3 py-2 bg-[#F4EFE6] border border-rule rounded-sm text-ink outline-none focus:border-[#745A55] transition-colors"
            />
          </div>

          {/* Quick Preset Pills */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-ink-faint font-sans mb-1.5 font-medium">
              Quick Inspiration Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setText(preset.text)}
                  className="px-2.5 py-1 text-[11px] font-sans bg-[#F4EFE6] hover:bg-[#EBE4D5] border border-rule/80 hover:border-ink/40 text-ink-muted hover:text-ink rounded-sm transition-all"
                  title={preset.desc}
                >
                  {preset.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setText("")}
                className="px-2 py-1 text-[11px] font-sans text-ink-faint hover:text-red-700 hover:underline transition-colors ml-auto"
                title="Clear writing text"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Writing Editor Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="writing-text"
                className="text-[11px] uppercase tracking-wider text-ink-faint font-sans font-medium"
              >
                Original Writing
              </label>
              <div className="flex items-center gap-2 text-[10px] text-ink-faint font-sans">
                <span>{wordCount} words</span>
                <span>·</span>
                <span>{lineCount} lines</span>
              </div>
            </div>
            <textarea
              id="writing-text"
              rows={9}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or enter your original poem, journal entry, or personal reflection here...&#10;&#10;Punctuation, line breaks, and wording are preserved exactly as entered."
              className="w-full text-sm font-serif p-3 bg-[#F4EFE6] border border-rule rounded-sm text-ink outline-none focus:border-[#745A55] leading-relaxed resize-y min-h-[180px]"
            />
            {/* Dynamic Length Guidance */}
            <div
              className={`mt-2 p-2.5 rounded-sm text-[11px] font-sans leading-relaxed flex items-start gap-2 ${
                lengthWarning.level === "danger"
                  ? "bg-red-50 border border-red-200 text-red-800"
                  : lengthWarning.level === "warning"
                  ? "bg-amber-50 border border-amber-200 text-amber-800"
                  : "bg-[#F3ECE0]/60 border border-rule/70 text-ink-muted"
              }`}
            >
              <span className="text-xs shrink-0">
                {lengthWarning.level === "danger" ? "⚠️" : lengthWarning.level === "warning" ? "ℹ️" : "✓"}
              </span>
              <p>{lengthWarning.message}</p>
            </div>
          </div>

          {/* Aspect Ratio Options */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-ink-faint font-sans mb-1.5 font-medium">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: "4:5" as PostAspectRatio,
                  label: "4:5 Portrait",
                  desc: "1080 × 1350",
                  badge: "Standard",
                },
                {
                  id: "1:1" as PostAspectRatio,
                  label: "1:1 Square",
                  desc: "1080 × 1080",
                  badge: null,
                },
                {
                  id: "9:16" as PostAspectRatio,
                  label: "9:16 Story",
                  desc: "1080 × 1920",
                  badge: null,
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAspectRatio(item.id)}
                  className={`flex flex-col items-start p-2 text-left border rounded-sm transition-all ${
                    aspectRatio === item.id
                      ? "bg-[#E8D3D1] border-[#745A55] text-[#49332F] font-medium shadow-sm ring-1 ring-[#745A55]/20"
                      : "bg-[#FAF7F0] border-rule/80 text-ink-muted hover:border-ink/40 hover:bg-[#F6F1E6]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-sans text-xs">{item.label}</span>
                    {item.badge && (
                      <span className="text-[8px] uppercase tracking-wider bg-[#745A55]/15 text-[#745A55] px-1 py-0.5 rounded-sm font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-ink-faint mt-0.5">
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* File Format Options */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-ink-faint font-sans mb-1.5 font-medium">
              Image Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat("image/png")}
                className={`py-1.5 px-3 text-xs tracking-wider uppercase font-sans border rounded-sm transition-all ${
                  format === "image/png"
                    ? "bg-[#E8D3D1] border-[#745A55] text-[#49332F] font-semibold"
                    : "bg-[#FAF7F0] border-rule/80 text-ink-muted hover:border-ink/40"
                }`}
              >
                PNG (Crisp & Sharp)
              </button>
              <button
                type="button"
                onClick={() => setFormat("image/jpeg")}
                className={`py-1.5 px-3 text-xs tracking-wider uppercase font-sans border rounded-sm transition-all ${
                  format === "image/jpeg"
                    ? "bg-[#E8D3D1] border-[#745A55] text-[#49332F] font-semibold"
                    : "bg-[#FAF7F0] border-rule/80 text-ink-muted hover:border-ink/40"
                }`}
              >
                JPEG (Photo)
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isRendering || isDownloading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#49332F] hover:bg-[#382623] text-[#FAF7F0] text-xs uppercase tracking-archive font-sans transition-colors rounded-sm shadow-md disabled:opacity-50"
            >
              {isDownloading ? (
                <span>Generating high-res PNG...</span>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 text-[#C9A3A0]"
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
                  <span>Download Finished Post (1080 × 1350)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={isRendering}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-transparent border border-rule hover:border-[#745A55] text-[#745A55] hover:text-[#49332F] text-xs uppercase tracking-wider font-sans transition-colors rounded-sm disabled:opacity-50"
            >
              {copied ? (
                <span className="text-[#49332F] font-semibold">✓ Copied to clipboard!</span>
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
                  <span>Copy Image to Clipboard</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live High-Resolution Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-[#E5D7D5]/70 border border-rule/80 rounded-sm p-4 sm:p-8 min-h-[500px] overflow-hidden relative shadow-inner">
          {/* Live rendering status overlay */}
          {isRendering && (
            <div className="absolute inset-0 bg-[#E5D7D5]/80 backdrop-blur-[1px] flex items-center justify-center z-20">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#49332F]">
                <div className="w-3.5 h-3.5 border-2 border-[#745A55] border-t-transparent rounded-full animate-spin" />
                <span>Rendering archival stationery...</span>
              </div>
            </div>
          )}

          {/* Live Canvas Element */}
          <div className="relative flex items-center justify-center w-full">
            <canvas
              ref={canvasRef}
              className="max-h-[78vh] w-auto max-w-full rounded-sm object-contain shadow-2xl ring-1 ring-black/10"
            />
          </div>

          <p className="mt-4 text-[11px] text-[#745A55] tracking-wider uppercase font-sans select-none">
            Live Preview · Cormorant Garamond · Dusty Rose (#C9A3A0)
          </p>
        </div>
      </div>
    </div>
  );
}
