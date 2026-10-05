"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="w-full max-w-4xl mx-auto px-6 sm:px-8 pt-8 pb-6 select-none">
      <div className="flex items-baseline justify-between border-b border-rule pb-5">
        {/* Masthead */}
        <Link
          href="/"
          className="group inline-flex flex-col text-left transition-opacity hover:opacity-85"
        >
          <span className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink">
            oldman.voice
          </span>
          <span className="text-[10px] tracking-[0.22em] uppercase text-ink-muted -mt-1 font-sans">
            daily private correspondence
          </span>
        </Link>

        {/* Minimal Navigation */}
        <nav aria-label="Main Navigation" className="flex items-center gap-6 sm:gap-8">
          <Link
            href="/"
            className={`text-xs tracking-[0.16em] uppercase transition-colors duration-200 ${
              pathname === "/"
                ? "text-ink font-medium border-b border-ink/40 pb-0.5"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Today
          </Link>
          <Link
            href="/about"
            className={`text-xs tracking-[0.16em] uppercase transition-colors duration-200 ${
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
