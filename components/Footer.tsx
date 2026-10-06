import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const instagramUrl =
    process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/theoldman.voice";
  const youtubeUrl =
    process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://www.youtube.com/@theoldman_voice";

  return (
    <footer className="w-full max-w-3xl mx-auto px-4 sm:px-8 mt-auto pt-8 sm:pt-16 pb-8 sm:pb-12 text-center select-none">
      <div className="w-10 h-px bg-rule mx-auto mb-5 sm:mb-8" />
      
      <p className="font-serif italic text-base sm:text-lg text-ink-muted mb-4 sm:mb-5">
        &ldquo;Everyone has something to say.&rdquo;
      </p>

      {/* Social Links Row with Proper Centered Alignment */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mb-3">
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-muted hover:text-ink transition-colors duration-200 inline-flex items-center gap-1.5 text-[11px] sm:text-xs tracking-archive uppercase font-sans"
          title="Instagram @theoldman.voice"
          aria-label="Instagram"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
            aria-hidden="true"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" strokeWidth="2" />
          </svg>
          <span>Instagram</span>
        </a>

        <span className="text-rule">·</span>

        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-muted hover:text-ink transition-colors duration-200 inline-flex items-center gap-1.5 text-[11px] sm:text-xs tracking-archive uppercase font-sans"
          title="YouTube @theoldman_voice"
          aria-label="YouTube"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
            aria-hidden="true"
          >
            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
            <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" stroke="none" />
          </svg>
          <span>YouTube</span>
        </a>
      </div>

      {/* Archive and Copyright */}
      <div className="flex items-center justify-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs tracking-archive text-ink-faint uppercase font-sans">
        <span>oldman.voice</span>
        <span>·</span>
        <span>{currentYear}</span>
        <span>·</span>
        <Link
          href="/admin/login"
          className="hover:text-ink transition-colors duration-200"
          title="Private Archive Access"
        >
          Archive
        </Link>
      </div>
    </footer>
  );
}
