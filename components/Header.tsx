"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="w-full max-w-3xl mx-auto px-4 sm:px-8 pt-5 sm:pt-8 pb-4 sm:pb-6 select-none">
      <div className="flex items-baseline justify-between border-b border-rule pb-3.5 sm:pb-5">
        {/* Masthead */}
        <Link
          href="/"
          className="group inline-flex flex-col text-left transition-opacity hover:opacity-85"
        >
          <span className="font-serif text-[1.4rem] sm:text-3xl font-medium tracking-tight text-ink leading-tight">
            oldman.voice
          </span>
          <span className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-ink-muted mt-0.5 font-sans">
            daily reflections
          </span>
        </Link>

        {/* Minimal Navigation */}
        <nav aria-label="Main Navigation" className="flex items-center gap-4 sm:gap-8">
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
        </nav>
      </div>
    </header>
  );
}
