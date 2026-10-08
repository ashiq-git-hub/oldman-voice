"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const instagramUrl =
    process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/theoldman.keeps";
  const youtubeUrl =
    process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://www.youtube.com/@theoldman_keeps";

  return (
    <header className="w-full max-w-3xl mx-auto px-4 sm:px-8 pt-5 sm:pt-8 pb-4 sm:pb-6 select-none">
      <div className="flex items-baseline justify-between border-b border-rule pb-3.5 sm:pb-5">
        {/* Masthead */}
        <Link
          href="/"
          className="group inline-flex flex-col text-left transition-opacity hover:opacity-85"
        >
          <span className="font-serif text-[1.4rem] sm:text-3xl font-medium tracking-tight text-ink leading-tight">
            theoldman.keeps
          </span>
          <span className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-ink-muted mt-0.5 font-sans">
            daily reflections
          </span>
        </Link>

        {/* Minimal Navigation */}
        <nav aria-label="Main Navigation" className="flex items-center gap-3.5 sm:gap-6">
          <Link
            href="/"
            className={`text-[11px] sm:text-xs tracking-[0.16em] uppercase transition-colors duration-200 py-1 ${
              pathname === "/"
                ? "text-ink font-medium border-b border-ink/40 pb-0.5"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Today
          </Link>
          <Link
            href="/about"
            className={`text-[11px] sm:text-xs tracking-[0.16em] uppercase transition-colors duration-200 py-1 ${
              pathname === "/about"
                ? "text-ink font-medium border-b border-ink/40 pb-0.5"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            About
          </Link>

          {/* Social Icons with Subtle Divider */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-rule/70">
            {/* Instagram Link */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-muted hover:text-ink transition-colors duration-200 py-1 flex items-center"
              title="Instagram @theoldman.keeps"
              aria-label="Instagram profile"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                aria-hidden="true"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" strokeWidth="2" />
              </svg>
            </a>

            {/* YouTube Link */}
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-muted hover:text-ink transition-colors duration-200 py-1 flex items-center"
              title="YouTube @theoldman_keeps"
              aria-label="YouTube channel"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 sm:w-[17px] sm:h-[17px]"
                aria-hidden="true"
              >
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
