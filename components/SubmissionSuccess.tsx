interface SubmissionSuccessProps {
  onReset: () => void;
}

export default function SubmissionSuccess({ onReset }: SubmissionSuccessProps) {
  return (
    <div className="py-12 sm:py-16 text-center animate-fade-in select-none">
      <div className="w-10 h-px bg-brass mx-auto mb-8 opacity-70" />

      <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal mb-3 tracking-tight">
        It&apos;s somewhere now.
      </h2>

      <p className="font-serif italic text-lg sm:text-xl text-ink-muted mb-10">
        Thank you for saying it.
      </p>

      <div>
        <button
          type="button"
          onClick={onReset}
          className="vintage-btn text-xs tracking-archive uppercase text-ink-muted hover:text-ink pb-1 border-b border-rule hover:border-ink transition-colors duration-200"
        >
          <span>leave another thought</span>
          <span className="arrow-icon ml-1">→</span>
        </button>
      </div>
    </div>
  );
}
