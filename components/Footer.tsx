import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full max-w-3xl mx-auto px-4 sm:px-8 mt-auto pt-8 sm:pt-16 pb-8 sm:pb-12 text-center select-none">
      <div className="w-10 h-px bg-rule mx-auto mb-5 sm:mb-8" />
      
      <p className="font-serif italic text-base sm:text-lg text-ink-muted mb-2">
        &ldquo;Everyone has something to say.&rdquo;
      </p>

      <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs tracking-archive text-ink-faint uppercase font-sans">
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
