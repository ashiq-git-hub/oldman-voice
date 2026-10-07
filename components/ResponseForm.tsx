"use client";

import { useState } from "react";
import SubmissionSuccess from "./SubmissionSuccess";

interface ResponseFormProps {
  questionId: string;
}

// Authentic organic torn deckle paper perimeter path
const DECKLE_PAPER_PATH =
  "M 6.0 5.6 L 19.4 6.4 L 32.7 4.4 L 46.1 5.9 L 59.4 4.8 L 72.8 3.0 L 86.1 4.4 L 99.5 6.7 L 112.8 4.1 L 126.2 5.6 L 139.5 4.9 L 152.9 5.2 L 166.2 5.6 L 179.6 5.5 L 192.9 3.5 L 206.3 3.7 L 219.6 5.7 L 233.0 4.6 L 246.3 4.0 L 259.7 5.6 L 273.0 5.1 L 286.4 3.1 L 299.7 5.5 L 313.1 4.9 L 326.4 3.7 L 339.8 6.5 L 353.1 4.8 L 366.5 3.8 L 379.8 5.7 L 393.2 4.7 L 406.5 4.1 L 419.9 4.4 L 433.2 5.0 L 446.6 5.1 L 459.9 6.0 L 473.3 6.9 L 486.6 3.7 L 500.0 3.6 L 513.4 6.6 L 526.7 4.3 L 540.1 3.3 L 553.4 6.2 L 566.8 3.7 L 580.1 5.0 L 593.5 5.5 L 606.8 5.5 L 620.2 3.4 L 633.5 5.9 L 646.9 5.5 L 660.2 3.0 L 673.6 6.7 L 686.9 6.4 L 700.3 4.9 L 713.6 6.2 L 727.0 6.2 L 740.3 4.9 L 753.7 4.0 L 767.0 5.4 L 780.4 3.0 L 793.7 4.2 L 807.1 5.9 L 820.4 3.8 L 833.8 5.1 L 847.1 5.8 L 860.5 4.2 L 873.8 4.2 L 887.2 5.2 L 900.5 5.7 L 913.9 2.9 L 927.2 7.1 L 940.6 6.0 L 953.9 3.1 L 967.3 4.5 L 980.6 6.4 L 994.0 4.3 L 996.4 6.0 L 994.8 14.8 L 990.4 23.6 L 992.1 32.5 L 992.7 41.3 L 997.3 50.1 L 995.8 58.9 L 992.8 67.7 L 990.3 76.5 L 991.9 85.4 L 993.2 94.2 L 996.4 103.0 L 992.0 111.8 L 993.9 120.6 L 992.1 129.5 L 991.4 138.3 L 994.3 147.1 L 993.7 155.9 L 993.4 164.7 L 991.2 173.5 L 992.8 182.4 L 992.1 191.2 L 994.8 200.0 L 997.6 208.8 L 993.9 217.6 L 992.8 226.5 L 993.3 235.3 L 991.9 244.1 L 990.7 252.9 L 994.5 261.7 L 995.3 270.5 L 994.4 279.4 L 990.9 288.2 L 993.3 297.0 L 996.3 305.8 L 997.5 314.6 L 994.0 323.5 L 991.3 332.3 L 991.0 341.1 L 992.9 349.9 L 996.5 358.7 L 997.4 367.5 L 992.5 376.4 L 992.9 385.2 L 991.9 394.0 L 994.0 392.8 L 980.6 394.3 L 967.3 393.7 L 953.9 393.9 L 940.6 393.9 L 927.2 395.1 L 913.9 393.8 L 900.5 392.8 L 887.2 396.1 L 873.8 395.7 L 860.5 392.3 L 847.1 393.8 L 833.8 394.7 L 820.4 393.3 L 807.1 391.8 L 793.7 394.8 L 780.4 395.0 L 767.0 392.0 L 753.7 392.8 L 740.3 396.1 L 727.0 393.7 L 713.6 392.0 L 700.3 394.1 L 686.9 396.3 L 673.6 392.9 L 660.2 393.4 L 646.9 395.4 L 633.5 394.1 L 620.2 393.5 L 606.8 393.3 L 593.5 395.5 L 580.1 394.3 L 566.8 392.9 L 553.4 393.4 L 540.1 395.9 L 526.7 392.8 L 513.4 392.4 L 500.0 393.9 L 486.6 394.7 L 473.3 393.3 L 459.9 392.7 L 446.6 395.2 L 433.2 393.1 L 419.9 393.2 L 406.5 393.9 L 393.2 395.4 L 379.8 392.8 L 366.5 394.5 L 353.1 394.3 L 339.8 393.8 L 326.4 391.9 L 313.1 395.2 L 299.7 396.1 L 286.4 392.9 L 273.0 393.4 L 259.7 395.6 L 246.3 394.8 L 233.0 393.0 L 219.6 393.1 L 206.3 394.2 L 192.9 394.9 L 179.6 393.8 L 166.2 394.8 L 152.9 394.6 L 139.5 392.9 L 126.2 393.8 L 112.8 396.0 L 99.5 395.4 L 86.1 393.5 L 72.8 394.3 L 59.4 394.2 L 46.1 392.8 L 32.7 393.9 L 19.4 395.0 L 6.0 393.7 L 5.7 394.0 L 6.6 385.2 L 2.3 376.4 L 2.9 367.5 L 5.9 358.7 L 8.1 349.9 L 8.4 341.1 L 5.5 332.3 L 6.0 323.5 L 3.0 314.6 L 6.6 305.8 L 10.1 297.0 L 10.2 288.2 L 6.6 279.4 L 5.3 270.5 L 6.5 261.7 L 3.9 252.9 L 7.5 244.1 L 7.9 235.3 L 9.1 226.5 L 6.7 217.6 L 5.3 208.8 L 4.2 200.0 L 3.6 191.2 L 7.6 182.4 L 6.8 173.5 L 7.3 164.7 L 7.6 155.9 L 9.6 147.1 L 3.4 138.3 L 8.9 129.5 L 12.8 120.6 L 9.3 111.8 L 5.7 103.0 L 4.4 94.2 L 5.7 85.4 L 4.2 76.5 L 5.3 67.7 L 8.0 58.9 L 9.2 50.1 L 6.6 41.3 L 4.7 32.5 L 2.7 23.6 L 6.4 14.8 L 9.6 6.0 Z";

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

      {/* Authentic Elevated Old Paper Stationery Container */}
      <div className="relative pt-3 sm:pt-4">
        {/* Physical Corner Lift Shadows behind the paper */}
        <div className="paper-corner-lift paper-corner-lift-left" aria-hidden="true" />
        <div className="paper-corner-lift paper-corner-lift-right" aria-hidden="true" />

        {/* Authentic vintage masking tape pinning the paper to the desk */}
        <div
          className="absolute -top-1 sm:-top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none"
          style={{
            width: "clamp(125px, 22vw, 165px)",
            filter:
              "drop-shadow(0 2px 4px rgba(40, 30, 16, 0.18)) drop-shadow(0 1px 2px rgba(40, 30, 16, 0.12))",
            transform: "translateX(-50%) rotate(-0.7deg)",
          }}
          aria-hidden="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/vintage-tape.png"
            alt=""
            className="w-full h-auto opacity-[0.95] mix-blend-multiply"
            draggable={false}
          />
        </div>

        {/* Elevated Paper Card */}
        <div className="paper-elevated-card relative">
          {/* Scalable Vector Torn Deckle Background with Real Paper Fill & Elevation Drop Shadows */}
          <svg
            viewBox="0 0 1000 400"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            aria-hidden="true"
            style={{
              filter:
                "drop-shadow(0 2px 4px rgba(45, 34, 18, 0.05)) drop-shadow(0 10px 24px rgba(45, 34, 18, 0.08)) drop-shadow(0 24px 50px rgba(45, 34, 18, 0.06))",
            }}
          >
            <defs>
              <linearGradient id="decklePaperGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FCF8F1" />
                <stop offset="50%" stopColor="#F7F1E5" />
                <stop offset="100%" stopColor="#F1E8D8" />
              </linearGradient>
              <pattern
                id="decklePaperTile"
                patternUnits="userSpaceOnUse"
                width="180"
                height="120"
              >
                <image
                  href="/vintage-paper-tile.png"
                  width="180"
                  height="120"
                  opacity="0.32"
                />
              </pattern>
            </defs>
            {/* Paper Gradient Fill */}
            <path d={DECKLE_PAPER_PATH} fill="url(#decklePaperGrad)" />
            {/* Real Paper Texture Overlay */}
            <path d={DECKLE_PAPER_PATH} fill="url(#decklePaperTile)" />
            {/* Subtle Deckle Border Stroke */}
            <path
              d={DECKLE_PAPER_PATH}
              fill="none"
              stroke="#D7CBBA"
              strokeWidth="1.2"
              strokeOpacity="0.75"
            />
          </svg>

          {/* Real Interactive Content Inside the Paper */}
          <div className="relative z-10 p-5 sm:p-8 pt-7 sm:pt-9 min-h-[160px] sm:min-h-[185px] flex flex-col justify-between">
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              disabled={isSubmitting}
              placeholder="Leave your answer here..."
              maxLength={charLimit}
              rows={4}
              className="w-full bg-transparent resize-none outline-none font-serif text-base sm:text-xl text-ink placeholder:text-ink-faint/65 placeholder:italic leading-relaxed transition-opacity disabled:opacity-50 min-h-[110px] sm:min-h-[135px]"
              aria-label="Your anonymous response"
            />

            {/* Understated bottom status bar */}
            <div className="mt-3 pt-2.5 sm:mt-4 sm:pt-3 border-t border-[#DCD3BC]/70 flex items-center justify-between text-[11px] sm:text-xs text-ink-faint font-sans">
              <span className="tracking-wider">
                {currentLength > 0 ? `${currentLength} / ${charLimit}` : ""}
              </span>

              {currentLength > 1800 && (
                <span className="text-amber-800 font-medium">
                  {charLimit - currentLength} left
                </span>
              )}
            </div>
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
