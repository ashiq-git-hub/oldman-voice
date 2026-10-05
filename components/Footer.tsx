import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full max-w-4xl mx-auto px-6 sm:px-8 mt-auto pt-16 pb-12 text-center select-none">
      <div className="w-12 h-px bg-rule mx-auto mb-8" />
      
      <p className="font-serif italic text-base sm:text-lg text-ink-muted mb-2">
        &ldquo;Everyone has something to say.&rdquo;
      </p>

      <div className="flex items-center justify-center gap-2 text-xs tracking-archive text-ink-faint uppercase font-sans">
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
