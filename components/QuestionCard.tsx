import { Question } from "@/types/database";

interface QuestionCardProps {
  question: Question | null;
}

export function formatDateString(dateStr: string): string {
  try {
    // Parse YYYY-MM-DD safely
    const [year, month, day] = dateStr.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayStr = String(day).padStart(2, "0");
    const monthNames = [
      "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
      "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];
    const monthStr = monthNames[dateObj.getMonth()] || "OCTOBER";
    return `${dayStr} / ${monthStr} / ${year}`;
  } catch {
    return dateStr;
  }
}

export default function QuestionCard({ question }: QuestionCardProps) {
  if (!question) {
    return (
      <div className="py-12 sm:py-16 text-center select-none">
        <p className="text-xs uppercase tracking-archive text-ink-faint mb-4">
          Today
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal italic tracking-tight">
          Today&apos;s question is still being written.
        </h2>
        <p className="mt-4 text-sm text-ink-muted max-w-sm mx-auto font-sans leading-relaxed">
          The ink is still drying. Please return shortly or check back tomorrow morning.
        </p>
      </div>
    );
  }

  const formattedDate = formatDateString(question.question_date);

  return (
    <div className="text-center sm:text-left py-4 sm:py-6">
      {/* Editorial Date Mast */}
      <div className="flex items-center justify-center sm:justify-start gap-3 mb-5">
        <span className="w-4 h-px bg-brass hidden sm:inline-block" />
        <time
          dateTime={question.question_date}
          className="text-xs sm:text-[13px] tracking-archive font-sans text-brass font-medium uppercase"
        >
          {formattedDate}
        </time>
      </div>

      {/* Main Editorial Question */}
      <h1 className="font-serif text-3xl sm:text-5xl md:text-[3.25rem] text-ink font-normal leading-[1.25] sm:leading-[1.2] tracking-tight">
        {question.question}
      </h1>
    </div>
  );
}
