import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const instagramUrl =
    process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/theoldman.voice";

  return (
    <footer className="w-full max-w-3xl mx-auto px-4 sm:px-8 mt-auto pt-8 sm:pt-16 pb-8 sm:pb-12 text-center select-none">
      <div className="w-10 h-px bg-rule mx-auto mb-5 sm:mb-8" />
      
      <p className="font-serif italic text-base sm:text-lg text-ink-muted mb-2">
        &ldquo;Everyone has something to say.&rdquo;
      </p>

      <div className="flex items-center justify-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs tracking-archive text-ink-faint uppercase font-sans">
        <span>oldman.voice</span>
        <span>·</span>
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-ink transition-colors duration-200 inline-flex items-center gap-1.5"
          title="Instagram profile"
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
